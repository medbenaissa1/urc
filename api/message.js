
import Redis from "ioredis";
import crypto from "crypto";
import { checkSession, unauthorizedResponse } from "./lib/session";


export const config = {
  runtime: "nodejs", // ⚠️ must be serverless (not Edge)
};

// Connect to Upstash Redis
const redis = new Redis(process.env.UPSTASH_REDIS_URL);

// Helper to build a conversation key
function convKey(a, b) {
  const [x, y] = [String(a), String(b)].sort();
  return `conv:${x}:${y}`;
}

// Helper to parse request body
async function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(data || "{}"));
      } catch (e) {
        reject(e);
      }
    });
  });
}

export default async function handler(req, res) {
  try {
    const me = await checkSession(req);
    if (!me) {
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }

    // GET — fetch all messages
    if (req.method === "GET") {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const peerId = url.searchParams.get("peerId");
      if (!peerId) return res.status(400).json({ error: "Missing peerId" });

      const key = convKey(me.user_id ?? me.id, peerId);
      const raw = await redis.lrange(key, 0, -1);
      const messages = raw.map((m) => JSON.parse(m)).reverse();

      return res.status(200).json(messages);
    }

    // POST — send message
    if (req.method === "POST") {
      const { to, content } = await readBody(req);
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
      await redis.expire(key, 86400); // 24h

      return res.status(200).json(msg);
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Erreur /api/message:", err);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
}
