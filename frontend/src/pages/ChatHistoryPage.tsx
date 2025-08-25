import React, { useState, useEffect } from "react";
import { Container, Box, Typography, Modal, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Header from "../components/discover/Header";
import SearchBar from "../components/discover/SearchBar";
import ChatHistoryTabs from "../components/chatHistory/ChatHistoryTabs";
import ChatHistoryList, {
  type Chat,
} from "../components/chatHistory/ChatHistoryList";
import ConversationSettingsDialog from "../components/ConversationSettingsDialog";
import {
  getPersonas,
  getUserChatSessions,
  toggleConversationArchive,
  createShareableLink,
  getConversations,
  type Persona as BackendPersona,
  type Conversation,
} from "../services/personaService";
import { getAvatarUrl } from "../services/avatarService";

interface ChatMessage {
  persona: string;
  user_message: string;
  ai_response: string;
  timestamp: string;
  session_id?: string;
  archived?: boolean;
}

interface SessionChat {
  conversation_id: string; // Change from session_id to conversation_id
  persona: string;
  last_message: string;
  date: string;
  chats: ChatMessage[];
  archived?: boolean;
  lastTimestamp: string;
  personaId: string;
  sessionId: string;
}

const ChatHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"all" | "archived">("all");
  const [search, setSearch] = useState("");
  const [sessions, setSessions] = useState<SessionChat[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionChat | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [personas, setPersonas] = useState<BackendPersona[]>([]);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);

  useEffect(() => {
    async function fetchPersonas() {
      try {
        const response = await getPersonas();
        setPersonas(response.data || []);
      } catch (error) {
        console.error("Error fetching personas from backend:", error);
        setPersonas([]);
      }
    }
    fetchPersonas();
  }, []);

  // Function to handle opening a specific chat
  const handleOpenChat = async (session: SessionChat) => {
    // Use the persona ID from the session data
    const personaId = session.personaId;
    const conversationId = session.conversation_id; // Use conversation_id instead of session_id
    const sessionId = session.sessionId;

    if (personaId && conversationId) {
      // Navigate to the chat page with the specific persona and conversation ID
      const url = sessionId
        ? `/chat/${personaId}?conversationId=${conversationId}&sessionId=${sessionId}`
        : `/chat/${personaId}?conversationId=${conversationId}`;
      navigate(url);
    } else {
      console.error(
        `Persona ID or conversation ID not found for session: ${session.conversation_id}`
      );
    }
  };

  // Helper function to refresh sessions list
  const refreshConversations = async () => {
    const sessionsApi = await getUserChatSessions();
    if (sessionsApi && sessionsApi.length > 0) {
      const sessionChats: SessionChat[] = sessionsApi.map((s) => {
        const messages = s.messages || [];
        const lastMessage = messages[messages.length - 1];
        return {
          conversation_id: s.conversation.id,
          persona: s.persona.name,
          personaId: s.persona.id,
          sessionId: s.sessionId,
          last_message: lastMessage?.content || "No messages",
          date: new Date(s.conversation.updatedAt).toLocaleDateString(),
          chats: messages.map((msg) => ({
            persona: s.persona.name,
            user_message: msg.role === "USER" ? msg.content : "",
            ai_response: msg.role === "ASSISTANT" ? msg.content : "",
            timestamp: msg.createdAt,
            conversation_id: s.conversation.id,
            archived: !!s.conversation.archivedAt,
          })),
          archived: !!s.conversation.archivedAt,
          lastTimestamp: s.conversation.updatedAt,
        };
      });
      // Sort sessions by last update
      sessionChats.sort(
        (a, b) =>
          new Date(b.lastTimestamp).getTime() -
          new Date(a.lastTimestamp).getTime()
      );
      setSessions(sessionChats);
    } else {
      setSessions([]);
    }
  };

  // Legacy archive functions removed - now handled by backend API
  // Archive functionality is now integrated with the backend through ConversationArchiveToggle component

  useEffect(() => {
    console.log("Starting chat history fetch for tab:", tab);
    // Fetch chat sessions from backend API
    const fetchChatHistory = async () => {
      try {
        console.log("Fetching chat sessions from backend API");
        const sessionsApi = await getUserChatSessions();
        console.log("Chat sessions fetched from backend:", sessionsApi);

        if (sessionsApi && sessionsApi.length > 0) {
          // Convert chat sessions to SessionChat format
          const sessionChats: SessionChat[] = sessionsApi.map((s) => {
            const messages = s.messages || [];
            const lastMessage = messages[messages.length - 1];
            return {
              conversation_id: s.conversation.id, // Use conversation_id instead of session_id
              persona: s.persona.name,
              personaId: s.persona.id,
              sessionId: s.sessionId,
              last_message: lastMessage?.content || "No messages",
              date: new Date(s.conversation.updatedAt).toLocaleDateString(),
              chats: messages.map((msg) => ({
                persona: s.persona.name,
                user_message: msg.role === "USER" ? msg.content : "",
                ai_response: msg.role === "ASSISTANT" ? msg.content : "",
                timestamp: msg.createdAt,
                conversation_id: s.conversation.id, // Use conversation_id instead of session_id
                archived: !!s.conversation.archivedAt,
              })),
              archived: !!s.conversation.archivedAt,
              lastTimestamp: s.conversation.updatedAt,
            };
          });

          // Sort sessions by their last message timestamp (latest first)
          sessionChats.sort(
            (a, b) =>
              new Date(b.lastTimestamp).getTime() -
              new Date(a.lastTimestamp).getTime()
          );

          console.log("Sessions created:", sessionChats.length);
          console.log(
            "All sessions:",
            sessionChats.map((s) => ({
              conversation_id: s.conversation_id,
              persona: s.persona,
              count: s.chats.length,
              archived: s.archived,
            }))
          );

          setSessions(sessionChats);
        } else {
          console.log(
            "No chat sessions found, falling back to conversations list"
          );
          try {
            const convRes = await getConversations(tab === "archived");
            const conversations = convRes?.data || [];
            const sessionChats: SessionChat[] = conversations.map((c: any) => {
              const lastMessage = c.lastMessage || "No messages";
              return {
                conversation_id: c.id,
                persona: c.persona?.name || "Unknown Persona",
                personaId: c.persona?.id,
                sessionId: "",
                last_message: lastMessage,
                date: new Date(c.updatedAt).toLocaleDateString(),
                chats: [],
                archived: !!c.archivedAt,
                lastTimestamp: c.updatedAt,
              } as SessionChat;
            });
            sessionChats.sort(
              (a, b) =>
                new Date(b.lastTimestamp).getTime() -
                new Date(a.lastTimestamp).getTime()
            );
            setSessions(sessionChats);
          } catch (fallbackErr) {
            console.error("Fallback to conversations failed:", fallbackErr);
            setSessions([]);
          }
        }
      } catch (error) {
        console.error("Error fetching chat sessions:", error);
        setSessions([]);
      }
    };

    fetchChatHistory();
  }, [tab]);

  // Filter sessions by search and tab (all vs archived)
  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.persona.toLowerCase().includes(search.toLowerCase()) ||
      session.last_message.toLowerCase().includes(search.toLowerCase());

    const matchesTab = tab === "all" ? !session.archived : session.archived;

    return matchesSearch && matchesTab;
  });

  // Handler for sharing a conversation
  const handleShareConversation = async (conversationId: string) => {
    console.log("Share button clicked for conversation:", conversationId);
    try {
      const response = await createShareableLink(conversationId);
      const shareUrl = response.data.url;

      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);

      // Show success message (you can implement a toast notification here)
      console.log("Share link copied to clipboard:", shareUrl);
    } catch (error) {
      console.error("Error creating share link:", error);
    }
  };

  // Handler for conversation settings
  const handleConversationSettings = (conversationId: string) => {
    // Find the conversation in the sessions
    const session = sessions.find((s) => s.conversation_id === conversationId);
    if (session) {
      // Convert session to conversation format for the dialog
      const conversation: Conversation = {
        id: session.conversation_id,
        title: session.persona,
        persona: { id: session.personaId, name: session.persona },
        personaId: session.personaId,
        userId: "", // Default value, you might want to get this from backend
        user: { id: "", name: "", email: "" }, // Default value, you might want to get this from backend
        messages: session.chats.map((chat) => ({
          id: chat.timestamp,
          content: chat.user_message || chat.ai_response,
          role: chat.user_message ? "USER" : "ASSISTANT",
          createdAt: chat.timestamp,
          updatedAt: chat.timestamp,
        })),
        createdAt: session.lastTimestamp,
        updatedAt: session.lastTimestamp,
        archivedAt: session.archived ? session.lastTimestamp : null,
        visibility: "PRIVATE", // Default value, you might want to get this from backend
        _count: { messages: session.chats.length },
      };
      setSelectedConversation(conversation);
      setSettingsDialogOpen(true);
    }
  };

  // Archive/unarchive handlers wired to backend API
  const handleArchiveConversation = async (session: SessionChat) => {
    try {
      await toggleConversationArchive(session.conversation_id, true);
      await refreshConversations();
    } catch (error) {
      console.error("Failed to archive conversation", error);
    }
  };

  const handleUnarchiveConversation = async (session: SessionChat) => {
    try {
      await toggleConversationArchive(session.conversation_id, false);
      await refreshConversations();
    } catch (error) {
      console.error("Failed to unarchive conversation", error);
    }
  };

  // Handler for conversation update from settings dialog
  const handleConversationUpdate = (
    conversationId: string,
    updates: Partial<Conversation>
  ) => {
    setSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.conversation_id === conversationId
          ? {
              ...session,
              archived: !!updates.archivedAt,
              lastTimestamp: updates.updatedAt || session.lastTimestamp,
            }
          : session
      )
    );
  };

  // Handler for closing settings dialog
  const handleSettingsDialogClose = () => {
    setSettingsDialogOpen(false);
    setSelectedConversation(null);
  };

  // Map to Chat interface for display
  const chats: Chat[] = filteredSessions.map((session, idx) => {
    console.log("Mapping session:", session);
    // Find persona by ID since we have personaId in session data
    const persona = personas.find((p) => p.id === session.personaId);
    console.log("Found persona for session:", persona);

    const avatarSrc = getAvatarUrl(persona?.avatarUrl || persona?.avatar || "");
    const chat = {
      avatar: avatarSrc || "",
      name: persona?.name || `Persona: ${session.persona}`,
      message: session.last_message,
      date: session.date,
      archived: session.archived,
      onClick: () => {
        console.log("Session clicked:", session);
        // Open the chat directly
        handleOpenChat(session);
      },
      onRightClick: () => {
        // Show session details in modal
        setSelectedSession(session);
        setModalOpen(true);
      },
      onArchive: () => handleArchiveConversation(session),
      onUnarchive: () => handleUnarchiveConversation(session),
      onShare: () => handleShareConversation(session.conversation_id),
      onConversationSettings: () =>
        handleConversationSettings(session.conversation_id),
      key: session.conversation_id + "-" + idx,
    };

    console.log("Created chat object:", chat);
    return chat;
  });
  console.log("Chats array for UI:", chats);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
      <Header />
      <Container sx={{ py: { xs: 2, md: 4 }, maxWidth: 900 }}>
        <Box sx={{ width: "100%", mx: "auto", mb: 2, px: { xs: 0, md: 1 } }}>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search"
            fullWidth
            maxWidth={1200}
          />
        </Box>
        <Box sx={{ px: { xs: 0, md: 1 } }}>
          <ChatHistoryTabs tab={tab} onTabChange={setTab} />
        </Box>
        {chats.length > 0 ? (
          <ChatHistoryList chats={chats} />
        ) : (
          <Box sx={{ textAlign: "center", py: 4, color: "#666" }}>
            <Typography variant="h6">No chat history found</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Start chatting with personas to see your conversation history
              here.
            </Typography>
          </Box>
        )}

        {/* Session Details Modal */}
        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
          <Paper
            sx={{ maxWidth: 600, mx: "auto", my: 8, p: 4, outline: "none" }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Session Details
            </Typography>
            {selectedSession && selectedSession.chats.length > 0 ? (
              selectedSession.chats.map((chat, idx) => (
                <Box
                  key={idx}
                  sx={{ mb: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 2 }}
                >
                  <Typography sx={{ fontWeight: 700 }}>
                    Persona: {chat.persona}
                  </Typography>
                  <Typography sx={{ color: "#333", mt: 1 }}>
                    User: {chat.user_message}
                  </Typography>
                  <Typography sx={{ color: "#2950DA", mt: 1 }}>
                    AI: {chat.ai_response}
                  </Typography>
                  <Typography sx={{ color: "#888", fontSize: 13, mt: 1 }}>
                    {new Date(chat.timestamp).toLocaleString()}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography>No messages in this session.</Typography>
            )}
          </Paper>
        </Modal>

        {/* Conversation Settings Dialog */}
        <ConversationSettingsDialog
          open={settingsDialogOpen}
          onClose={handleSettingsDialogClose}
          conversation={selectedConversation}
          onConversationUpdate={handleConversationUpdate}
        />
      </Container>
    </Box>
  );
};

export default ChatHistoryPage;
