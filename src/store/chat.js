// src/store/chat.js
import { create } from "zustand";
import { apiFetch } from "../lib/api";
import { useSession } from "./session"; // pour récupérer l'utilisateur connecté

function convKey(a, b) {
  // Clé unique pour identifier une conversation A-B
  const [x, y] = [String(a), String(b)].sort();
  return `conv:${x}:${y}`;
}

export const useChat = create((set, get) => ({
  // ---- ÉTAT ----
  users: [],
  selected: null, // { type: 'user', id: number }
  messages: {}, // { [convKey]: [ ...messages ] }

  // ---- ACTIONS ----
  setUsers: (users) => set({ users }),

  selectUser: (userId) => {
    set({ selected: { type: "user", id: Number(userId) } });
    // Charger les messages de cette conversation s'ils ne le sont pas déjà
    const me = useSession.getState().user;
    if (me) {
      const key = convKey(me.id, userId);
      if (!get().messages[key]) {
        get().loadMessages(userId);
      }
    }
  },

  // 🔹 Charger les utilisateurs
  loadUsers: async () => {
    const users = await apiFetch("/api/users");
    set({ users: Array.isArray(users) ? users : [] });
    return users;
  },

  // 🔹 Charger les messages entre moi et un autre utilisateur
  loadMessages: async (otherUserId) => {
    const me = useSession.getState().user;
    if (!me) return;
    const key = convKey(me.id, otherUserId);

    try {
      const list = await apiFetch(`/api/message?peerId=${otherUserId}`);
      set((state) => ({
        messages: { ...state.messages, [key]: list || [] },
      }));
    } catch (err) {
      console.error("Erreur lors du chargement des messages :", err);
    }
  },

  // 🔹 Envoyer un message
  sendMessage: async (to, content) => {
    const me = useSession.getState().user;
    if (!me || !content.trim()) return;

    try {
      const newMsg = await apiFetch("/api/message", {
        method: "POST",
        body: JSON.stringify({ to, content }),
      });

      const key = convKey(me.id, to);
      set((state) => ({
        messages: {
          ...state.messages,
          [key]: [...(state.messages[key] || []), newMsg],
        },
      }));
    } catch (err) {
      console.error("Erreur lors de l'envoi du message :", err);
    }
  },
}));
