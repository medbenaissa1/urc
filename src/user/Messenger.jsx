import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useChat } from "../store/chat";
import { UsersList } from "./UsersList";
import { MessagesList } from "./MessagesList";

export function Messenger() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const loadUsers = useChat((s) => s.loadUsers);
  const selectUser = useChat((s) => s.selectUser);

  // 1) Charger les utilisateurs
  useEffect(() => {
    (async () => {
      try {
        await loadUsers();
      } catch (e) {
        if (e?.status === 401) {
          navigate("/login", { replace: true });
        } else {
          console.error("Erreur /api/users :", e);
        }
      }
    })();
  }, [loadUsers, navigate]);

  // 2) Synchroniser la sélection depuis l’URL
  useEffect(() => {
    if (userId) {
      selectUser(userId);
    }
  }, [userId, selectUser]);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <UsersList />
      <main style={{ flex: 1 }}>
        <MessagesList />
      </main>
    </div>
  );
}
