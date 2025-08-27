// Main sidebar component with personas, favorites, and recent chats
import React, { useState, useEffect } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Typography,
  Button,
  IconButton,
  Avatar,
  ListSubheader,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  ChevronLeft as ChevronLeftIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import type { Persona } from "../../types";
import {
  getPersonas,
  getConversations,
  getUserChatSessions,
  createShareableLink,
  updateConversationVisibility,
  type Conversation,
} from "../../services/personaService";
import ConversationSettingsDialog from "../ConversationSettingsDialog";

interface FavoritePersona {
  id: string;
  name: string;
  personalName?: string;
  avatar: string;
  role?: string;
}

const Sidebar: React.FC<{
  onClose?: () => void;
  currentPersonaId?: string;
  currentConversationId?: string;
  onSearchChats?: () => void;
  activePersona?: { id: string; name: string; avatarUrl?: string };
  activeLastMessage?: string;
}> = ({
  onClose,
  currentPersonaId,
  currentConversationId,
  onSearchChats,
  activePersona,
  activeLastMessage,
}) => {
  const navigate = useNavigate();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [favoritePersonas, setFavoritePersonas] = useState<FavoritePersona[]>(
    []
  );
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [recentChats, setRecentChats] = useState<Conversation[]>([]);
  const [loadingRecentChats, setLoadingRecentChats] = useState(false);
  const [currentPersonaName] = useState<string>("");
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  // Fetch all personas from backend API
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

  // Fetch user's favorite personas from backend API
  useEffect(() => {
    const fetchFavorites = async () => {
      setLoadingFavorites(true);
      try {
        // For now, we'll use a simple approach since the backend doesn't have a direct favorites endpoint
        // We'll filter personas that have isFavourited property set to true
        const favoritePersonaData = personas
          .filter((persona) => persona.isFavourited)
          .map((persona) => ({
            id: persona.id,
            name: persona.name,
            personalName: persona.personalName,
            avatar: persona.avatarUrl || persona.avatar || "",
            role: persona.name || "",
          }));
        setFavoritePersonas(favoritePersonaData);
      } catch (error) {
        console.error("Error fetching favorites:", error);
        setFavoritePersonas([]);
      }
      setLoadingFavorites(false);
    };
    fetchFavorites();
  }, [personas]);

  // Fetch recent chats from backend API (use sessions for proper message loading)
  useEffect(() => {
    const fetchRecentChats = async () => {
      setLoadingRecentChats(true);
      try {
        // Use chat sessions API like ChatHistory does for consistency
        const sessions = await getUserChatSessions();
        const normalized: Conversation[] = (sessions || [])
          .map((s: any) => {
            const lastMsg = (s.messages || []).slice(-1)[0];
            // Only include sessions that have a valid conversation ID
            if (!s.conversation?.id) return null;
            return {
              id: s.conversation.id,
              title: s.conversation?.title || "",
              userId: s.user?.id || "",
              personaId: s.persona?.id || s.conversation?.personaId || "",
              visibility: (s.conversation?.visibility || "PRIVATE") as any,
              archivedAt: s.conversation?.archivedAt || null,
              createdAt: s.conversation?.createdAt || new Date().toISOString(),
              updatedAt: s.conversation?.updatedAt || new Date().toISOString(),
              persona: {
                id: s.persona?.id || "",
                name: s.persona?.name || "",
                avatarUrl: s.persona?.avatarUrl || "",
              },
              user: s.user || { id: "", name: "", email: "" },
              messages: s.messages || [],
              _count: { messages: (s.messages || []).length },
              lastMessage: lastMsg ? lastMsg.content || lastMsg.text : "",
              // Store sessionId for proper navigation
              sessionId: s.sessionId,
            } as Conversation & { sessionId?: string };
          })
          .filter((c) => c !== null);

        let list = normalized;
        if (currentPersonaId) {
          list = list.filter((c) => c.personaId === currentPersonaId);
        }

        list = list
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
          .slice(0, 10);

        setRecentChats(list);
      } catch (error) {
        console.error("Error fetching recent chats:", error);
        setRecentChats([]);
      }
      setLoadingRecentChats(false);
    };
    fetchRecentChats();
  }, [currentPersonaId]);

  // Handler for New Chat button
  const handleNewChat = () => {
    const draftId = `${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    // Prefer starting a new chat for the current persona context if provided
    if (currentPersonaId) {
      navigate(`/chat/${currentPersonaId}?draft=${draftId}`);
      if (onClose) onClose();
      return;
    }

    const defaultPersona = personas[0];
    if (defaultPersona) {
      navigate(`/chat/${defaultPersona.id}?draft=${draftId}`);
      if (onClose) onClose();
      return;
    }
    // If no personas available, route to discovery to pick one
    navigate(`/discovery`);
    if (onClose) onClose();
  };

  // Handler for favorite persona click
  const handleFavoritePersonaClick = (personaId: string) => {
    navigate(`/chat/${personaId}`);
    if (onClose) onClose();
  };

  // Handler for search chats click
  const handleSearchChats = () => {
    // Trigger search modal in parent component
    if (onSearchChats) {
      onSearchChats();
    }
    // Close sidebar after opening search modal
    if (onClose) onClose();
  };

  // Handler for sharing a conversation
  const handleShareConversation = async (
    conversationId: string,
    event?: React.MouseEvent
  ) => {
    // Safely stop propagation if an event was provided
    try {
      event?.stopPropagation?.();
    } catch {}
    console.log("Share button clicked for conversation:", conversationId);
    try {
      // Ensure conversation is SHARED before creating link
      try {
        await updateConversationVisibility(conversationId, "SHARED");
      } catch (visibilityErr) {
        console.warn(
          "Failed to set visibility to SHARED before sharing:",
          visibilityErr
        );
      }

      const response = await createShareableLink(conversationId);
      const link = response.data.url;

      // Open dialog first to avoid being blocked by clipboard permissions
      setShareUrl(link);
      setShareDialogOpen(true);

      // Try to copy (non-blocking)
      try {
        await navigator.clipboard.writeText(link);
        console.log("Share link copied to clipboard:", link);
      } catch {}
    } catch (error) {
      console.error("Error creating share link:", error);
      setShareUrl("Failed to generate link. Try again.");
      setShareDialogOpen(true);
    }
  };

  // Handler for opening the menu
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    conversationId: string
  ) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedConversationId(conversationId);
  };

  // Handler for closing the menu
  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedConversationId(null);
  };

  // Handler for conversation settings
  const handleConversationSettings = (conversationId: string) => {
    const conversation = recentChats.find((chat) => chat.id === conversationId);
    if (conversation) {
      setSelectedConversation(conversation);
      setSettingsDialogOpen(true);
    }
    handleMenuClose();
  };

  // Handler for conversation update from settings dialog
  const handleConversationUpdate = (
    conversationId: string,
    updates: Partial<Conversation>
  ) => {
    setRecentChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === conversationId ? { ...chat, ...updates } : chat
      )
    );
  };

  // Handler for closing settings dialog
  const handleSettingsDialogClose = () => {
    setSettingsDialogOpen(false);
    setSelectedConversation(null);
  };

  // Handler for clicking on a recent chat
  const handleRecentChatClick = (
    conversation: Conversation & { sessionId?: string }
  ) => {
    const personaId = conversation.personaId;
    const conversationId = conversation.id;
    const sessionId = (conversation as any).sessionId;

    if (personaId && conversationId) {
      // Navigate with both conversationId and sessionId like ChatHistory does
      const url = sessionId
        ? `/chat/${personaId}?conversationId=${conversationId}&sessionId=${sessionId}`
        : `/chat/${personaId}?conversationId=${conversationId}`;
      navigate(url);
      if (onClose) onClose();
    }
  };

  // Determine the active conversation (if provided)
  let activeConversation =
    currentConversationId && recentChats.length
      ? recentChats.find((c) => c.id === currentConversationId) || null
      : null;

  // If not found in recent list but we have current persona context, synthesize a placeholder active chat
  if (!activeConversation && activePersona) {
    activeConversation = {
      id: currentConversationId || `draft-${activePersona.id}`,
      title: "",
      userId: "",
      personaId: activePersona.id,
      visibility: "PRIVATE" as any,
      archivedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      persona: {
        id: activePersona.id,
        name: activePersona.name,
        avatarUrl: activePersona.avatarUrl || "",
      },
      user: { id: "", name: "", email: "" },
      messages: [],
      _count: { messages: 0 },
      lastMessage: activeLastMessage || "",
    } as Conversation;
  }

  // Build the recent list excluding the active conversation to avoid duplication
  const recentWithoutActive = activeConversation
    ? recentChats.filter((c) => c.id !== activeConversation.id)
    : recentChats;

  return (
    <Box
      sx={{
        width: { xs: "86vw", sm: 280, md: 280 },
        maxWidth: "100vw",
        height: "100vh",
        bgcolor: "#fff",
        p: 0,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid #e0e0e0",
        overflowY: "auto",
        overflowX: "hidden",
        fontFamily: "Inter, Roboto, Helvetica, Arial, sans-serif",
        // Hide scrollbar for all browsers
        scrollbarWidth: "none", // Firefox
        "&::-webkit-scrollbar": { display: "none" }, // Chrome, Safari, Opera
      }}
    >
      {/* Header: back icon and Pine labs */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: { xs: 2, sm: 3 },
          px: 0,
          py: { xs: 1, sm: 1.5 },
          mt: { xs: 1, sm: 1.8 },
          pt: 0,
          pl: { xs: 1.5, sm: 2 },
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            color: "#012A1F",
            fontSize: { xs: 24, sm: 28 },
            p: 0,
            minWidth: { xs: 40, sm: 32 },
            minHeight: { xs: 40, sm: 32 },
            mr: 0.2,
            fontWeight: 900,
          }}
        >
          <ChevronLeftIcon
            sx={{ fontSize: { xs: 24, sm: 28 }, color: "#012A1F" }}
          />
        </IconButton>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "#012A1F",
            fontSize: { xs: 20, sm: 22 },
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            ml: { xs: 1, sm: 1.2 },
          }}
        >
          <img
            src="/logo.png"
            alt="Logo"
            style={{
              height: "20px",
              width: "auto",
              verticalAlign: "middle",
              cursor: "pointer",
            }}
          />
        </Typography>
      </Box>

      {/* New Chat Button */}
      <Button
        variant="contained"
        size="medium"
        startIcon={<AddIcon sx={{ fontSize: 18 }} />}
        aria-label="Start a new chat"
        sx={{
          background: "linear-gradient(90deg, #2950DA 0%, #1E88E5 100%)",
          color: "#fff",
          borderRadius: 2,
          fontWeight: 700,
          fontSize: { xs: 15, sm: 16 },
          py: { xs: 1.3, sm: 3 },
          mb: { xs: 1.5, sm: 1.8 },
          mt: { xs: 1.5, sm: 2 },
          boxShadow: "0 4px 12px rgba(41,80,218,0.18)",
          textTransform: "none",
          width: "calc(100% - 95px)",
          minWidth: 0,
          letterSpacing: 0.2,
          mx: 2,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          transition:
            "transform 0.15s ease, box-shadow 0.15s ease, background 0.2s ease",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: "0 6px 16px rgba(41,80,218,0.25)",
            background: "linear-gradient(90deg, #1E6FE5 0%, #2950DA 100%)",
          },
          "&:disabled": {
            background: "#b0bec5",
            color: "#f5f5f5",
          },
        }}
        onClick={handleNewChat}
      >
        New chat
      </Button>

      {/* Menu Options */}
      <List
        sx={{
          mb: { xs: 2, sm: 2.5 },
          mx: { xs: 1.5, sm: 2 },
          width: "100%",
          maxWidth: "100%",
        }}
      >
        <ListItem
          button
          sx={{ px: 0, mb: { xs: 1, sm: 1.2 }, minWidth: 0 }}
          onClick={() =>
            navigate(
              `/view-persona/${
                currentPersonaId || (personas[0] && personas[0].id)
              }`
            )
          }
        >
          <ListItemAvatar sx={{ minWidth: { xs: 40, sm: 32 } }}>
            <PersonIcon
              sx={{
                color: "#222",
                fontSize: { xs: 24, sm: 22 },
                marginTop: 0.5,
              }}
            />
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography
                sx={{
                  fontWeight: 500,
                  color: "#222",
                  fontSize: { xs: 15, sm: 16 },
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                View Persona
              </Typography>
            }
          />
        </ListItem>
        <ListItem
          button
          sx={{ px: 0, minWidth: 0 }}
          onClick={handleSearchChats}
        >
          <ListItemAvatar sx={{ minWidth: { xs: 40, sm: 32 } }}>
            <SearchIcon
              sx={{
                color: "#222",
                fontSize: { xs: 24, sm: 22 },
                marginTop: 0.5,
              }}
            />
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography
                sx={{
                  fontWeight: 500,
                  color: "#222",
                  fontSize: { xs: 15, sm: 16 },
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Search Chats
              </Typography>
            }
          />
        </ListItem>
      </List>

      {/* Favorite Personas */}
      <List
        sx={{
          mb: { xs: 1.5, sm: 2 },
          mx: { xs: 1.5, sm: 2 },
          width: "100%",
          maxWidth: "100%",
        }}
        subheader={
          <ListSubheader
            component="div"
            disableSticky
            sx={{
              bgcolor: "transparent",
              fontWeight: 800,
              color: "#111",
              fontSize: { xs: 20, sm: 22 },
              letterSpacing: -1,
              px: 0,
              py: 0.1,
              mt: -1.2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Favorite Personas
          </ListSubheader>
        }
      >
        {loadingFavorites ? (
          <ListItem sx={{ px: 0, py: { xs: 1, sm: 1.2 }, minWidth: 0 }}>
            <ListItemText
              primary={
                <Typography
                  sx={{
                    fontWeight: 500,
                    color: "#888",
                    fontSize: { xs: 14, sm: 15 },
                    fontStyle: "italic",
                  }}
                >
                  Loading favorites...
                </Typography>
              }
            />
          </ListItem>
        ) : favoritePersonas.length > 0 ? (
          favoritePersonas.map((persona) => (
            <ListItem
              key={persona.id}
              button
              sx={{ px: 0, py: { xs: 1, sm: 1.2 }, minWidth: 0 }}
              onClick={() => handleFavoritePersonaClick(persona.id)}
            >
              <ListItemAvatar sx={{ minWidth: { xs: 44, sm: 36 } }}>
                <Avatar
                  src={persona.avatar || ""}
                  sx={{
                    width: { xs: 36, sm: 32 },
                    height: { xs: 36, sm: 32 },
                    mr: 1,
                  }}
                />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography
                    sx={{
                      fontWeight: 500,
                      color: "#222",
                      fontSize: { xs: 14, sm: 15 },
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {persona.personalName || persona.name}
                  </Typography>
                }
                secondary={
                  persona.name && (
                    <Typography
                      sx={{
                        color: "#666",
                        fontSize: { xs: 12, sm: 13 },
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {persona.name}
                    </Typography>
                  )
                }
              />
            </ListItem>
          ))
        ) : (
          <ListItem sx={{ px: 0, py: { xs: 1, sm: 1.2 }, minWidth: 0 }}>
            <ListItemText
              primary={
                <Typography
                  sx={{
                    fontWeight: 500,
                    color: "#888",
                    fontSize: { xs: 14, sm: 15 },
                    fontStyle: "italic",
                  }}
                >
                  No favorite personas yet
                </Typography>
              }
            />
          </ListItem>
        )}
      </List>

      {/* Active Chat (pinned at top if available) */}
      {activeConversation && (
        <List
          sx={{
            mx: { xs: 1.5, sm: 2 },
            width: "100%",
            maxWidth: "100%",
            mb: 1,
          }}
          subheader={
            <ListSubheader
              component="div"
              disableSticky
              sx={{
                bgcolor: "transparent",
                fontWeight: 800,
                color: "#111",
                fontSize: { xs: 18, sm: 20 },
                letterSpacing: -1,
                px: 0,
                py: 0.5,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "100%",
              }}
            >
              Active Chat
            </ListSubheader>
          }
        >
          <ListItem
            button
            sx={{
              px: 0,
              py: { xs: 1, sm: 1.2 },
              minWidth: 0,
              display: "flex",
              alignItems: "center",
              gap: 1,
              overflow: "visible",
              bgcolor: "#EEF3FF",
              borderRadius: 1.5,
            }}
            onClick={() => handleRecentChatClick(activeConversation)}
          >
            <ListItemAvatar sx={{ minWidth: 36, flexShrink: 0 }}>
              <Avatar
                src={activeConversation.persona?.avatarUrl || ""}
                sx={{ width: 28, height: 28, mr: 1 }}
              />
            </ListItemAvatar>
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                overflow: "visible",
                display: "flex",
                flexDirection: "column",
                pr: 1,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  mb: 0,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    color: "#1E3A8A",
                    fontSize: 14,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    flex: "1 1 0%",
                    minWidth: 0,
                    maxWidth: "calc(100% - 40px)",
                    mr: 0,
                  }}
                >
                  {activeConversation.persona?.name || "Unknown Persona"}
                </Typography>
              </Box>
              <Typography
                sx={{
                  color: "#1E3A8A",
                  fontSize: 12,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  minWidth: 0,
                }}
              >
                {activeConversation.lastMessage || "No messages"}
              </Typography>
            </Box>
          </ListItem>
        </List>
      )}

      {/* Recent Chats */}
      <List
        sx={{ mx: { xs: 1.5, sm: 2 }, width: "100%", maxWidth: "100%" }}
        subheader={
          <ListSubheader
            component="div"
            disableSticky
            sx={{
              bgcolor: "transparent",
              fontWeight: 800,
              color: "#111",
              fontSize: { xs: 18, sm: 20 },
              letterSpacing: -1,
              px: 0,
              py: 0.5,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "100%",
            }}
          >
            {currentPersonaName
              ? `${currentPersonaName} Chats`
              : "Recent Chats"}
          </ListSubheader>
        }
      >
        {loadingRecentChats ? (
          <ListItem sx={{ px: 0, py: { xs: 1, sm: 1.2 }, minWidth: 0 }}>
            <ListItemText
              primary={
                <Typography
                  sx={{
                    fontWeight: 500,
                    color: "#888",
                    fontSize: { xs: 14, sm: 15 },
                    fontStyle: "italic",
                  }}
                >
                  Loading recent chats...
                </Typography>
              }
            />
          </ListItem>
        ) : recentWithoutActive.length > 0 ? (
          recentWithoutActive.map((conversation) => (
            <ListItem
              key={conversation.id}
              button
              sx={{
                px: 0,
                py: { xs: 1, sm: 1.2 },
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                gap: 1,
                overflow: "visible",
              }}
              onClick={() => handleRecentChatClick(conversation)}
            >
              <ListItemAvatar sx={{ minWidth: 36, flexShrink: 0 }}>
                <Avatar
                  src={conversation.persona?.avatarUrl || ""}
                  sx={{
                    width: 28,
                    height: 28,
                    mr: 1,
                  }}
                />
              </ListItemAvatar>
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  overflow: "visible",
                  display: "flex",
                  flexDirection: "column",
                  pr: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    mb: 0,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 500,
                      color: "#222",
                      fontSize: 14,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      flex: "1 1 0%",
                      minWidth: 0,
                      maxWidth: "calc(100% - 40px)",
                      mr: 0,
                    }}
                  >
                    {conversation.persona?.name || "Unknown Persona"}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, conversation.id)}
                    sx={{
                      color: "#666",
                      flexShrink: 0,
                      p: "4px",
                      ml: 0.5,
                      "&:hover": {
                        color: "#1976d2",
                        backgroundColor: "rgba(25, 118, 210, 0.08)",
                      },
                    }}
                  >
                    <MoreVertIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
                <Typography
                  sx={{
                    color: "#666",
                    fontSize: 12,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    minWidth: 0,
                  }}
                >
                  {conversation.lastMessage || "No messages"}
                </Typography>
              </Box>
            </ListItem>
          ))
        ) : (
          <ListItem sx={{ px: 0, py: { xs: 1, sm: 1.2 }, minWidth: 0 }}>
            <ListItemText
              primary={
                <Typography
                  sx={{
                    fontWeight: 500,
                    color: "#888",
                    fontSize: { xs: 14, sm: 15 },
                    fontStyle: "italic",
                  }}
                >
                  {currentPersonaName
                    ? `No ${currentPersonaName} chats yet`
                    : "No recent chats"}
                </Typography>
              }
            />
          </ListItem>
        )}
      </List>

      {/* Menu for sharing/settings */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <MenuItem
          onClick={() => {
            if (selectedConversationId) {
              handleShareConversation(
                selectedConversationId,
                {} as React.MouseEvent
              );
            }
            handleMenuClose();
          }}
        >
          <ShareIcon sx={{ mr: 1 }} /> Share
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedConversationId) {
              handleConversationSettings(selectedConversationId);
            }
          }}
        >
          <SettingsIcon sx={{ mr: 1 }} /> Conversation Settings
        </MenuItem>
      </Menu>

      {/* Share Link Dialog */}
      <Dialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Share Conversation</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1 }}>
            Shareable link (copied to clipboard):
          </Typography>
          <TextField
            fullWidth
            value={shareUrl}
            InputProps={{ readOnly: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(shareUrl);
              } catch {}
            }}
            variant="outlined"
          >
            Copy
          </Button>
          <Button onClick={() => setShareDialogOpen(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Conversation Settings Dialog */}
      <ConversationSettingsDialog
        open={settingsDialogOpen}
        onClose={handleSettingsDialogClose}
        conversation={selectedConversation}
        onConversationUpdate={handleConversationUpdate}
      />
    </Box>
  );
};

export default Sidebar;
