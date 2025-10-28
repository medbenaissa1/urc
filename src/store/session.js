import { create } from "zustand";

export const useSession = create((set) => ({
  // Initial state (read token + username)
  token: sessionStorage.getItem("token") || null,
  user: sessionStorage.getItem("username")
    ? { username: sessionStorage.getItem("username"), id: sessionStorage.getItem("user_id") || null }
    : null,

  // Called after login
  setAuth: (token, username, id = null) => {
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("username", username);
    if (id) sessionStorage.setItem("user_id", id);
    set({
      token,
      user: { username, id },
    });
  },

  // Logout
  logout: () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("user_id");
    set({ token: null, user: null });
  },
}));
