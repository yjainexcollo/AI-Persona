import React from "react";
import { Box, Grid, Avatar, Typography, IconButton } from "@mui/material";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import type { Persona } from "../../types";

interface PersonaSelectorGridProps {
  personas: Persona[];
  onSelect: (persona: Persona) => void;
  onViewPersona: (persona: Persona) => void;
}

const PersonaSelectorGrid: React.FC<PersonaSelectorGridProps> = ({
  personas,
  onSelect,
  onViewPersona,
}) => (
  <Box sx={{ width: "100%", maxWidth: 1000, mx: "auto", mt: -2 }}>
    <Grid container columnSpacing={2} rowSpacing={6} justifyContent="center">
      {personas.map((persona) => (
        <Grid
          item
          xs={12}
          sm={4}
          md={4}
          lg={4}
          xl={4}
          key={persona.id}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <IconButton
            onClick={() => onSelect(persona)}
            sx={{ p: 0, mb: 1.5, "&:hover": { background: "transparent" } }}
          >
            <Avatar
              src={persona.avatarUrl || persona.avatar || ""}
              sx={{ width: 104, height: 104, mb: 0 }}
            />
          </IconButton>
          <Typography
            onClick={() => onSelect(persona)}
            sx={{
              fontWeight: 700,
              fontSize: 20,
              color: "#222",
              textAlign: "center",
              mb: 0.5,
              cursor: "pointer",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            {persona.name}
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              justifyContent: "center",
            }}
          >
            <Typography
              onClick={() => onViewPersona(persona)}
              sx={{
                color: "#2950DA",
                fontWeight: 500,
                fontSize: 16,
                textAlign: "center",
                textTransform: "capitalize",
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {persona.role}
            </Typography>
            <ArrowOutwardIcon
              sx={{
                color: "#2950DA",
                fontSize: 18,
                mb: "-2px",
                cursor: "pointer",
              }}
              onClick={() => onViewPersona(persona)}
            />
          </Box>
        </Grid>
      ))}
    </Grid>
  </Box>
);

export default PersonaSelectorGrid;
