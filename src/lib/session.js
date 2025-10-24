import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

/**
 * Extract the connected user from the request headers
 */
export async function getConnectedUser(request) {
  // ✅ Use "authorization" (the standard header name)
  let token = new Headers(request.headers).get("authorization");

  if (!token) return null;

  token = token.replace("Bearer ", "").trim();

  if (!token) return null;

  console.log("Checking token:", token);

  // Try to get the user data stored in Redis
  const user = await redis.get(token);

  if (!user) {
    console.log("No user found for token");
    return null;
  }

  // Redis might return a JSON string → parse if necessary
  const parsedUser = typeof user === "string" ? JSON.parse(user) : user;
  console.log("Got user:", parsedUser.username);

  return parsedUser;
}

/**
 * Verify that the session exists
 */
export async function checkSession(request) {
  const user = await getConnectedUser(request);
  return user || null;
}

/**
 * Return a standard 401 Unauthorized response
 */
export function unauthorizedResponse() {
  const error = { code: "UNAUTHORIZED", message: "Session expired" };
  return new Response(JSON.stringify(error), {
    status: 401,
    headers: { "content-type": "application/json" },
  });
}

/**
 * Helper (if used in Express-style responses)
 */
export function triggerNotConnected(res) {
  res.status(401).json({
    code: "UNAUTHORIZED",
    message: "Session expired",
  });
}
