// src/store/chat.js
import { create } from "zustand";
import { apiFetch } from "../lib/api";
import { useSession } from "./session"; // pour récupérer l'utilisateur connecté

export const useChat = create((set, get) => ({
  // ---- ÉTAT ----
  users: [],
  selected: null, // { type: "user", id: number }
  messages: {}, // { [userId]: [ ...messages ] }
  loadingUsers: false,
  loadingMessages: false,

  // ---- ACTIONS ----

  setUsers: (users) => set({ users }),

  selectUser: (userId) => {
    const id = Number(userId);
    set({ selected: { type: "user", id } });
    const alreadyLoaded = get().messages[id];
    if (!alreadyLoaded) {
      get().loadMessages(id);
    }
  },

  // Charger tous les utilisateurs
  loadUsers: async () => {
    set({ loadingUsers: true });
    try {
      const users = await apiFetch("/api/users");
      set({ users: Array.isArray(users) ? users : [] });
    } catch (err) {
      console.error("Erreur /api/users :", err);
    } finally {
      set({ loadingUsers: false });
    }
  },

  // Charger les messages avec un utilisateur donné
  loadMessages: async (peerId) => {
    set({ loadingMessages: true });
    try {
      const msgs = await apiFetch(`/api/message?peerId=${peerId}`);
      set((state) => ({
        messages: { ...state.messages, [peerId]: msgs || [] },
      }));
    } catch (err) {
      console.error("Erreur /api/message :", err);
    } finally {
      set({ loadingMessages: false });
    }
  },

  // Envoyer un message à un autre utilisateur
  sendMessage: async (to, content) => {
    if (!content?.trim()) return;
    try {
      const msg = await apiFetch("/api/message", {
        method: "POST",
        body: JSON.stringify({ to, content }),
      });
      set((state) => {
        const prev = state.messages[to] || [];
        return { messages: { ...state.messages, [to]: [...prev, msg] } };
      });
    } catch (err) {
      console.error("Erreur lors de l'envoi du message :", err);
    }
  },
}));
