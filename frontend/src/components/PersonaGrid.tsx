// Grid layout for displaying persona cards
import React from "react";
import { Grid, Box } from "@mui/material";
import PersonaCard from "./PersonaCard";
import type { Persona } from "../types";

interface PersonaGridProps {
  personas: Persona[];
  onStartChat?: (persona: Persona) => void;
  onViewPersona?: (persona: Persona) => void;
}

const PersonaGrid: React.FC<PersonaGridProps> = ({
  personas,
  onStartChat,
  onViewPersona,
}) => {
  return (
    <Box
      sx={{
        flexGrow: 1,
        py: { xs: 1, sm: -1, md: -1 },
        px: 0,
        width: "100%",
        maxWidth: 1200,
      }}
    >
      <Grid
        container
        spacing={{ xs: 2, sm: 3, md: 4 }}
        justifyContent="flex-start"
        sx={{ width: "100%", margin: 0 }}
      >
        {personas.map((persona) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={3}
            key={persona.id}
            sx={{ width: "100%" }}
          >
            <PersonaCard
              persona={persona}
              onStartChat={onStartChat}
              onViewPersona={onViewPersona}
              cardFullWidth
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PersonaGrid;
