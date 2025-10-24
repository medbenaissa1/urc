import { useSession } from "../store/session";

export async function apiFetch(path, init = {}) {
  const token = useSession.getState().token;
  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", "application/json");

 
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(path, { ...init, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    const err = new Error(text || res.statusText);
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return null;
  return res.json();
}
