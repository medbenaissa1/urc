import { useEffect, useRef, useState } from "react";
import { useChat } from "../store/chat";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  Stack,
  Avatar,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

export function MessagesList() {
  
  const selected = useChat((s) => s.selected);
  const messages = useChat((s) => s.messages);
  const users = useChat((s) => s.users);
  const loadMessages = useChat((s) => s.loadMessages);
  const sendMessage = useChat((s) => s.sendMessage);

  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);

  const list = selected ? messages[selected.id] || [] : [];

  // find peer username for header/avatars
  const peer =
    selected && Array.isArray(users)
      ? users.find((u) => Number(u.user_id) === Number(selected.id))
      : null;
  const peerName = peer?.username || `Utilisateur #${selected?.id ?? ""}`;
  const peerInitial = (peerName?.[0] || "U").toUpperCase();

  // Load messages when user changes
  useEffect(() => {
    if (selected) loadMessages(selected.id);
  }, [selected, loadMessages]);

  // Auto-scroll down
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [list.length]);

  // Typing indicator
  useEffect(() => {
    if (!text.trim()) {
      setIsTyping(false);
      return;
    }
    setIsTyping(true);
    const t = setTimeout(() => setIsTyping(false), 1500);
    return () => clearTimeout(t);
  }, [text]);

  // Send message
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selected) return;
    await sendMessage(selected.id, text.trim()); // keep your existing logic
    setText("");
  };

  if (!selected) {
    return (
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "text.secondary",
        }}
      >
        <Typography variant="h6">
          Choisis un utilisateur pour commencer la discussion 💬
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderBottom: "1px solid #e0e0e0",
          display: "flex",
          alignItems: "center",
          gap: 2,
          background: "#fff",
        }}
      >
        <Avatar sx={{ bgcolor: "primary.main" }}>{peerInitial}</Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            {peerName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            En ligne récemment
          </Typography>
        </Box>
      </Paper>

      {/* Chat area */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          backgroundColor: "#f8fafc",
        }}
      >
        {list.map((m) => {
          // 💡 Key change: align using selected.id, no need for current user id
          const isMine = Number(m.to) === Number(selected.id);

          return (
            <Stack
              key={m.id}
              direction="row"
              justifyContent={isMine ? "flex-end" : "flex-start"}
              spacing={1}
              alignItems="flex-end"
            >
              {!isMine && (
                <Avatar
                  sx={{
                    bgcolor: "#ddd",
                    width: 28,
                    height: 28,
                    fontSize: 13,
                  }}
                >
                  {peerInitial}
                </Avatar>
              )}

              <Paper
                sx={{
                  px: 2,
                  py: 1.2,
                  borderRadius: 4,
                  maxWidth: "70%",
                  backgroundColor: isMine ? "#0B5FFF" : "#e9ecef",
                  color: isMine ? "white" : "black",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                }}
                title={new Date(m.ts).toLocaleString()}
              >
                {/* optional tiny sender label; hide for mine */}
                {!isMine && (
                  <Typography
                    variant="caption"
                    sx={{ opacity: 0.65, display: "block", mb: 0.5 }}
                  >
                    {peerName}
                  </Typography>
                )}

                <Typography
                  variant="body2"
                  sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                >
                  {m.content}
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    opacity: 0.7,
                    mt: 0.5,
                    textAlign: isMine ? "right" : "left",
                  }}
                >
                  {new Date(m.ts).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Typography>
              </Paper>
            </Stack>
          );
        })}

        {isTyping && (
          <Typography
            variant="caption"
            sx={{
              fontStyle: "italic",
              opacity: 0.6,
              mt: 1,
              pl: 1,
            }}
          >
            Tu es en train d’écrire…
          </Typography>
        )}

        <div ref={bottomRef} />
      </Box>

      {/* Input bar */}
      <Paper
        component="form"
        onSubmit={handleSubmit}
        elevation={3}
        sx={{
          p: 1.2,
          borderTop: "1px solid #e0e0e0",
          display: "flex",
          alignItems: "center",
          gap: 1,
          background: "#fff",
        }}
      >
        <TextField
          placeholder="Écris ton message..."
          variant="outlined"
          size="small"
          fullWidth
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "25px",
            },
          }}
        />
        <IconButton
          type="submit"
          disabled={!text.trim()}
          sx={{
            bgcolor: "primary.main",
            color: "white",
            "&:hover": { bgcolor: "primary.dark" },
            width: 45,
            height: 45,
          }}
        >
          <SendIcon />
        </IconButton>
      </Paper>
    </Box>
  );
}
