import { useNavigate } from "react-router-dom";
import { useSession } from "../store/session";

export function Home() {
  const { user, token, logout } = useSession();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();               // clear Zustand + sessionStorage
    navigate("/login");     // redirect to login
  };

  return (
    <div>
      <h2>Bienvenue {user || "invité"} 👋</h2>
      <p>Votre token : {token ? token : "Aucun token trouvé"}</p>
      <button onClick={handleLogout}>Déconnexion</button>
    </div>
  );
}
