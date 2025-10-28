import { useNavigate } from "react-router-dom";
import { useChat } from "../store/chat";
import { useSession } from "../store/session";
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Divider,
} from "@mui/material";

export function UsersList() {
  const navigate = useNavigate();
  const users = useChat((s) => s.users);
  const selectUser = useChat((s) => s.selectUser);
  const selected = useChat((s) => s.selected);
  const currentUserId = useSession((s) => s.user?.id);

  const handleClick = (u) => {
    selectUser(u.user_id);
    navigate(`/messages/user/${u.user_id}`);
  };

  return (
    <Box
      sx={{
        width: 300,
        bgcolor: "background.paper",
        borderRight: "1px solid #e0e0e0",
        overflowY: "auto",
      }}
    >
      <Typography
        variant="h6"
        sx={{ px: 2, py: 2, fontWeight: 600 }}
      >
        Utilisateurs
      </Typography>
      <Divider />
      <List disablePadding>
        {users
          .filter((u) => u.user_id !== currentUserId)
          .map((u) => {
            const isActive = selected?.id === u.user_id;
            return (
              <ListItemButton
                key={u.user_id}
                onClick={() => handleClick(u)}
                selected={isActive}
                sx={{
                  py: 1.5,
                  px: 2,
                  "&.Mui-selected": {
                    bgcolor: "primary.light",
                    color: "primary.contrastText",
                    "&:hover": { bgcolor: "primary.main" },
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar>
                    {u.username?.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={u.username}
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      Dernière connexion : {u.last_login ?? "—"}
                    </Typography>
                  }
                />
              </ListItemButton>
            );
          })}
      </List>
    </Box>
  );
}
