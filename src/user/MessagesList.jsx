// src/user/MessagesList.jsx
import { useEffect, useRef, useState } from "react";
import { useChat } from "../store/chat";
import { useSession } from "../store/session";

export function MessagesList() {
  const { user } = useSession();
  const selected = useChat((s) => s.selected);
  const messages = useChat((s) => s.messages);
  const loadMessages = useChat((s) => s.loadMessages);
  const sendMessage = useChat((s) => s.sendMessage);

  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  // Liste des messages pour l’utilisateur sélectionné
  const list = selected ? messages[selected.id] || [] : [];

  // Charger les messages quand on change d’utilisateur
  useEffect(() => {
    if (selected) loadMessages(selected.id);
  }, [selected, loadMessages]);

  // Auto-scroll en bas
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [list.length]);

  // Envoi du message
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selected) return;
    await sendMessage(selected.id, text.trim());
    setText("");
  };

  if (!selected) {
    return (
      <div style={{ padding: 16 }}>
        <h3>Choisis un utilisateur pour commencer la discussion</h3>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: 12, borderBottom: "1px solid #ddd" }}>
        <strong>Discussion avec {selected.id}</strong>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
        {list.map((m) => {
          const isMine = m.from === user?.id;
          return (
            <div
              key={m.id}
              style={{
                display: "flex",
                justifyContent: isMine ? "flex-end" : "flex-start",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  background: isMine ? "#DCF8C6" : "#eee",
                  padding: "8px 12px",
                  borderRadius: 12,
                  maxWidth: "70%",
                }}
                title={new Date(m.ts).toLocaleString()}
              >
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 2 }}>
                  {isMine ? "Moi" : `Utilisateur #${m.from}`}
                </div>
                <div>{m.content}</div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          gap: 8,
          borderTop: "1px solid #ddd",
          padding: 12,
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Écris ton message…"
          style={{ flex: 1, padding: "8px 10px" }}
        />
        <button type="submit">Envoyer</button>
      </form>
    </div>
  );
}
