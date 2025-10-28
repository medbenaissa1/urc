import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useChat } from "../store/chat";
import { useSession } from "../store/session";
import { UsersList } from "./UsersList";
import { MessagesList } from "./MessagesList";
import { Box, Divider, IconButton, Tooltip } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";

export function Messenger() {
  const navigate = useNavigate();
  const { userId } = useParams();

  const loadUsers = useChat((s) => s.loadUsers);
  const selectUser = useChat((s) => s.selectUser);
  const startAutoRefresh = useChat((s) => s.startAutoRefresh);
  const stopAutoRefresh = useChat((s) => s.stopAutoRefresh);
  const logout = useSession((s) => s.logout);

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

  const handleLogout = () => {
    stopAutoRefresh();
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "background.default" }}>
      {/* --- Sidebar (Users list + logout) --- */}
      <Box
        sx={{
          width: 280,
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid #e0e0e0",
          bgcolor: "white",
        }}
      >
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          <UsersList />
        </Box>

        {/* Logout button */}
        <Box
          sx={{
            borderTop: "1px solid #eee",
            p: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Tooltip title="Déconnexion">
            <IconButton
              color="error"
              onClick={handleLogout}
              sx={{
                bgcolor: "#fdecea",
                "&:hover": { bgcolor: "#f8d7da" },
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* --- Chat area --- */}
      <Divider orientation="vertical" flexItem />
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <MessagesList />
      </Box>
    </Box>
  );
}
