import { create } from "zustand";
import { apiFetch } from "../lib/api";
import { useSession } from "./session"; // get current user

export const useChat = create((set, get) => ({
  // ---- STATE ----
  users: [],
  selected: null, // { type: "user", id: number }
  messages: {}, // { [userId]: [ ...messages ] }
  loadingUsers: false,
  loadingMessages: false,
  _refreshTimer: null,

  // ---- ACTIONS ----

  setUsers: (users) => set({ users }),

  selectUser: (userId) => {
    const id = Number(userId);
    get().stopAutoRefresh?.(); // clear any previous polling
    set({ selected: { type: "user", id } });
    const alreadyLoaded = get().messages[id];
    if (!alreadyLoaded) {
      get().loadMessages(id);
    }
    get().startAutoRefresh?.();
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

  // Envoyer un message à un autre utilisateur (avec rendu optimiste)
  sendMessage: async (to, content) => {
    if (!content?.trim()) return;
    const currentUserId = useSession.getState().user?.id;

    // Optimistic message
    const optimisticMsg = {
      id: Date.now(),
      from: currentUserId,
      to,
      content: content.trim(),
      ts: Date.now(),
      optimistic: true,
    };

    set((state) => ({
      messages: {
        ...state.messages,
        [to]: [...(state.messages[to] || []), optimisticMsg],
      },
    }));

    try {
      const msg = await apiFetch("/api/message", {
        method: "POST",
        body: JSON.stringify({ to, content }),
      });
      // replace optimistic with real one
      set((state) => ({
        messages: {
          ...state.messages,
          [to]: state.messages[to].map((m) =>
            m.id === optimisticMsg.id ? msg : m
          ),
        },
      }));
    } catch (err) {
      console.error("Erreur lors de l'envoi du message :", err);
    }
  },

  // ---- AUTO REFRESH ----
  startAutoRefresh: (intervalMs = 3000) => {
    get().stopAutoRefresh();
    const timer = setInterval(() => {
      const sel = get().selected;
      if (sel) get().loadMessages(sel.id);
    }, intervalMs);
    set({ _refreshTimer: timer });
  },

  stopAutoRefresh: () => {
    const timer = get()._refreshTimer;
    if (timer) clearInterval(timer);
    set({ _refreshTimer: null });
  },

  resetChat: () => set({ users: [], messages: {}, selected: null }),
}));
