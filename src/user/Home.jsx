import { useSession } from "../store/session";

export function Home() {
  const { user, logout } = useSession();

  return (
    <div>
      <h1>Welcome {user?.username || "user"} 👋</h1>
      <p>You are now logged in!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
