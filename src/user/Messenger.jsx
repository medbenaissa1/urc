import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useChat } from "../store/chat";
import { UsersList } from "./UsersList";
import { MessagesList } from "./MessagesList";
import { Box, Divider } from "@mui/material";

export function Messenger() {
  const navigate = useNavigate();
  const { userId } = useParams();

  const loadUsers = useChat((s) => s.loadUsers);
  const selectUser = useChat((s) => s.selectUser);
  const startAutoRefresh = useChat((s) => s.startAutoRefresh);
  const stopAutoRefresh = useChat((s) => s.stopAutoRefresh);

  // Load users on mount
  useEffect(() => {
    (async () => {
      try {
        await loadUsers();
      } catch (e) {
        if (e?.status === 401) navigate("/login", { replace: true });
        else console.error("Erreur /api/users :", e);
      }
    })();
  }, [loadUsers, navigate]);

  // Handle user selection
  useEffect(() => {
    if (userId) {
      selectUser(userId);
      startAutoRefresh(3000);
    }
    return () => stopAutoRefresh();
  }, [userId, selectUser, startAutoRefresh, stopAutoRefresh]);

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "background.default" }}>
      <UsersList />
      <Divider orientation="vertical" flexItem />
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <MessagesList />
      </Box>
    </Box>
  );
}
