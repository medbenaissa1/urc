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
  const startAutoRefresh = useChat((s) => s.startAutoRefresh);
  const stopAutoRefresh = useChat((s) => s.stopAutoRefresh);

  // Load all users at mount
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

  // When URL param changes → select user + start polling
  useEffect(() => {
    if (userId) {
      selectUser(userId);
      startAutoRefresh(3000); // refresh every 3s
    }
    return () => stopAutoRefresh();
  }, [userId, selectUser, startAutoRefresh, stopAutoRefresh]);

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#f9fafb" }}>
      <UsersList />
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <MessagesList />
      </main>
    </div>
  );
}