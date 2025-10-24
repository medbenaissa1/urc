// src/store/session.js
import { create } from "zustand";

export const useSession = create((set) => ({
  // 🔹 État initial : relit le token et l'utilisateur depuis le sessionStorage
  token: sessionStorage.getItem("token") || null,
  user: sessionStorage.getItem("username")
    ? { username: sessionStorage.getItem("username") }
    : null,

  // 🔹 Appelé après une connexion réussie
  setAuth: (token, username) => {
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("username", username);
    set({ token, user: { username } });
  },

  // 🔹 Déconnexion (efface tout)
  logout: () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("username");
    set({ token: null, user: null });
  },
}));
