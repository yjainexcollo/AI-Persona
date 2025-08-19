import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
} from "@mui/material";

interface SimilarPersona {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

interface ViewPersonaSidebarProps {
  personas: SimilarPersona[];
  onSelect: (id: string) => void;
  currentPersonaId?: string;
}

const ViewPersonaSidebar: React.FC<ViewPersonaSidebarProps> = ({
  personas,
  onSelect,
  currentPersonaId,
}) => (
  <Box sx={{ width: 220, pt: 0, pr: 0 }}>
    <Typography sx={{ fontWeight: 800, fontSize: 18, mb: 0, color: "#222" }}>
      Similar Personas
    </Typography>
    <List>
      {personas.map((p) => (
        <ListItem
          key={p.id}
          button
          onClick={() => onSelect(p.id)}
          sx={{
            borderRadius: 2,
            mb: 0.5,
            "&:hover": { background: "#f5f5f7" },
            px: 1,
            background: p.id === currentPersonaId ? "#f0f0f2" : "transparent",
          }}
        >
          <ListItemAvatar>
            <Avatar src={p.avatar} sx={{ width: 44, height: 44, mr: 1 }} />
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#222" }}>
                {p.name}
              </Typography>
            }
            secondary={
              <Typography
                sx={{ color: "#2950DA", fontWeight: 500, fontSize: 14 }}
              >
                {p.role}
              </Typography>
            }
          />
        </ListItem>
      ))}
    </List>
  </Box>
);

export default ViewPersonaSidebar;
