import { useState } from "react";
import { apiFetch } from "../lib/api";
import { useNavigate } from "react-router-dom";

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



      // redirect after 1.5 s
      setTimeout(() => navigate("/login"), 10);
    } catch (err) {
      setError("Erreur lors de l'inscription. Vérifiez vos champs.");
      setSuccess("");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Créer un compte</h2>
      <input name="login" placeholder="Nom d’utilisateur" required /><br/>
      <input name="email" placeholder="Email" type="email" required /><br/>
      <input name="password" placeholder="Mot de passe" type="password" required /><br/>
      <button type="submit">S'inscrire</button>
      {success && <p style={{ color: "green" }}>{success}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}
