import React, { useEffect, useState } from "react";
import { Box, Avatar, Typography, Button } from "@mui/material";
import { toggleFavourite } from "../../services/personaService";

interface ViewPersonaHeaderProps {
  avatar: string;
  name: string;
  role: string;
  onStartChat: () => void;
}

const ViewPersonaHeader: React.FC<ViewPersonaHeaderProps> = ({
  avatar,
  name,
  role,
  onStartChat,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);

  // Get personaId from window.location or props
  const personaId = window.location.pathname.split("/").pop();
  // const [userId, setUserId] = useState<string | null>(null);

  // Fetch user ID from localStorage on mount
  // useEffect(() => {
  //   try {
  //     const user = JSON.parse(localStorage.getItem("user") || "{}");
  //     setUserId(user.id || null);
  //   } catch {
  //     setUserId(null);
  //   }
  // }, []);

  // Fetch favorite status from backend API
  useEffect(() => {
    const fetchFavorite = async () => {
      if (!personaId) return;
      try {
        // For now, we'll use a simple approach since the backend doesn't have a direct favorite status endpoint
        // We'll rely on the persona data that comes from the parent component
        setIsFavorite(false); // Default to false, can be enhanced later
      } catch {
        setIsFavorite(false);
      }
    };
    fetchFavorite();
  }, [personaId]);

  const handleToggleFavorite = async () => {
    if (!personaId) return;
    setLoadingFavorite(true);
    try {
      // Use backend API to toggle favorite
      const result = await toggleFavourite(personaId);
      setIsFavorite(result.isFavourited);
    } catch (err) {
      console.error("Error toggling favorite:", err);
      // Keep current state on error
    }
    setLoadingFavorite(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: { xs: "flex-start", sm: "center" },
        gap: 4,
        mb: 1,
        mt: -1.5,
        flexWrap: { xs: "wrap", sm: "nowrap" },
      }}
    >
      <Avatar src={avatar} sx={{ width: 100, height: 100, mt: 1.5 }} />
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{ fontWeight: 800, fontSize: 28, color: "#222", mb: 0.5 }}
        >
          {name}
        </Typography>
        <Typography
          sx={{ color: "#2950DA", fontWeight: 500, fontSize: 18, mb: 1 }}
        >
          {role}
        </Typography>
      </Box>
      <Box sx={{ flex: 1 }} />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mt: { xs: 2, sm: 0 },
        }}
      >
        <Button
          variant="contained"
          sx={{
            bgcolor: "#2950DA",
            color: "#fff",
            fontWeight: 700,
            fontSize: 15,
            borderRadius: 2,
            px: 3,
            py: 0.7,
            minHeight: 36,
            boxShadow: "none",
            textTransform: "none",
            "&:hover": { bgcolor: "#526794" },
          }}
          onClick={onStartChat}
        >
          Start Chat
        </Button>
        <Button
          variant={isFavorite ? "outlined" : "text"}
          onClick={handleToggleFavorite}
          disabled={loadingFavorite}
          sx={{
            ml: 1,
            fontWeight: 700,
            fontSize: 15,
            textTransform: "none",
            color: isFavorite ? "#e53935" : "#222",
            borderColor: isFavorite ? "#e53935" : "rgba(0,0,0,0.12)",
          }}
        >
          {isFavorite ? "Remove Favorite" : "Mark as favorite"}
        </Button>
      </Box>
    </Box>
  );
};

export default ViewPersonaHeader;
