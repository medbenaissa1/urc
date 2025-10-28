// src/lib/session.js
import { Redis } from "@upstash/redis";
const redis = Redis.fromEnv();

export async function getConnectedUser(request) {
  let token;

  // ✅ Support Edge (Headers) + Node (object)
  if (request?.headers?.get) {
    token = request.headers.get("authorization");
  } else if (request?.headers && typeof request.headers === "object") {
    token = request.headers.authorization || request.headers.Authorization;
  }

  if (!token) return null;

  token = token.replace("Bearer ", "").trim();
  const user = await redis.get(token);
  if (!user) return null;

  return typeof user === "string" ? JSON.parse(user) : user;
}

export async function checkSession(request) {
  const user = await getConnectedUser(request);
  return user || null;
}

export function unauthorizedResponse() {
  const error = { code: "UNAUTHORIZED", message: "Session expired" };
  return new Response(JSON.stringify(error), {
    status: 401,
    headers: { "content-type": "application/json" },
  });
}
