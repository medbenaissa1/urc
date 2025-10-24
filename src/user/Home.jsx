import { useNavigate } from "react-router-dom";
import { useSession } from "../store/session";

export function Home() {
  const { user, token, logout } = useSession();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // 🔹 si user est un objet, on prend sa propriété username
  const username = user?.username || "invité";

  return (
    <div>
      <h2>Bienvenue {username} 👋</h2>
      <p>Votre token : {token ? token : "Aucun token trouvé"}</p>
      <button onClick={handleLogout}>Déconnexion</button>
    </div>
  );
}
