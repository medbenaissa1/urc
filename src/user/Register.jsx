import { useState } from "react";
import { apiFetch } from "../lib/api";

export function Register() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const username = data.get("login");
    const email = data.get("email");
    const password = data.get("password");

    try {
      const res = await apiFetch("/api/register", {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
      });

      setSuccess("Inscription réussie ! Vous pouvez vous connecter.");
      setError("");
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
