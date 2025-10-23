import { useSession } from "../src/store/session";

export async function apiFetch(path, init = {}) {
  const token = useSession.getState().token;
  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(path, { ...init, headers });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return res.json();
}
