/**
 * PersonaCard Component
 *
 * Displays a persona/character card with interactive features for viewing details
 * and starting conversations. Features responsive design and hover effects.
 *
 * Features:
 * - Responsive card sizing based on screen size
 * - Hover effects with image overlay and action buttons
 * - Click to start chat functionality
 * - View persona details with external link icon
 * - Smooth transitions and animations
 */

import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { Persona } from "../types";

/**
 * Props interface for the PersonaCard component
 */
interface PersonaCardProps {
  /** The persona data to display */
  persona: Persona;
  /** Optional callback when user clicks to start a chat */
  onStartChat?: (persona: Persona) => void;
  /** Optional callback when user clicks to view persona details */
  onViewPersona?: (persona: Persona) => void;
  /** Whether the card should take full width of its container */
  cardFullWidth?: boolean;
}

/**
 * PersonaCard Component
 *
 * Renders a card displaying persona information with interactive features.
 * Supports both default navigation and custom callback handlers.
 */
const PersonaCard: React.FC<PersonaCardProps> = ({
  persona,
  onStartChat,
  onViewPersona,
  cardFullWidth,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const hasRole = Boolean(
    (persona as any).role && String((persona as any).role).trim().length
  );

  /**
   * Handle view persona click event
   * Prevents event bubbling and navigates to persona details page
   */
  const handleViewPersona = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    if (onViewPersona) {
      onViewPersona(persona);
    } else {
      // Default navigation if no handler provided
      navigate(`/view-persona/${persona.id}`);
    }
  };

  return (
    <Card
      sx={{
        borderRadius: 2,
        width: cardFullWidth
          ? "100%"
          : { xs: "100%", sm: 240, md: 270, lg: 250 },
        maxWidth: cardFullWidth
          ? "100%"
          : { xs: 320, sm: 240, md: 270, lg: 250 },
        backgroundColor: "transparent",
        boxShadow: "none",
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        cursor: "pointer",
        position: "relative",
        overflow: "visible",
        "&:hover": {
          transform: "translateY(-2px)",
          "& .persona-image": {
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          },
          "& .persona-image-overlay": {
            opacity: 1,
          },
          "& .start-chat-text": {
            opacity: 1,
            pointerEvents: "auto",
            color: "white",
          },
        },
        // Prevent hover effects when hovering over role
        "&:has(.role-link:hover)": {
          transform: "none",
          "& .persona-image": {
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          },
          "& .persona-image-overlay": {
            opacity: 0,
          },
          "& .start-chat-text": {
            opacity: 0,
            pointerEvents: "none",
          },
        },
      }}
      onClick={() => onStartChat?.(persona)}
    >
      <Box sx={{ position: "relative" }}>
        {/* Persona avatar image */}
        <CardMedia
          component="img"
          height={isMobile ? "250" : isTablet ? "230" : "210"}
          image={persona.avatarUrl || persona.avatar || ""}
          alt={persona.name}
          className="persona-image"
          sx={{
            objectFit: "cover",
            objectPosition: "top center",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            transition: "box-shadow 0.2s ease-in-out",
            width: "100%",
          }}
        />
        {/* Overlay for dimming effect on hover */}
        <Box
          className="persona-image-overlay"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: "8px",
            background: "rgba(0,0,0,0.25)",
            opacity: 0,
            transition: "opacity 0.2s",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />
        {/* Start Chat text overlay */}
        <Box
          className="start-chat-text"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0,
            pointerEvents: "none",
            transition: "opacity 0.2s, color 0.2s",
            zIndex: 2,
            fontWeight: 600,
            fontSize: { xs: "14px", sm: "15px" },
            color: "white",
            userSelect: "none",
            cursor: "pointer",
            "&:hover": {
              color: "#2950DA",
            },
          }}
          onClick={(e) => {
            e.stopPropagation();
            onStartChat?.(persona);
          }}
        >
          Start Chat
        </Box>
      </Box>
      <CardContent
        sx={{
          p: { xs: 1.5, sm: 2 },
          pt: { xs: 1, sm: 1.5 },
          pb: "0px !important",
          background: "transparent",
        }}
      >
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontFamily: "Inter, Roboto, Helvetica, Arial, sans-serif",
            fontWeight: 500,
            fontSize: { xs: "15px", sm: "16px" },
            lineHeight: { xs: "20px", sm: "24px" },
            letterSpacing: 0,
            color: "#333",
            textAlign: { xs: "center", sm: "left" },
            mb: 0.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "normal",
          }}
        >
          {persona.name}
        </Typography>

        {/* Clickable Role with External Link Icon */}
        {hasRole && (
          <Box
            className="role-link"
            onClick={handleViewPersona}
            sx={{
              display: "inline-flex",
              alignItems: "flex-end",
              justifyContent: { xs: "center", sm: "flex-start" },
              gap: 0.5,
              cursor: "pointer",
              transition: "color 0.2s ease-in-out",
              color: "#2950DA",
              position: "relative",
              zIndex: 10, // Ensure it's above other elements
              "&:hover": { color: "#2950DA" },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontFamily: "Inter, Roboto, Helvetica, Arial, sans-serif",
                fontWeight: 400,
                fontSize: { xs: "13px", sm: "14px" },
                lineHeight: 1.5,
                letterSpacing: 0,
                color: "inherit",
              }}
            >
              {(persona as any).role}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PersonaCard;
