import { useNavigate } from "react-router-dom";
import { useChat } from "../store/chat";
import { useSession } from "../store/session";

export function UsersList() {
  const navigate = useNavigate();
  const users = useChat((s) => s.users);
  const selectUser = useChat((s) => s.selectUser);
  const selected = useChat((s) => s.selected);
  const currentUserId = useSession((s) => s.user?.id);

  const handleClick = (u) => {
    selectUser(u.user_id);
    navigate(`/messages/user/${u.user_id}`, { replace: false });
  };

  return (
    <aside style={{ width: 280, borderRight: "1px solid #eee", padding: 12 }}>
      <h3>Utilisateurs</h3>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {users
          .filter((u) => u.user_id !== currentUserId)
          .map((u) => {
            const isActive = selected?.id === u.user_id;
            return (
              <li key={u.user_id} style={{ marginBottom: 6 }}>
                <button
                  onClick={() => handleClick(u)}
                  title={`Dernière connexion : ${u.last_login ?? "N/A"}`}
                  style={{
                    all: "unset",             // enlève le style bouton natif
                    cursor: "pointer",
                    display: "block",
                    width: "100%",
                    padding: "8px 6px",
                    borderRadius: 8,
                    background: isActive ? "#f0f6ff" : "transparent",
                    textAlign: "left",
                  }}
                >
                  <div style={{ fontWeight: 500 }}>{u.username}</div>
                  <small style={{ opacity: 0.7 }}>
                    Dernière connexion : {u.last_login ?? "—"}
                  </small>
                </button>
              </li>
            );
          })}
      </ul>
    </aside>
  );
}
