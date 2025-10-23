import { create } from "zustand";

export const useSession = create((set) => ({
  token: null,
  user: null,

  setAuth: (token, user) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("token", token);
    }
    set({ token, user });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("token");
    }
    set({ token: null, user: null });
  },
}));
