import { useNavigate } from "react-router-dom";
import { useSession } from "../store/session";
import { Button, Paper, Stack, Typography, Box } from "@mui/material";

export function Home() {
  const { user, logout } = useSession();
  const navigate = useNavigate();

  const username = user?.username || "invité";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "background.default",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 5,
          px: 6,
          textAlign: "center",
          borderRadius: 6,
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
          background: "#fff",
          maxWidth: 420,
        }}
      >
        <Typography variant="h4" gutterBottom fontWeight={700}>
          Bienvenue {username} 👋
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Heureux de vous revoir sur la messagerie.
        </Typography>

        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="contained"
            size="large"
            sx={{
              textTransform: "none",
              px: 3,
              py: 1.2,
              fontWeight: 600,
              borderRadius: 3,
            }}
            onClick={() => navigate("/messages")}
          >
            Ouvrir la messagerie
          </Button>

          <Button
            variant="outlined"
            color="error"
            size="large"
            sx={{
              textTransform: "none",
              px: 3,
              py: 1.2,
              fontWeight: 500,
              borderRadius: 3,
            }}
            onClick={handleLogout}
          >
            Déconnexion
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
