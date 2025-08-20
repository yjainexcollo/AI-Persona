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
  createShareableLink,
  type Conversation,
} from "../../services/personaService";
import ConversationSettingsDialog from "../ConversationSettingsDialog";

interface FavoritePersona {
  id: string;
  name: string;
  avatar: string;
  role?: string;
}

const Sidebar: React.FC<{
  onClose?: () => void;
  currentPersonaId?: string;
  onSearchChats?: () => void;
}> = ({ onClose, currentPersonaId, onSearchChats }) => {
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
            avatar: persona.avatarUrl || persona.avatar || "",
            role: persona.role || "",
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

  // Fetch recent chats from backend API
  useEffect(() => {
    const fetchRecentChats = async () => {
      setLoadingRecentChats(true);
      try {
        const response = await getConversations();
        const conversations = response.data || [];

        // Filter conversations by current persona and take the last 10
        if (currentPersonaId) {
          const personaConversations = conversations
            .filter(
              (conversation) => conversation.personaId === currentPersonaId
            )
            .sort(
              (a, b) =>
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime()
            )
            .slice(0, 10);
          setRecentChats(personaConversations);
        } else {
          setRecentChats([]);
        }
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
    const defaultPersona = personas[0];
    if (defaultPersona) {
      // Generate a unique session id for a new chat
      const sessionId = Date.now().toString();
      navigate(`/chat/${defaultPersona.id}?session=${sessionId}`);
      if (onClose) onClose();
    }
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
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
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
  const handleRecentChatClick = (conversation: Conversation) => {
    const personaId = conversation.personaId;
    const conversationId = conversation.id;

    if (personaId && conversationId) {
      navigate(`/chat/${personaId}?conversationId=${conversationId}`);
      if (onClose) onClose();
    }
  };

  return (
    <Box
      sx={{
        width: 320,
        height: "100vh",
        bgcolor: "#fff",
        p: 0,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid #e0e0e0",
        overflowY: "auto",
        overflowX: "hidden",
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
          variant="h5"
          sx={{
            fontFamily: "Inter, Roboto, Helvetica, Arial, sans-serif",
            fontWeight: 700,
            fontSize: { xs: "16px", sm: "18px" },
            lineHeight: { xs: "20px", sm: "23px" },
            letterSpacing: 0,
            color: "#0D1A12",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            ml: { xs: 1, sm: 1.2 },
          }}
        >
          Crudo.ai
        </Typography>
      </Box>

      {/* New Chat Button */}
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        disabled={personas.length === 0}
        sx={{
          bgcolor: "#2950DA",
          color: "#fff",
          borderRadius: 3,
          fontWeight: 500,
          fontSize: { xs: 16, sm: 19 },
          py: { xs: 2.5, sm: 2.8 },
          mb: { xs: 1.5, sm: 1.9 },
          mt: { xs: 2, sm: 2.5 },
          boxShadow: "none",
          textTransform: "none",
          width: "calc(100% - 32px)",
          minWidth: 0,
          letterSpacing: 0.1,
          "&:hover": { bgcolor: "#526794" },
          mx: 2,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
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
                    {persona.name}
                  </Typography>
                }
                secondary={
                  persona.role && (
                    <Typography
                      sx={{
                        color: "#666",
                        fontSize: { xs: 12, sm: 13 },
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {persona.role}
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
        ) : recentChats.length > 0 ? (
          recentChats.map((conversation) => (
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
