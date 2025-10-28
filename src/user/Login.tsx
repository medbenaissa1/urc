import { useState } from "react";
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
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff, Login as LoginIcon } from "@mui/icons-material";
import { loginUser } from "./loginApi";
import { useSession } from "../store/session";
import { CustomError } from "../model/CustomError";

export function Login() {
  const [error, setError] = useState({} as CustomError);
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();
  const setAuth = useSession((state) => state.setAuth);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    loginUser(
      {
        user_id: -1,
        username: data.get("login") as string,
        password: data.get("password") as string,
      },
      (result) => {
        // ✅ Store token and user in Zustand
        setAuth(result.token, result.username);
        // ✅ Redirect to Home
        navigate("/home");
      },
      (loginError: CustomError) => {
        console.error("Login error:", loginError);
        setError(loginError);
      }
    );
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
            Connexion
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Entrez vos identifiants pour accéder à votre espace.
          </Typography>
        </Stack>

        {error?.message && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error.message}
          </Alert>
        )}

        <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
          <Stack spacing={2.5}>
            <TextField
              label="Identifiant"
              name="login"
              autoComplete="username"
              required
            />

            <TextField
              label="Mot de passe"
              name="password"
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Afficher ou masquer le mot de passe"
                      onClick={() => setShowPw((v) => !v)}
                      edge="end"
                    >
                      {showPw ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<LoginIcon />}
            >
              Connexion
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
    Pas encore de compte ?
  </Typography>
  <Button
    variant="text"
    size="small"
    onClick={() => navigate("/register")}
    sx={{
      fontWeight: 600,
      textTransform: "none",
      ml: 0.5,
      color: "primary.main",
      "&:hover": { textDecoration: "underline" },
    }}
  >
    Créer un compte
  </Button>
</Stack>

      </Paper>
    </Container>
  );
}
