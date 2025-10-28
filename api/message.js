// api/message.js
import { Redis } from "@upstash/redis";
import { checkSession, unauthorizedResponse } from "../src/lib/session.js";
import crypto from "crypto";

export const config = { runtime: "nodejs" };
const redis = Redis.fromEnv();

function convKey(a, b) {
  const [x, y] = [String(a), String(b)].sort();
  return `conv:${x}:${y}`;
}

export default async function handler(req, res) {
  try {
    const me = await checkSession(req);
    if (!me) return res.status(401).json({ error: "Session expired" });

    if (req.method === "GET") {
      const peerId = req.query.peerId;
      if (!peerId) return res.status(400).json({ error: "Missing peerId" });

      const key = convKey(me.user_id ?? me.id, peerId);
      const raw = await redis.lrange(key, 0, -1);

      const messages = raw.map((m) => {
        if (typeof m === "string") {
          try {
            return JSON.parse(m);
          } catch {
            return { invalid: true, raw: m };
          }
        }
        return m;
      }).reverse();

      return res.status(200).json(messages);
    }

    if (req.method === "POST") {
      const { to, content } = req.body; // ✅ simpler
      if (!to || !content?.trim()) {
        return res.status(400).json({ error: "Invalid payload" });
      }

      const msg = {
        id: crypto.randomUUID(),
        from: me.user_id ?? me.id,
        to: Number(to),
        content: content.trim(),
        ts: Date.now(),
      };

      const key = convKey(msg.from, msg.to);
      await redis.lpush(key, JSON.stringify(msg));
      await redis.expire(key, 86400);

      return res.status(200).json(msg);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Error /api/message:", err);
    return res.status(500).json({ error: "SERVER_ERROR", details: err.message });
  }
}
