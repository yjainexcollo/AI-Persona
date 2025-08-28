import React, { useState } from "react";
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
} from "@mui/material";
import ArchiveIcon from "@mui/icons-material/Archive";
import UnarchiveIcon from "@mui/icons-material/Unarchive";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ShareIcon from "@mui/icons-material/Share";
import SettingsIcon from "@mui/icons-material/Settings";

interface ChatHistoryItemProps {
  avatar: string;
  name: string;
  message?: string;
  date: string;
  archived?: boolean;
  onClick?: () => void;
  onRightClick?: () => void;
  onArchive?: () => void;
  onUnarchive?: () => void;
  onShare?: () => void;
  onConversationSettings?: () => void;
}

const ChatHistoryItem: React.FC<ChatHistoryItemProps> = ({
  avatar,
  name,
  message,
  date,
  archived = false,
  onClick,
  onRightClick,
  onArchive,
  onUnarchive,
  onShare,
  onConversationSettings,
}) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleShare = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (onShare) {
      onShare();
    }
    handleMenuClose();
  };

  const handleConversationSettings = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (onConversationSettings) {
      onConversationSettings();
    }
    handleMenuClose();
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        py: 1.2,
        px: 0,
        borderRadius: 2,
        cursor: "pointer",
        "&:hover": { background: archived ? "#F0F2F5" : "#F5F7FA" },
        opacity: archived ? 0.8 : 1,
        backgroundColor: archived ? "#F8F9FA" : "transparent",
        border: archived ? "1px solid #E1E5E9" : "none",
        position: "relative",
        "&::before": archived
          ? {
              content: '""',
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "4px",
              backgroundColor: "#9CA3AF",
              borderRadius: "2px 0 0 2px",
            }
          : {},
      }}
      onClick={onClick}
      onContextMenu={(e) => {
        e.preventDefault();
        if (onRightClick) {
          onRightClick();
        }
      }}
    >
      <Avatar src={avatar} sx={{ width: 48, height: 48, mr: 2, ml: 0.5 }} />
      <Box sx={{ flex: 1, minWidth: 0, ml: 0.5 }}>
        <Typography
          sx={{ fontWeight: 700, fontSize: 17, color: "#222", lineHeight: 1.1 }}
        >
          {name}
        </Typography>
        {message ? (
          <Typography
            sx={{
              color: "#2950DA",
              fontWeight: 400,
              fontSize: 15,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: 400,
            }}
          >
            {message}
          </Typography>
        ) : null}
      </Box>
      <Typography
        sx={{
          color: "#526794",
          fontWeight: 400,
          fontSize: 15,
          minWidth: 70,
          textAlign: "right",
          ml: 0,
          mr: 1,
        }}
      >
        {date}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        {(onArchive || onUnarchive) && (
          <Tooltip title={archived ? "Unarchive" : "Archive"}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                if (archived && onUnarchive) {
                  onUnarchive();
                } else if (!archived && onArchive) {
                  onArchive();
                }
              }}
              sx={{
                color: archived ? "#2950DA" : "#666",
                backgroundColor: archived
                  ? "rgba(41, 80, 218, 0.1)"
                  : "transparent",
                "&:hover": {
                  color: archived ? "#1E40AF" : "#333",
                  backgroundColor: archived
                    ? "rgba(41, 80, 218, 0.2)"
                    : "rgba(0, 0, 0, 0.04)",
                },
                border: archived ? "1px solid rgba(41, 80, 218, 0.3)" : "none",
                transition: "all 0.2s ease-in-out",
              }}
            >
              {archived ? <UnarchiveIcon /> : <ArchiveIcon />}
            </IconButton>
          </Tooltip>
        )}
        <IconButton
          size="small"
          onClick={handleMenuOpen}
          sx={{
            color: "#666",
            p: "4px",
            "&:hover": {
              color: "#1976d2",
              backgroundColor: "rgba(25, 118, 210, 0.08)",
            },
          }}
        >
          <MoreVertIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

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
        <MenuItem onClick={(event) => handleShare(event)}>
          <ShareIcon sx={{ mr: 1 }} /> Share
        </MenuItem>
        <MenuItem onClick={(event) => handleConversationSettings(event)}>
          <SettingsIcon sx={{ mr: 1 }} /> Conversation Settings
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ChatHistoryItem;
