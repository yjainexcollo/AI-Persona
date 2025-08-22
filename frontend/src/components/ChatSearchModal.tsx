// Modal for searching through chat history
import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  Box,
  InputBase,
  List,
  ListItem,
  Typography,
  Paper,
  Divider,
  ClickAwayListener,
} from "@mui/material";

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  fileUrl?: string;
  fileType?: string;
  isTyping?: boolean;
  timestamp?: string;
  user_message?: string; // Added for new search logic
  ai_response?: string; // Added for new search logic
}

interface ChatSession {
  session_id: string;
  messages: ChatMessage[];
  date?: string;
}

interface ChatSearchModalProps {
  open: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  onSelect: (result: { session_id: string; msgIdx: number }) => void;
  onStartNewChat: () => void;
}

// Highlight search terms in text
const highlight = (text: string, query: string) => {
  if (!query) return text;
  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi"
  );
  return text.split(regex).map((part, i) =>
    regex.test(part) ? (
      <span key={i} style={{ background: "#ffe082" }}>
        {part}
      </span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
};

const ChatSearchModal: React.FC<ChatSearchModalProps> = ({
  open,
  onClose,
  sessions,
  onSelect,
  onStartNewChat,
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]); // [{session_id, msgIdx, message, date}]
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset search when modal opens
  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Search through chat sessions (robust to different message shapes)
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelected(0);
      return;
    }
    const lower = query.toLowerCase();
    const found: any[] = [];
    const seen = new Set<string>();
    sessions.forEach((session) => {
      (session.messages || []).forEach((msg: any, idx: number) => {
        // Case 1: combined object with user_message / ai_response
        if (
          typeof msg.user_message === "string" ||
          typeof msg.ai_response === "string"
        ) {
          if (
            typeof msg.user_message === "string" &&
            msg.user_message.toLowerCase().includes(lower)
          ) {
            const key = `${session.session_id}-${idx}-user`;
            if (!seen.has(key)) {
              seen.add(key);
              found.push({
                session_id: session.session_id,
                msgIdx: idx,
                message: { text: msg.user_message, sender: "user" },
                date: session.date,
              });
            }
          }
          if (
            typeof msg.ai_response === "string" &&
            msg.ai_response.toLowerCase().includes(lower)
          ) {
            const key = `${session.session_id}-${idx}-ai`;
            if (!seen.has(key)) {
              seen.add(key);
              found.push({
                session_id: session.session_id,
                msgIdx: idx,
                message: { text: msg.ai_response, sender: "ai" },
                date: session.date,
              });
            }
          }
          return;
        }

        // Case 2: standard role/text shape
        const text = typeof msg.text === "string" ? msg.text : "";
        const sender =
          msg.sender === "user" || msg.sender === "ai" ? msg.sender : undefined;
        if (text && text.toLowerCase().includes(lower)) {
          const key = `${session.session_id}-${idx}-${sender || "unknown"}`;
          if (!seen.has(key)) {
            seen.add(key);
            found.push({
              session_id: session.session_id,
              msgIdx: idx,
              message: { text, sender: sender || "user" },
              date: session.date,
            });
          }
        }
      });
    });
    setResults(found);
    setSelected(0);
  }, [query, sessions]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      setSelected((s) => Math.min(s + 1, results.length)); // +1 for new chat option
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setSelected((s) => Math.max(s - 1, 0));
      e.preventDefault();
    } else if (e.key === "Enter") {
      if (selected === 0) {
        onStartNewChat();
        onClose();
      } else if (results[selected - 1]) {
        onSelect(results[selected - 1]);
        onClose();
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1300,
        }}
      >
        <ClickAwayListener onClickAway={onClose}>
          <Paper
            sx={{
              width: { xs: "90vw", sm: 500 },
              maxHeight: 500,
              p: 2,
              outline: "none",
              borderRadius: 3,
              boxShadow: 6,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <InputBase
              inputRef={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search all chats..."
              sx={{
                fontSize: 18,
                px: 1,
                py: 0.5,
                border: "1px solid #e0e0e0",
                borderRadius: 2,
                mb: 1,
                bgcolor: "#fafafa",
              }}
              fullWidth
              autoFocus
            />
            <List sx={{ maxHeight: 320, overflowY: "auto", p: 0 }}>
              {/* Start new chat option */}
              <ListItem
                selected={selected === 0}
                onClick={() => {
                  onStartNewChat();
                  onClose();
                }}
                sx={{
                  bgcolor: selected === 0 ? "#E8ECF2" : undefined,
                  borderRadius: 2,
                  mb: 0.5,
                  cursor: "pointer",
                  alignItems: "center",
                  fontWeight: 600,
                  color: "#2950DA",
                }}
              >
                + Start a new chat
              </ListItem>
              <Divider sx={{ my: 1 }} />
              {results.length === 0 && query.trim() && (
                <ListItem>
                  <Typography color="text.secondary">
                    No results found.
                  </Typography>
                </ListItem>
              )}
              {results.map((result, i) => (
                <ListItem
                  key={result.session_id + "-" + result.msgIdx}
                  selected={selected === i + 1}
                  onClick={() => {
                    onSelect(result);
                    onClose();
                  }}
                  sx={{
                    bgcolor: selected === i + 1 ? "#e0f7fa" : undefined,
                    borderRadius: 2,
                    mb: 0.5,
                    cursor: "pointer",
                    alignItems: "flex-start",
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Session: {result.session_id}{" "}
                      {result.date
                        ? `| ${new Date(result.date).toLocaleString()}`
                        : ""}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        color:
                          result.message.sender === "user"
                            ? "#2950DA"
                            : "#526794",
                      }}
                    >
                      {result.message.sender === "user" ? "You" : "AI"}
                    </Typography>
                    <Typography variant="body1">
                      {highlight(result.message.text, query)}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>
        </ClickAwayListener>
      </Box>
    </Modal>
  );
};

export default ChatSearchModal;
