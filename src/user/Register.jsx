import { useState } from "react";
import { apiFetch } from "../lib/api";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  Divider,
} from "@mui/material";

export function Register() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const username = data.get("login");
    const email = data.get("email");
    const password = data.get("password");

    try {
      await apiFetch("/api/register", {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
      });

      setSuccess("Compte créé avec succès !");
      setError("");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError("Erreur lors de l'inscription. Vérifiez vos champs.");
      setSuccess("");
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        backgroundColor: "background.default",
      }}
    >
      <Paper elevation={0} sx={{ p: 4, width: "100%" }}>
        <Stack spacing={2} alignItems="center">
          <Typography variant="h4" component="h1">
            Créer un compte
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Inscrivez-vous pour accéder à la messagerie.
          </Typography>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
          <Stack spacing={2.5}>
            <TextField
              label="Nom d’utilisateur"
              name="login"
              autoComplete="username"
              required
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
            <TextField
              label="Mot de passe"
              name="password"
              type="password"
              autoComplete="new-password"
              required
            />

            <Button variant="contained" type="submit" size="large">
              S’inscrire
            </Button>
          </Stack>
        </form>

        <Divider sx={{ mt: 2, mb: 1 }} />
        <Stack
          direction="row"
          spacing={0.5}
          justifyContent="center"
          alignItems="center"
          sx={{ mt: 1 }}
        >
          <Typography variant="body2" color="text.secondary">
            Vous avez déjà un compte ?
          </Typography>
          <Button
            variant="text"
            size="small"
            onClick={() => navigate("/login")}
            sx={{
              fontWeight: 600,
              textTransform: "none",
              ml: 0.5,
              color: "primary.main",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Se connecter
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
