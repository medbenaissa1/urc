import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "./loginApi";
import { useSession } from "../store/session";
import { CustomError } from "../model/CustomError";

export function Login() {
  const [error, setError] = useState({} as CustomError);
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
    <form onSubmit={handleSubmit}>
      <h2>Connexion</h2>
      <input name="login" placeholder="Login" required /><br/>
      <input name="password" placeholder="Mot de passe" type="password" required /><br/>
      <button type="submit">Connexion</button>

      {error.message && <p style={{ color: "red" }}>{error.message}</p>}
    </form>
  );
}
