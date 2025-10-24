import { useChat } from "../store/chat";

export function MessagesList() {
  const selected = useChat((s) => s.selected);

  if (!selected) {
    return (
      <div style={{ padding: 16 }}>
        <h3>Choisis un utilisateur pour commencer la discussion</h3>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <h3>Discussion avec l’utilisateur #{selected.id}</h3>
      <p>(Ici, on affichera les messages et un champ d’envoi.)</p>
    </div>
  );
}
