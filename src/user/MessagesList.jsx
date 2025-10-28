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
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);

  const list = selected ? messages[selected.id] || [] : [];

  // Load messages when user changes
  useEffect(() => {
    if (selected) loadMessages(selected.id);
  }, [selected, loadMessages]);

  // Auto-scroll down
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [list.length]);

  // Typing indicator
  useEffect(() => {
    if (!text.trim()) {
      setIsTyping(false);
      return;
    }
    setIsTyping(true);
    const t = setTimeout(() => setIsTyping(false), 1500);
    return () => clearTimeout(t);
  }, [text]);

  // Send message
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
        <strong>Discussion avec utilisateur #{selected.id}</strong>
      </div>

      <div id="chat-box" style={{ flex: 1, overflowY: "auto", padding: 12 }}>
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
                  background: isMine ? "#4f8ef7" : "#e5e5ea",
                  color: isMine ? "white" : "black",
                  padding: "10px 14px",
                  borderRadius: 18,
                  maxWidth: "70%",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
                }}
                title={new Date(m.ts).toLocaleString()}
              >
                <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 3 }}>
                  {isMine ? "Moi" : `Utilisateur #${m.from}`}
                </div>
                <div>{m.content}</div>
                <div
                  style={{
                    fontSize: 11,
                    opacity: 0.6,
                    marginTop: 4,
                    textAlign: isMine ? "right" : "left",
                  }}
                >
                  {new Date(m.ts).toLocaleTimeString()}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div style={{ fontStyle: "italic", opacity: 0.6, marginBottom: 8 }}>
            Tu es en train d’écrire…
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          gap: 8,
          borderTop: "1px solid #ddd",
          padding: 12,
          background: "white",
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Écris ton message…"
          style={{
            flex: 1,
            padding: "8px 10px",
            borderRadius: 6,
            border: "1px solid #ddd",
          }}
        />
        <button
          type="submit"
          style={{
            background: "#4f8ef7",
            color: "white",
            border: "none",
            padding: "8px 14px",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}
