import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Box,
  Avatar,
  Typography,
  ClickAwayListener,
  useTheme,
  useMediaQuery,
  IconButton,
  TextField,
  Alert,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import type { Persona } from "../services/personaService";
import ChatHeader from "../components/ChatHeader";
import Sidebar from "../components/sidebar/Sidebar";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import FormattedOutput from "../components/FormattedOutput";
import ChatInputBar from "../components/ChatInputBar";
import ChatSearchModal from "../components/ChatSearchModal";
import {
  getPersonas,
  getPersonaById,
  sendMessageToPersona,
  getConversations,
  getChatSessionById,
  getUserChatSessions,
  editMessage,
  type Conversation,
  type MessageResponse,
  getConversationById,
} from "../services/personaService";
import { getWorkspaceDetails } from "../services/workspaceService";
import { storage } from "../lib/storage/localStorage";
import MessageReaction from "../components/MessageReaction";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import ConversationSettingsDialog from "../components/ConversationSettingsDialog";

const TypingIndicator = () => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, py: 1 }}>
    <Box
      sx={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        bgcolor: "#2950DA",
        animation: "typing 1.4s infinite ease-in-out",
        animationDelay: "0s",
        "@keyframes typing": {
          "0%, 80%, 100%": {
            opacity: 0.3,
            transform: "scale(0.8)",
          },
          "40%": {
            opacity: 1,
            transform: "scale(1)",
          },
        },
      }}
    />
    <Box
      sx={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        bgcolor: "#2950DA",
        animation: "typing 1.4s infinite ease-in-out",
        animationDelay: "0.2s",
        "@keyframes typing": {
          "0%, 80%, 100%": {
            opacity: 0.3,
            transform: "scale(0.8)",
          },
          "40%": {
            opacity: 1,
            transform: "scale(1)",
          },
        },
      }}
    />
    <Box
      sx={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        bgcolor: "#2950DA",
        animation: "typing 1.4s infinite ease-in-out",
        animationDelay: "0.4s",
        "@keyframes typing": {
          "0%, 80%, 100%": {
            opacity: 0.3,
            transform: "scale(0.8)",
          },
          "40%": {
            opacity: 1,
            transform: "scale(1)",
          },
        },
      }}
    />
  </Box>
);

export default function ChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const conversationIdFromUrl = searchParams.get("conversationId");
  const draftIdFromUrl = searchParams.get("draft");

  // All hooks must be called unconditionally at the top
  const [persona, setPersona] = useState<Persona | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [messages, setMessages] = useState<
    {
      sender: "user" | "ai";
      text: string;
      fileUrl?: string;
      fileType?: string;
      isTyping?: boolean;
      id?: string;
      userId?: string; // Add userId for ownership checking
      fileUrls?: string[];
      fileTypes?: string[];
      edited?: boolean;
      reactions?: Array<{
        id: string;
        type: "LIKE" | "DISLIKE";
        userId: string;
        createdAt: string;
      }>;
    }[]
  >([]);
  const [messageInput, setMessageInput] = useState("");
  const [currentConversationId, setCurrentConversationId] =
    useState<string>("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);
  const [userAvatar, setUserAvatar] = useState("");
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [loadingPersona, setLoadingPersona] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [isRestoringConversation, setIsRestoringConversation] = useState(false);
  const [workspaceName, setWorkspaceName] = useState<string>("");

  // Fetch workspace details
  const loadWorkspaceDetails = useCallback(async () => {
    try {
      const workspace = await getWorkspaceDetails();
      setWorkspaceName(workspace.name);
    } catch (error) {
      console.error("Error loading workspace details:", error);
      // Fallback to localStorage
      const storedWorkspaceName = storage.getWorkspaceName();
      if (storedWorkspaceName) {
        setWorkspaceName(storedWorkspaceName);
      }
    }
  }, []);

  const loadSearchSessions = useCallback(async () => {
    try {
      const sessions = await getUserChatSessions();
      const compact = (sessions || [])
        .map((s) => ({
          session_id: s.conversation?.id || s.sessionId,
          date: s.conversation?.updatedAt || s.conversation?.createdAt,
          messages: (s.messages || []).map((m) => ({
            sender: m.role === "USER" ? "user" : "ai",
            text: m.content,
          })),
        }))
        .filter((s) => s.session_id);
      setChatSessions(compact);
    } catch (e) {
      // Fallback: try to build from conversations (may not include messages)
      try {
        const res = await getConversations();
        const convs = res.data || [];
        const sessionsFallback = convs.map((c) => ({
          session_id: c.id,
          date: c.updatedAt,
          messages: (c.messages || []).map((m) => ({
            sender: m.role === "USER" ? "user" : "ai",
            text: m.content,
          })),
        }));
        setChatSessions(sessionsFallback);
      } catch {}
    }
  }, []);

  const [allPersonas, setAllPersonas] = useState<Persona[]>([]);

  // Remove the unnecessary 7-second timer - this was causing artificial delays
  // useEffect(() => {
  //   const timer = setTimeout(() => setInitialLoading(false), 7000);
  //   return () => clearTimeout(timer);
  // }, []);

  const loadConversations = useCallback(async () => {
    // Only load conversations if we have a persona
    if (!persona?.id) return;

    // Set restoring state if we're trying to load a conversation from URL
    if (draftIdFromUrl) {
      // In draft mode, skip any restore work inside this loader
      return;
    }

    if (conversationIdFromUrl) {
      setIsRestoringConversation(true);
      // Add a timeout fallback to prevent infinite loading
      setTimeout(() => {
        setIsRestoringConversation(false);
      }, 10000); // 10 second timeout
    }

    try {
      const response = await getConversations();
      const personaConversations = response.data.filter(
        (conv) => conv.personaId === persona.id
      );

      console.log("Current persona ID:", persona?.id);
      console.log(
        "All conversations:",
        response.data.map((c) => ({
          id: c.id,
          personaId: c.personaId,
          persona: c.persona,
          personaName: c.persona?.name,
        }))
      );
      console.log(
        "Persona conversations:",
        personaConversations.map((c) => ({
          id: c.id,
          personaId: c.personaId,
          persona: c.persona,
          personaName: c.persona?.name,
        }))
      );

      // If we have a conversation ID from URL params, load that conversation with all messages
      if (conversationIdFromUrl) {
        // Validate that conversationIdFromUrl is a valid cuid
        const cuidRegex = /^[a-z0-9]{25}$/;
        if (cuidRegex.test(conversationIdFromUrl)) {
          try {
            // Load the specific conversation with all messages
            const conversationResponse = await getConversationById(
              conversationIdFromUrl
            );
            const fullConversation = conversationResponse.data;

            // Verify this conversation belongs to the current persona
            if (fullConversation.personaId === persona.id) {
              setCurrentConversationId(conversationIdFromUrl);
              setCurrentConversation(fullConversation);
              // Load all messages from this conversation
              loadConversationMessages(fullConversation);
              return; // Exit early since we've loaded the specific conversation
            } else {
              console.log(
                "Found conversation in all conversations, but it belongs to persona:",
                fullConversation.personaId
              );
              // Load the correct persona for this conversation
              try {
                const correctPersona = await getPersonaById(
                  fullConversation.personaId
                );
                setPersona(correctPersona);
                // The conversation will be loaded in the next useEffect when persona changes
                return;
              } catch (error) {
                console.error("Error loading correct persona:", error);
              }
            }
          } catch (error) {
            console.error("Error loading specific conversation:", error);
            // Fall back to finding in persona conversations
          }
        }
      } else if (currentConversationId) {
        // If we have a current conversation ID, try to find and update it
        const foundConversation = personaConversations.find(
          (conv) => conv.id === currentConversationId
        );
        if (foundConversation) {
          setCurrentConversation(foundConversation);
        }
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      // Always clear restoring state when conversation loading completes
      setIsRestoringConversation(false);
    }
  }, [persona?.id, conversationIdFromUrl, currentConversationId, searchParams]);

  // Immediately react to draft mode by clearing current conversation and messages
  useEffect(() => {
    if (draftIdFromUrl) {
      setCurrentConversationId("");
      setCurrentConversation(null);
      setMessages([]);
      setIsRestoringConversation(false);
      // Remove stale conversationId from URL to avoid accidental restores
      const url = new URL(window.location.href);
      if (url.searchParams.has("conversationId")) {
        url.searchParams.delete("conversationId");
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, [draftIdFromUrl]);

  // Load conversations from backend when persona changes
  useEffect(() => {
    if (persona?.id) {
      loadConversations();
    }
  }, [persona?.id, loadConversations]);

  // Remove the separate effect for conversationIdFromUrl changes since it's handled in loadConversations
  // useEffect(() => {
  //   if (conversationIdFromUrl && persona?.id) {
  //     console.log("Conversation ID from URL detected:", conversationIdFromUrl);
  //     loadConversations();
  //   }
  // }, [conversationIdFromUrl, persona?.id, loadConversations]);

  const loadConversationMessages = (conversation: Conversation) => {
    if (!conversation.messages || !Array.isArray(conversation.messages)) {
      console.warn("No messages found in conversation:", conversation.id);
      setMessages([]);
      return;
    }

    const formattedMessages = conversation.messages.map((msg) => ({
      sender: msg.role === "USER" ? ("user" as const) : ("ai" as const),
      text: msg.content,
      id: msg.id,
      userId: msg.userId, // Include userId for ownership checking
      edited: msg.edited || false,
      reactions: msg.reactions || [],
    }));
    setMessages(formattedMessages);
  };

  // Fetch all personas for persona switcher - only when needed
  useEffect(() => {
    async function fetchAllPersonas() {
      try {
        const response = await getPersonas();
        setAllPersonas(response.data || []);
      } catch (err) {
        console.error("Error fetching personas from backend:", err);
        setAllPersonas([]);
      }
    }

    // Only fetch if we don't have personas yet
    if (allPersonas.length === 0) {
      fetchAllPersonas();
    }
  }, [allPersonas.length]);

  // Load workspace details on component mount
  useEffect(() => {
    loadWorkspaceDetails();
  }, [loadWorkspaceDetails]);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setUserAvatar(user.avatar || "");
    } catch {
      // Intentionally empty - user avatar is optional
    }
  }, []);

  useEffect(() => {
    async function fetchPersona() {
      if (id) {
        try {
          setLoadingPersona(true);
          const response = await getPersonaById(id);
          setPersona(response);
        } catch (error) {
          console.error("Error fetching persona from backend:", error);
        } finally {
          setLoadingPersona(false);
        }
      } else {
        setLoadingPersona(false);
      }
    }

    // Only fetch if we have an ID and don't already have the persona
    if (id && (!persona || persona.id !== id)) {
      fetchPersona();
    } else if (!id) {
      setLoadingPersona(false);
    }
  }, [id, persona?.id]);

  // Dynamic suggestion chips based on persona department
  const getSuggestionChips = (department: string, personaId: string) => {
    // Special handling for Head of Payment persona
    if (personaId === "1") {
      return [
        "Analyze payment gateway performance",
        "Review transaction failure rates",
        "Optimize checkout conversion rates",
        "Check payment processing costs",
        "Evaluate fraud detection metrics",
      ];
    }

    // Special handling for Product Manager persona
    if (personaId === "2") {
      return [
        "Review product roadmap priorities",
        "Analyze feature adoption metrics",
        "Get user feedback insights",
        "Check sprint progress status",
        "Evaluate market competitive analysis",
      ];
    }

    switch (department) {
      case "Tech":
        return [
          "Ask about QR transaction flows",
          "Get merchant risk metrics",
          "Clarify settlement SLA",
        ];
      case "Marketing":
        return [
          "Request latest campaign stats",
          "Ask for competitor analysis",
          "Get social media insights",
        ];
      case "Sales":
        return [
          "Ask for sales pipeline update",
          "Request lead conversion rates",
          "Get monthly sales summary",
        ];
      default:
        return ["Ask a question", "Request a report", "Get latest updates"];
    }
  };
  const suggestionChips = React.useMemo(
    () =>
      persona ? getSuggestionChips(persona.department || "", persona.id) : [],
    [persona]
  );

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const scrollToBottom = () => {
      if (messageListRef.current) {
        messageListRef.current.scrollTo({
          top: messageListRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    };

    // Use requestAnimationFrame to ensure DOM is fully updated
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(scrollToBottom);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [messages]);

  // Keyboard shortcut for Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        // Only open search if we have a valid persona
        if (persona?.id) {
          setSearchOpen(true);
          loadSearchSessions();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [loadSearchSessions, persona?.id]);

  // Edit message handlers
  const handleEditMessage = (messageId: string, currentText: string) => {
    // Check if message can be edited (basic frontend validation)
    const message = messages.find((m) => m.id === messageId);
    if (!message) return;

    // Only user messages can be edited
    if (message.sender !== "user") {
      console.log("Only user messages can be edited");
      return;
    }

    setEditingMessageId(messageId);
    setEditingText(currentText);
  };

  const handleSaveEdit = async (messageId: string) => {
    if (!editingText.trim()) return;

    try {
      setIsLoading(true);

      // Call backend edit API
      const response = await editMessage(messageId, editingText.trim());

      // Optimistically update the edited message locally
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                text: editingText.trim(),
                edited: true,
              }
            : msg
        )
      );

      // If backend returned assistant reply content, append it immediately for responsiveness
      if ((response.data as any).assistantMessageId) {
        const assistantText =
          (response.data as any).assistantMessageContent ?? "";
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai" as const,
            text: assistantText,
            id: (response.data as any).assistantMessageId,
            edited: false,
            reactions: [],
          },
        ]);
      }

      // Update conversation ID if it changed
      if (
        response.data.conversationId &&
        response.data.conversationId !== currentConversationId
      ) {
        setCurrentConversationId(response.data.conversationId);
        // Update URL to include conversation ID
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set("conversationId", response.data.conversationId);
        window.history.replaceState({}, "", newUrl.toString());
      }

      // Fully refresh the conversation to reflect replaced thread
      try {
        const convId = response.data.conversationId;
        if (convId) {
          const convRes = await getConversationById(convId);
          setCurrentConversation(convRes.data);
          loadConversationMessages(convRes.data);
        }
      } catch (refreshErr) {
        console.warn(
          "Failed to refresh full conversation after edit",
          refreshErr
        );
        await loadConversations();
      }

      // Clear edit state
      setEditingMessageId(null);
      setEditingText("");
    } catch (error) {
      console.error("Error editing message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  // Handle reaction updates
  const handleReactionUpdate = (
    messageId: string,
    reactionData: {
      messageId: string;
      type: "LIKE" | "DISLIKE";
      action: "added" | "removed" | "updated";
      toggled: boolean;
    }
  ) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          // Update reactions based on the backend response
          const currentReactions = msg.reactions || [];
          let updatedReactions = [...currentReactions];

          if (reactionData.action === "added") {
            // Add new reaction (simplified - in real app you'd get the full reaction object from backend)
            updatedReactions.push({
              id: Date.now().toString(), // Temporary ID
              type: reactionData.type,
              userId: "current-user", // This should come from auth context
              createdAt: new Date().toISOString(),
            });
          } else if (reactionData.action === "removed") {
            // Remove reaction of the same type
            updatedReactions = updatedReactions.filter(
              (r) =>
                !(r.type === reactionData.type && r.userId === "current-user")
            );
          } else if (reactionData.action === "updated") {
            // Update existing reaction
            updatedReactions = updatedReactions.map((r) =>
              r.userId === "current-user"
                ? { ...r, type: reactionData.type }
                : r
            );
          }

          return { ...msg, reactions: updatedReactions };
        }
        return msg;
      })
    );
  };

  // Conversation settings handlers
  const handleCloseSettings = () => {
    setSettingsDialogOpen(false);
  };

  const handleConversationUpdate = (
    conversationId: string,
    updates: Partial<Conversation>
  ) => {
    // Update current conversation state
    if (currentConversation && currentConversation.id === conversationId) {
      setCurrentConversation({ ...currentConversation, ...updates });
    }

    // If conversation was archived, redirect to persona page
    if (updates.archivedAt !== undefined && updates.archivedAt !== null) {
      // Conversation was archived, redirect to persona selection
      navigate(`/personas/${persona?.id}`);
      return;
    }

    // Refresh conversations list to get updated data
    loadConversations();
  };

  // Show loading indicator while loading chat history
  // if (isLoading) {
  //   return (
  //     <Box
  //       sx={{
  //         height: "100vh",
  //         bgcolor: "#fff",
  //         display: "flex",
  //         flexDirection: "column",
  //         alignItems: "center",
  //         justifyContent: "center",
  //       }}
  //     >
  //       <Typography variant="h6" sx={{ color: "#52946B" }}>
  //         Loading chat history...
  //       </Typography>
  //     </Box>
  //   );
  // }

  // Check if persona exists after loading is complete
  const showLoaderOverlay = loadingPersona; // Remove initialLoading dependency
  if (!persona) {
    return (
      <Box
        sx={{
          height: "100vh",
          bgcolor: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Backdrop
          open={showLoaderOverlay}
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.modal + 1 }}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <Typography variant="h6" sx={{ color: "#2950DA" }}>
          Persona not found
        </Typography>
      </Box>
    );
  }

  // Handler to open sidebar from header
  const handleMenuClick = () => setSidebarOpen(true);
  // Handler to close sidebar
  const handleSidebarClose = () => setSidebarOpen(false);
  const SIDEBAR_WIDTH = 280; // Fixed width for consistent sidebar

  // Custom back handler for chat page
  const handleBack = () => {
    navigate("/discovery");
  };

  // Handler to close persona switcher
  const handleSwitcherClose = () => {
    setSwitcherOpen(false);
    setAnchorEl(null);
  };

  // Handler for switch persona
  const handleSwitchPersona = (personaId: string) => {
    setSwitcherOpen(false);
    setLoadingPersona(true); // Set loading state before navigating
    navigate(`/chat/${personaId}`);
  };

  const handleAvatarClick = () => {
    navigate(`/view-persona/${persona.id}`);
  };

  // Updated handleSendMessage to use backend API consistently
  const handleSendMessage = async (msgObj: {
    message: string;
    fileUrl?: string;
    fileType?: string;
    fileId?: string;
    fileUrls?: string[];
    fileTypes?: string[];
  }) => {
    const trimmed = (msgObj.message || "").trim();
    if (!trimmed || !persona) return;

    setIsLoading(true);
    try {
      // Add user message to UI immediately (temporary ID until backend responds)
      const tempMessageId = `temp-${Date.now().toString(36)}`;
      setMessages((prev) => [
        ...prev,
        { sender: "user", text: trimmed, id: tempMessageId },
      ]);
      setMessageInput("");

      // Add typing indicator for AI response
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "", isTyping: true },
      ]);

      // Validate conversation ID before sending
      const cuidRegex = /^[a-z0-9]{25}$/;
      const validConversationId =
        currentConversationId && cuidRegex.test(currentConversationId)
          ? currentConversationId
          : conversationIdFromUrl && cuidRegex.test(conversationIdFromUrl)
          ? conversationIdFromUrl
          : undefined;

      console.log("Using conversation ID:", validConversationId);

      // Send message to backend API with fileId if present
      const response: MessageResponse = await sendMessageToPersona(
        persona.id,
        trimmed,
        validConversationId,
        msgObj.fileId
      );

      // Update conversation ID if this is a new conversation
      if (!currentConversationId && response.data.conversationId) {
        setCurrentConversationId(response.data.conversationId);
        // Update URL to include conversation ID
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set("conversationId", response.data.conversationId);
        window.history.replaceState({}, "", newUrl.toString());
      }

      // Replace typing indicator with actual AI response and reconcile temp user message ID
      setMessages((prev) => {
        const newMessages = prev.map((m) =>
          m.id === tempMessageId && (response.data as any).userMessageId
            ? { ...m, id: (response.data as any).userMessageId }
            : m
        );
        // Remove typing indicator and add real response
        newMessages[newMessages.length - 1] = {
          sender: "ai",
          text: response.data.reply,
          id:
            (response.data as any).assistantMessageId ||
            response.data.messageId,
          isTyping: false,
        };
        return newMessages;
      });

      // Refresh conversations list to show updated conversation
      await loadConversations();
    } catch (error) {
      console.error("Error sending message:", error);

      // Replace typing indicator with error message
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          sender: "ai",
          text: "Sorry, there was an error sending your message. Please try again.",
          isTyping: false,
        };
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has sent first message
  const hasUserMessages =
    messages.filter((msg) => msg.sender === "user").length > 0;

  // Check if we're in a conversation restoration state
  const isInConversationRestoration =
    conversationIdFromUrl && (isRestoringConversation || messages.length === 0);

  return (
    <Box
      sx={{
        height: "100vh",
        bgcolor: "#fff",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        width: "100vw",
        maxWidth: "100vw",
        fontFamily: "Inter, Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      {/* Initial loader overlay (up to 7s or until persona finishes loading) */}
      <Backdrop
        open={showLoaderOverlay}
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.modal + 2 }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <CircularProgress color="inherit" />
          <Typography sx={{ fontWeight: 600 }}>Loading chat...</Typography>
        </Box>
      </Backdrop>
      {/* Full-width ChatHeader at the top */}
      <ChatHeader
        onBack={handleBack}
        onMenu={handleMenuClick}
        isSidebarOpen={sidebarOpen}
        backIcon={
          <ChevronLeftIcon
            sx={{ fontSize: { xs: 24, sm: 28 }, color: "#012A1F" }}
          />
        }
      />

      {/* Content area with sidebar and main chat */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          flex: 1,
          overflow: "hidden",
          width: "100%",
          maxWidth: "100vw",
          position: "relative",
        }}
      >
        {/* Mobile backdrop overlay */}
        {sidebarOpen && isMobile && (
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: "rgba(0, 0, 0, 0.5)",
              zIndex: 1199,
              transition: "opacity 0.3s ease",
            }}
            onClick={handleSidebarClose}
          />
        )}

        {/* Sidebar - Always rendered but positioned off-screen when closed */}
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            height: "100vh",
            zIndex: 1200,
            transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.3s cubic-bezier(.4,0,.2,1)",
          }}
        >
          <Sidebar
            onClose={handleSidebarClose}
            currentPersonaId={persona.id}
            currentConversationId={currentConversationId}
            activePersona={{
              id: persona.id,
              name: persona.personalName || persona.name,
              avatarUrl: persona.avatarUrl || persona.avatar,
            }}
            activeLastMessage={
              messages.length > 0
                ? messages[messages.length - 1]?.text || ""
                : ""
            }
            onSearchChats={() => setSearchOpen(true)}
          />
        </Box>

        {/* Main chat area wrapper */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            position: "relative",
            transition: "margin-left 0.3s cubic-bezier(.4,0,.2,1)",
            ml: { xs: 0, md: sidebarOpen ? `${SIDEBAR_WIDTH}px` : 0 },
            height: "100%",
            width: "100%",
            maxWidth: "100vw",
            overflow: "hidden",
          }}
        >
          {/* Scrollable message list */}
          <Box
            ref={messageListRef}
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
              maxWidth: "100vw",
              mx: 0,
              overflowY: "auto",
              overflowX: "hidden",
              pb: { xs: 16, sm: 24, md: 28 },
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
              minHeight: 0,
            }}
          >
            <Box
              sx={{
                width: "100%",
                maxWidth: { xs: "100%", sm: 720, md: 900 },
                mx: "auto",
                mb: 2,
                display: "flex",
                flexDirection: "column",
                gap: { xs: 1.5, sm: 2 },
                px: { xs: 1.5, sm: 2, md: 0 },
                overflow: "visible",
              }}
            >
              {/* Persona Profile with separate click handlers - Hide when restoring conversation */}
              {!isInConversationRestoration && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    mb: { xs: 2, sm: 3 },
                    px: { xs: 2, sm: 0 },
                    pt: { xs: 2, sm: 3 },
                    pb: { xs: 1, sm: 2 },
                    position: "relative",
                  }}
                >
                  {/* Avatar - clicks to view persona */}
                  <Avatar
                    key={persona.id}
                    src={persona.avatarUrl || persona.avatar || ""}
                    sx={{
                      width: { xs: 80, sm: 96 },
                      height: { xs: 80, sm: 96 },
                      mb: { xs: 1.5, sm: 2 },
                      cursor: "pointer",
                      transition: "transform 0.2s ease-in-out",
                      "&:hover": {
                        transform: "scale(1.05)",
                      },
                    }}
                    onClick={handleAvatarClick}
                    onError={(e) => {
                      console.error(
                        "Avatar image failed to load:",
                        persona.avatarUrl || persona.avatar
                      );
                      console.error("Error event:", e);
                    }}
                    onLoad={() => {
                      // Avatar image loaded successfully
                    }}
                  />

                  {/* Name */}
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      color: "#222",
                      mb: 0.5,
                      fontSize: { xs: "20px", sm: "24px" },
                      textAlign: "center",
                    }}
                  >
                    {persona.personalName || persona.name}
                    {persona.isAvailable === false && (
                      <Box
                        component="span"
                        sx={{
                          ml: 1,
                          px: 1,
                          py: 0.5,
                          bgcolor: "#ffebee",
                          color: "#c62828",
                          fontSize: "12px",
                          borderRadius: 1,
                          fontWeight: 500,
                        }}
                      >
                        Temporarily Unavailable
                      </Box>
                    )}
                  </Typography>

                  {/* Role */}
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: "#2950DA",
                      fontWeight: 400,
                      fontSize: { xs: 16, sm: 18 },
                      textAlign: "center",
                    }}
                  >
                    {persona.name}
                  </Typography>

                  {/* Department */}
                  {persona.department && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#666",
                        fontWeight: 400,
                        fontSize: { xs: 14, sm: 16 },
                        textAlign: "center",
                        mt: 0.5,
                      }}
                    >
                      {persona.department}
                    </Typography>
                  )}

                  {/* Description */}
                  {persona.description && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#888",
                        fontWeight: 400,
                        fontSize: { xs: 13, sm: 15 },
                        textAlign: "center",
                        mt: 0.5,
                      }}
                    >
                      {persona.description}
                    </Typography>
                  )}

                  {/* Switch Persona Button - moved here under description */}
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mt: 1 }}
                  >
                    <AutorenewIcon
                      onClick={() => setSwitcherOpen(true)}
                      sx={{
                        ml: 1,
                        color: "#2950DA",
                        fontSize: 32,
                        cursor: "pointer",
                        borderRadius: "50%",
                        transition: "background 0.2s",
                        "&:hover": { background: "#E8ECF2" },
                      }}
                    />
                  </Box>

                  {/* Switch Persona Modal */}
                  <Dialog
                    open={switcherOpen}
                    onClose={handleSwitcherClose}
                    maxWidth="xs"
                    fullWidth
                  >
                    <DialogTitle
                      sx={{
                        fontWeight: 600,
                        fontSize: 22,
                        color: "#222",
                        textAlign: "center",
                      }}
                    >
                      Switch Persona
                    </DialogTitle>
                    <DialogContent sx={{ p: 3 }}>
                      {allPersonas
                        .filter((p) => p.id !== persona.id)
                        .map((p) => (
                          <Box
                            key={p.id}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              mb: 2,
                              cursor: "pointer",
                              borderRadius: 2,
                              p: 1.2,
                              "&:hover": { background: "#f5f5f5" },
                            }}
                            onClick={() => handleSwitchPersona(p.id)}
                          >
                            <Avatar
                              key={p.id}
                              src={p.avatarUrl || p.avatar || ""}
                              sx={{ width: 48, height: 48 }}
                            />
                            <Box>
                              <Typography
                                sx={{
                                  fontWeight: 600,
                                  fontSize: 18,
                                  color: "#222",
                                }}
                              >
                                {p.name}
                                {p.isAvailable === false && (
                                  <Box
                                    component="span"
                                    sx={{
                                      ml: 1,
                                      px: 1,
                                      py: 0.5,
                                      bgcolor: "#ffebee",
                                      color: "#c62828",
                                      fontSize: "10px",
                                      borderRadius: 1,
                                      fontWeight: 500,
                                    }}
                                  >
                                    Unavailable
                                  </Box>
                                )}
                              </Typography>
                              <Typography
                                sx={{ color: "#2950DA", fontSize: 16 }}
                              >
                                {p.role}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      {allPersonas.filter((p) => p.id !== persona.id).length ===
                        0 && (
                        <Typography
                          sx={{ color: "#888", textAlign: "center", mt: 2 }}
                        >
                          No other personas available.
                        </Typography>
                      )}
                    </DialogContent>
                    <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
                      <Button
                        onClick={handleSwitcherClose}
                        variant="outlined"
                        color="primary"
                      >
                        Cancel
                      </Button>
                    </DialogActions>
                  </Dialog>
                </Box>
              )}

              {/* Conversation Restoring Indicator */}
              {isRestoringConversation && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    py: 4,
                    color: "#666",
                  }}
                >
                  <CircularProgress size={24} sx={{ mr: 2 }} />
                  <Typography variant="body2">
                    Restoring conversation...
                  </Typography>
                </Box>
              )}

              {/* Conversation Restore Failed */}
              {!isRestoringConversation &&
                conversationIdFromUrl &&
                !draftIdFromUrl &&
                messages.length === 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      py: 4,
                      color: "#666",
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      Failed to restore conversation
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() => loadConversations()}
                      sx={{ color: "#2950DA", borderColor: "#2950DA" }}
                    >
                      Retry
                    </Button>
                  </Box>
                )}

              {/* Messages */}
              {!isRestoringConversation &&
                messages.map((msg, idx) =>
                  msg.sender === "ai" ? (
                    <Box
                      key={idx}
                      data-msg-idx={idx}
                      sx={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "flex-start",
                          gap: 2,
                          maxWidth: "100%",
                        }}
                      >
                        {/* <Avatar
                        sx={{
                          width: 42,
                          height: 42,
                          alignSelf: "flex-start",
                          flexShrink: 0,
                        }}
                      >
                        <img
                          key={persona.id}
                          src={persona.avatarUrl || persona.avatar || ""}
                          alt="AI"
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      </Avatar> */}
                        <Box
                          sx={{
                            flex: 1,
                            minWidth: 0,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                          }}
                        >
                          <Box
                            sx={{
                              color: "#2950DA",
                              fontWeight: 500,
                              fontSize: 16,
                              mb: 1,
                            }}
                          >
                            {persona.name}
                          </Box>
                          {msg.isTyping ? (
                            <Box
                              sx={{
                                bgcolor: "#EEF3FF",
                                color: "#1E3A8A",
                                px: { xs: 2.5, sm: 2 },
                                py: { xs: 2, sm: 2.5 },
                                borderRadius: 3,
                                fontSize: 16,
                                fontWeight: 400,
                                maxWidth: { xs: "100%", sm: 600 },
                                wordBreak: "break-word",
                                boxShadow: "none",
                                lineHeight: 1.5,
                                textAlign: "left",
                                whiteSpace: "pre-wrap",
                              }}
                            >
                              <TypingIndicator />
                            </Box>
                          ) : (
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-start",
                                gap: 1,
                                maxWidth: { xs: "100%", sm: 600 },
                              }}
                            >
                              {msg.fileUrl && (
                                <Box
                                  sx={{
                                    bgcolor: "#EEF3FF",
                                    borderRadius: 3,
                                    p: 1,
                                    boxShadow: "none",
                                  }}
                                >
                                  {msg.fileType &&
                                  msg.fileType.startsWith("image/") ? (
                                    <img
                                      src={msg.fileUrl}
                                      alt="attachment"
                                      style={{
                                        maxWidth: 250,
                                        maxHeight: 250,
                                        borderRadius: 8,
                                        display: "block",
                                        width: "100%",
                                        height: "auto",
                                      }}
                                    />
                                  ) : (
                                    <Box
                                      sx={{
                                        width: 20,
                                        height: 20,
                                        bgcolor: "#1E3A8A",
                                        borderRadius: 1,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                      }}
                                      onClick={() =>
                                        window.open(msg.fileUrl, "_blank")
                                      }
                                    >
                                      <Box
                                        sx={{
                                          width: 12,
                                          height: 12,
                                          bgcolor: "#fff",
                                          borderRadius: 0.5,
                                        }}
                                      />
                                    </Box>
                                  )}
                                </Box>
                              )}
                              {msg.text && (
                                <>
                                  <Box
                                    sx={{
                                      bgcolor: "#EEF3FF",
                                      color: "#1E3A8A",
                                      px: { xs: 2.5, sm: 2 },
                                      py: { xs: 2, sm: 2.5 },
                                      borderRadius: 3,
                                      fontSize: 16,
                                      fontWeight: 400,
                                      wordBreak: "break-word",
                                      boxShadow: "none",
                                      lineHeight: 1.5,
                                      textAlign: "left",
                                      whiteSpace: "pre-wrap",
                                      maxWidth: "100%",
                                    }}
                                  >
                                    {msg.text.match(
                                      /(\n\s*[-*]|^\d+\.|^#)/m
                                    ) ? (
                                      <FormattedOutput content={msg.text} />
                                    ) : (
                                      msg.text
                                    )}
                                  </Box>
                                  <IconButton
                                    size="small"
                                    aria-label="Copy AI response"
                                    sx={{
                                      mt: 0.5,
                                      alignSelf: "flex-start",
                                      color: "#1E3A8A",
                                    }}
                                    onClick={() => {
                                      if (msg.text) {
                                        navigator.clipboard.writeText(msg.text);
                                        setCopiedMessageId(
                                          msg.id || `msg-${idx}`
                                        );
                                        // Reset after 2 seconds
                                        setTimeout(() => {
                                          setCopiedMessageId(null);
                                        }, 2000);
                                      }
                                    }}
                                  >
                                    {copiedMessageId ===
                                    (msg.id || `msg-${idx}`) ? (
                                      <CheckIcon
                                        fontSize="small"
                                        sx={{ color: "#10B981" }}
                                      />
                                    ) : (
                                      <ContentCopyIcon fontSize="small" />
                                    )}
                                  </IconButton>
                                </>
                              )}

                              {/* Message Reactions */}
                              {msg.id && (
                                <MessageReaction
                                  messageId={msg.id}
                                  reactions={msg.reactions}
                                  currentUserId="current-user" // This should come from auth context
                                  onReactionUpdate={handleReactionUpdate}
                                  disabled={
                                    isLoading ||
                                    !!currentConversation?.archivedAt
                                  }
                                />
                              )}
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  ) : (
                    <Box
                      key={idx}
                      data-msg-idx={idx}
                      sx={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "flex-end",
                        mb: 2,
                        mr: { xs: 0, sm: 4 },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row-reverse",
                          alignItems: "flex-end",
                          gap: 1,
                          maxWidth: "100%",
                        }}
                      >
                        {/* <Avatar
                        sx={{
                          width: 42,
                          height: 42,
                          flexShrink: 0,
                          bgcolor: "#2950DA",
                        }}
                      >
                        {userAvatar && userAvatar.trim() !== "" ? (
                          <img
                            src={userAvatar}
                            alt="User"
                            style={{
                              width: "100%",
                              height: "100%",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              // If image fails to load, hide it and show default
                              e.currentTarget.style.display = "none";
                              e.currentTarget.nextElementSibling?.setAttribute(
                                "style",
                                "display: flex !important"
                              );
                            }}
                          />
                        ) : null}
                        <span
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "50%",
                            display:
                              userAvatar && userAvatar.trim() !== ""
                                ? "none"
                                : "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 18,
                            fontWeight: 600,
                            color: "#fff",
                          }}
                        >
                          U
                        </span>
                      </Avatar> */}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            gap: 1,
                            maxWidth: { xs: "100%", sm: 400 },
                          }}
                        >
                          {/* Multiple images support */}
                          {msg.fileUrls && msg.fileUrls.length > 0 && (
                            <Box
                              sx={{
                                display: "flex",
                                gap: 1,
                                flexWrap: "wrap",
                                mb: 1,
                              }}
                            >
                              {msg.fileUrls.map((url: string, i: number) => (
                                <img
                                  key={i}
                                  src={url}
                                  alt={`attachment-${i}`}
                                  style={{
                                    width: "3rem",
                                    height: "3rem",
                                    display: "block",
                                  }}
                                />
                              ))}
                            </Box>
                          )}
                          {/* Single file fallback */}
                          {msg.fileUrl &&
                            !msg.fileUrls &&
                            (msg.fileType &&
                            msg.fileType.startsWith("image/") ? (
                              <img
                                src={msg.fileUrl}
                                alt="attachment"
                                style={{
                                  width: "3rem",
                                  height: "3rem",
                                  display: "block",
                                }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: 20,
                                  height: 20,
                                  bgcolor: "#fff",
                                  borderRadius: 1,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                }}
                                onClick={() =>
                                  window.open(msg.fileUrl, "_blank")
                                }
                              >
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    bgcolor: "#2950DA",
                                    borderRadius: 0.5,
                                  }}
                                />
                              </Box>
                            ))}
                          {msg.text && (
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 1,
                                position: "relative",
                                "&:hover .edit-button": { opacity: 1 },
                              }}
                            >
                              <Box
                                sx={{
                                  bgcolor: "#2950DA",
                                  color: "#fff",
                                  px: { xs: 2.5, sm: 3 },
                                  py: { xs: 2, sm: 2.5 },
                                  borderRadius: 3,
                                  fontSize: 16,
                                  fontWeight: 400,
                                  wordBreak: "break-word",
                                  boxShadow: "0 2px 8px rgba(44,62,80,0.04)",
                                  lineHeight: 1.5,
                                  textAlign: "start",
                                  whiteSpace: "pre-wrap",
                                  maxWidth: "100%",
                                }}
                              >
                                {editingMessageId === msg.id ? (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: 1,
                                    }}
                                  >
                                    <TextField
                                      value={editingText}
                                      onChange={(e) =>
                                        setEditingText(e.target.value)
                                      }
                                      multiline
                                      fullWidth
                                      variant="outlined"
                                      sx={{
                                        "& .MuiOutlinedInput-root": {
                                          color: "#fff",
                                          "& fieldset": {
                                            borderColor:
                                              "rgba(255,255,255,0.3)",
                                          },
                                          "&:hover fieldset": {
                                            borderColor:
                                              "rgba(255,255,255,0.5)",
                                          },
                                          "&.Mui-focused fieldset": {
                                            borderColor: "#fff",
                                          },
                                        },
                                      }}
                                    />
                                    <Box
                                      sx={{
                                        display: "flex",
                                        gap: 1,
                                        justifyContent: "flex-end",
                                      }}
                                    >
                                      <IconButton
                                        size="small"
                                        onClick={() => handleSaveEdit(msg.id!)}
                                        sx={{
                                          color: "#fff",
                                          bgcolor: "rgba(255,255,255,0.1)",
                                        }}
                                      >
                                        <CheckIcon fontSize="small" />
                                      </IconButton>
                                      <IconButton
                                        size="small"
                                        onClick={handleCancelEdit}
                                        sx={{
                                          color: "#fff",
                                          bgcolor: "rgba(255,255,255,0.1)",
                                        }}
                                      >
                                        <CloseIcon fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  </Box>
                                ) : (
                                  <Box>
                                    {msg.text}
                                    {msg.edited && (
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          color: "rgba(255,255,255,0.6)",
                                          fontSize: "0.75rem",
                                          ml: 1,
                                        }}
                                      >
                                        (edited)
                                      </Typography>
                                    )}
                                  </Box>
                                )}
                              </Box>
                              {editingMessageId !== msg.id &&
                                msg.sender === "user" && (
                                  <IconButton
                                    className="edit-button"
                                    size="small"
                                    onClick={() =>
                                      handleEditMessage(msg.id!, msg.text)
                                    }
                                    sx={{
                                      position: "absolute",
                                      right: 8,
                                      bottom: -32,
                                      color: "#666",
                                      bgcolor: "rgba(0,0,0,0.05)",
                                      opacity: 0,
                                      transition: "opacity 0.2s",
                                      pointerEvents: "auto",
                                      "&:hover": {
                                        bgcolor: "rgba(0,0,0,0.1)",
                                        opacity: 1,
                                      },
                                    }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                )}

                              {/* Reactions hidden for user messages */}
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  )
                )}
            </Box>

            {/* Persona Switcher Popup */}
            {switcherOpen && anchorEl && (
              <ClickAwayListener onClickAway={handleSwitcherClose}>
                <Box
                  sx={{
                    position: "absolute",
                    top: { xs: 140, sm: 160 },
                    left: { xs: "50%", sm: "calc(50% + 100px)" },
                    transform: { xs: "translateX(-50%)", sm: "none" },
                    bgcolor: "#F8F9FA",
                    borderRadius: 2,
                    boxShadow: "0 2px 8px 0 rgba(44,62,80,0.10)",
                    p: { xs: 1, sm: 1.1 },
                    minWidth: { xs: 200, sm: 160 },
                    zIndex: 30,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#888",
                      fontWeight: 600,
                      mb: 1,
                      fontSize: { xs: 14, sm: 15 },
                    }}
                  >
                    Switch Persona
                  </Typography>
                  {/* Optionally, you can fetch and show other personas for switching here if needed */}
                </Box>
              </ClickAwayListener>
            )}
          </Box>

          {/* Fixed elements at the bottom */}
          <Box
            sx={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              pt: 0,
              pb: { xs: 2, sm: 4 },
              background:
                "linear-gradient(180deg, rgba(255,255,255,0) 0%, #fff 20%)",
            }}
          >
            {/* Archived conversation notice */}
            {currentConversation?.archivedAt && (
              <Box sx={{ mb: 2, px: 2, maxWidth: 960, width: "100%" }}>
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  <Typography variant="body2">
                    <strong>This conversation is archived.</strong> You cannot
                    send new messages or edit existing ones. You can unarchive
                    it from the conversation settings to continue chatting.
                  </Typography>
                </Alert>
              </Box>
            )}

            {/* Suggestion Chips - Hide after user sends first message */}
            {/* Removed suggestion chips rendering from ChatPage */}

            {/* Chat InputBar with file upload support */}
            <ChatInputBar
              value={messageInput}
              onChange={setMessageInput}
              onSend={handleSendMessage}
              disabled={
                isLoading ||
                !!currentConversation?.archivedAt ||
                isRestoringConversation
              }
              persona={persona}
              conversationId={currentConversationId}
              sidebarOpen={sidebarOpen}
              sidebarWidth={SIDEBAR_WIDTH}
              maxWidth={960}
              suggestions={suggestionChips}
              showSuggestions={!hasUserMessages && !isInConversationRestoration}
            />
          </Box>
        </Box>
      </Box>

      {/* Conversation Settings Dialog */}
      <ConversationSettingsDialog
        open={settingsDialogOpen}
        onClose={handleCloseSettings}
        conversation={currentConversation}
        onConversationUpdate={handleConversationUpdate}
      />

      {/* Chat search modal */}
      <ChatSearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        sessions={chatSessions}
        onSelect={({ session_id }) => {
          setSearchOpen(false);
          if (persona?.id) {
            navigate(`/chat/${persona.id}?conversationId=${session_id}`);
          }
        }}
        onStartNewChat={() => {
          setSearchOpen(false);
          if (persona?.id) {
            const draftId = `${Date.now().toString(36)}-${Math.random()
              .toString(36)
              .slice(2, 8)}`;
            navigate(`/chat/${persona.id}?draft=${draftId}`);
          } else {
            // Fallback: navigate to personas page if no persona context
            navigate("/personas");
          }
        }}
        hasPersonaContext={!!persona?.id}
      />
    </Box>
  );
}
