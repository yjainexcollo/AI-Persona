import React, { useState, useEffect } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import Header from "../components/discover/Header";
import PersonaSelectorHeader from "../components/personaSelector/PersonaSelectorHeader";
import SearchBar from "../components/discover/SearchBar";
import PersonaSelectorGrid from "../components/personaSelector/PersonaSelectorGrid";
import ChatInputBar from "../components/ChatInputBar";
import type { Persona } from "../types";
import { useNavigate } from "react-router-dom";
import {
  getPersonas,
  type Persona as BackendPersona,
} from "../services/personaService";

const PersonaSelectorPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [personas, setPersonas] = useState<BackendPersona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPersonas() {
      try {
        setLoading(true);
        setError("");
        const response = await getPersonas();
        setPersonas(response.data || []);
      } catch (err) {
        console.error("Error fetching personas from backend:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load personas"
        );
        setPersonas([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPersonas();
  }, []);

  const filteredPersonas = personas
    .filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        ((p as any).personalName || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(search.toLowerCase())
    )
    .slice(0, 6); // Only show first six personas

  const handleSelect = (persona: Persona) => {
    navigate(`/chat/${persona.id}`);
  };

  const handleViewPersona = (persona: Persona) => {
    navigate(`/view-persona/${persona.id}`);
  };

  const handleSendMessage = (msgObj: {
    message: string;
    fileUrl?: string;
    fileType?: string;
  }) => {
    // For now, just log the message. Later you can implement logic to:
    // 1. Select a default persona or ask user to select one
    // 2. Navigate to chat with the message pre-filled
    console.log("Message to send:", msgObj.message);
    if (msgObj.fileUrl) {
      console.log("File attached:", msgObj.fileUrl, msgObj.fileType);
    }

    // Example: Navigate to first persona with message
    if (filteredPersonas.length > 0) {
      const firstPersona = filteredPersonas[0];
      if (firstPersona) {
        navigate(`/chat/${firstPersona.id}`, {
          state: { initialMessage: msgObj.message },
        });
      }
    }
  };

  const defaultSuggestions = [
    "Help me with marketing strategy",
    "Analyze sales performance",
    "Review technical architecture",
    "Get business insights",
    "Plan product roadmap",
  ];

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#fff",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        <Header />
        <PersonaSelectorHeader />
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography>Loading personas...</Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#fff",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        <Header />
        <PersonaSelectorHeader />
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography color="error">{error}</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#fff",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <Header />
      <PersonaSelectorHeader />

      {/* Main content area */}
      <Box sx={{ flex: 1, pb: 20 }}>
        <Box sx={{ width: "100%", maxWidth: 1300, mx: "auto", mb: 3 }}>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search"
            maxWidth={840}
            fullWidth
          />
        </Box>

        <PersonaSelectorGrid
          personas={filteredPersonas}
          onSelect={handleSelect}
          onViewPersona={handleViewPersona}
        />
      </Box>

      {/* Reusable Chat Input Bar */}
      <ChatInputBar
        value={message}
        onChange={setMessage}
        onSend={handleSendMessage}
        placeholder="Ask any question or describe what you need help with..."
        showSuggestions={true}
        suggestions={defaultSuggestions}
        maxWidth={1200}
      />
    </Box>
  );
};

export default PersonaSelectorPage;
