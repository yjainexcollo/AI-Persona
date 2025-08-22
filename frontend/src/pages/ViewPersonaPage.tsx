import React, { useState, useEffect } from "react";
import { Box, Typography, CircularProgress, Button } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/discover/Header";
import ViewPersonaHeader from "../components/viewPersona/ViewPersonaHeader";
import ViewPersonaTabs from "../components/viewPersona/ViewPersonaTabs";
import ViewPersonaSection from "../components/viewPersona/ViewPersonaSection";
import ViewPersonaChips from "../components/viewPersona/ViewPersonaChips";
import ViewPersonaSidebar from "../components/viewPersona/ViewPersonaSidebar";
import { forwardPersonaTraitsViaBackend } from "../services/webhookService";
import { useAuth } from "../hooks/useAuth";
import type { Persona } from "../types";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import ComputerOutlinedIcon from "@mui/icons-material/ComputerOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import {
  getPersonas,
  getPersonaById,
  type Persona as BackendPersona,
} from "../services/personaService";

interface ViewPersonaPageProps {
  persona?: Persona;
}

interface Trait {
  title: string;
  description: string;
}

interface PersonaData {
  id: string;
  name: string;
  role: string;
  avatar: string;
  traits: Trait[];
}

interface SimilarPersona {
  id: string;
  name: string;
  role: string;
  avatar: string;
  personaRole?: string;
  avatarUrl?: string;
}

const ViewPersonaPage: React.FC<ViewPersonaPageProps> = ({
  persona: propPersona,
}) => {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [personaData, setPersonaData] = useState<PersonaData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [allPersonas, setAllPersonas] = useState<SimilarPersona[]>([]);
  const navigate = useNavigate();
  const { getAuthToken } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState("");
  const [updateError, setUpdateError] = useState("");

  // Fetch persona data function - moved outside useEffect for reuse
  const fetchPersonaData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!id) {
        setError("No persona ID provided");
        return;
      }

      // Fetch persona from backend API
      const persona = await getPersonaById(id);

      // For now, we'll use a simplified structure since traits are not in the backend API
      // In a real implementation, you might want to add traits to the backend API
      setPersonaData({
        id: persona.id,
        name: persona.name,
        role: (persona as any).personaRole || "",
        avatar: persona.avatarUrl || "",
        traits: [
          {
            title: "About",
            description: (persona as any).about || persona.description || "",
          },
          {
            title: "Core Expertise",
            description: (persona as any).coreExpertise || "",
          },
          {
            title: "Communication Style",
            description: (persona as any).communicationStyle || "",
          },
          { title: "Traits", description: persona.traits || "" },
          {
            title: "Pain Points",
            description: (persona as any).painPoints || "",
          },
          {
            title: "Key Responsibilities",
            description: (persona as any).keyResponsibility || "",
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching persona data:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load persona data"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch all personas for similar personas list
  useEffect(() => {
    async function fetchAllPersonas() {
      try {
        const response = await getPersonas();
        // Transform Persona[] to SimilarPersona[]
        const similarPersonas: SimilarPersona[] = (response.data || []).map(
          (persona) => ({
            id: persona.id,
            name: persona.name,
            role: persona.role || "Unknown",
            avatar: persona.avatarUrl || "",
            personaRole: (persona as any).personaRole,
            avatarUrl: persona.avatarUrl,
          })
        );
        setAllPersonas(similarPersonas);
      } catch (error) {
        console.error("Error fetching personas from backend:", error);
        setAllPersonas([]);
      }
    }
    fetchAllPersonas();
  }, []);

  useEffect(() => {
    if (id) {
      fetchPersonaData();
    }
  }, [id]);

  // Find trait by title
  const getTraitByTitle = (title: string) => {
    if (!personaData?.traits) return null;
    return personaData.traits.find(
      (trait) =>
        trait.title && trait.title.toLowerCase() === title.toLowerCase()
    );
  };

  // Get about section content
  const getAboutContent = () => {
    const aboutTrait = getTraitByTitle("About");
    return aboutTrait?.description || "No about information available.";
  };

  // Get communication style content
  const getCommunicationStyleContent = () => {
    const communicationTrait = getTraitByTitle("Communication Style");
    return (
      communicationTrait?.description ||
      "No communication style information available."
    );
  };

  // Helper to extract array from value
  function extractArray(val: unknown): string[] {
    if (Array.isArray(val)) return val as string[];
    if (val && typeof val === "object") {
      const rec = val as Record<string, unknown>;
      for (const k in rec) {
        const first = rec[k];
        if (Array.isArray(first)) return first as string[];
        break;
      }
    }
    if (typeof val === "string") {
      const trimmed = val.trim();
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed as string[];
        if (parsed && typeof parsed === "object") {
          const rec = parsed as Record<string, unknown>;
          for (const k in rec) {
            const first = rec[k];
            if (Array.isArray(first)) return first as string[];
            break;
          }
        }
      } catch {}
      return [val];
    }
    return [String(val ?? "")];
  }
  // Update getCoreExpertiseItems
  const getCoreExpertiseItems = () => {
    const expertiseTrait = getTraitByTitle("Core Expertise");
    if (!expertiseTrait?.description)
      return ["No core expertise information available."];
    return extractArray(expertiseTrait.description);
  };
  // Update getTraitsItems
  const getTraitsItems = () => {
    const traitsTrait = getTraitByTitle("Traits");
    if (!traitsTrait?.description) return ["No traits information available."];
    return extractArray(traitsTrait.description);
  };
  // Update getPainPointsItems
  const getPainPointsItems = () => {
    const painPointsTrait = getTraitByTitle("Pain Points");
    if (!painPointsTrait?.description)
      return ["No pain points information available."];
    return extractArray(painPointsTrait.description);
  };
  // Update getKeyResponsibilitiesItems
  const getKeyResponsibilitiesItems = () => {
    const responsibilitiesTrait = getTraitByTitle("Key Responsibilities");
    if (!responsibilitiesTrait?.description)
      return ["No key responsibilities information available."];
    return extractArray(responsibilitiesTrait.description);
  };

  // Get similar personas (all except the current one)
  const getSimilarPersonas = (): SimilarPersona[] => {
    if (!allPersonas.length) return [];
    return allPersonas
      .filter((persona) => persona.id !== id)
      .map((persona) => ({
        id: persona.id,
        name: persona.name,
        role: persona.role || persona.personaRole || "",
        avatar: persona.avatarUrl || persona.avatar || "",
      }));
  };

  // Handle similar persona selection
  const handleSimilarPersonaSelect = (personaId: string) => {
    navigate(`/view-persona/${personaId}`);
  };

  // Add mock data for Use Cases tab
  const mockSampleQuestions = [
    {
      img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
      text: "How should I explain our fallback transaction mechanism in pitches?",
    },
    {
      img: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
      text: "What's the best way to position our QR settlement timelines?",
    },
    {
      img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80",
      text: "Can you help validate how we compare to Razorpay on uptime and disputes?",
    },
    {
      img: "",
      text: "How do I counter merchant objections about T+1 settlements?",
    },
  ];
  const mockExampleInteractions = [
    {
      name: "Sarah Chen",
      avatar: "https://randomuser.me/api/portraits/women/47.jpg",
      text: "A client asked if we offer instant settlement. How flexible are we on that?",
    },
    {
      name: "Sarah Chen",
      avatar: "https://randomuser.me/api/portraits/women/47.jpg",
      text: "What's our standard SLA for resolving failed transactions during peak hours?",
    },
  ];

  // Add mock data for Latest Updates tab
  const mockUpdates = [
    {
      icon: (
        <InsertDriveFileOutlinedIcon sx={{ fontSize: 28, color: "#222" }} />
      ),
      title: "Integrated April 2025 Meta Ads update",
      date: "April 20, 2025",
    },
    {
      icon: <ComputerOutlinedIcon sx={{ fontSize: 28, color: "#222" }} />,
      title: "Completed training on new product features",
      date: "April 15, 2025",
    },
    {
      icon: <StorageOutlinedIcon sx={{ fontSize: 28, color: "#222" }} />,
      title: "Updated knowledge base with Q1 2025 data",
      date: "April 10, 2025",
    },
    {
      icon: <EditOutlinedIcon sx={{ fontSize: 28, color: "#222" }} />,
      title: "Refreshed persona's tone and style guidelines",
      date: "April 5, 2025",
    },
    {
      icon: <PublicOutlinedIcon sx={{ fontSize: 28, color: "#222" }} />,
      title: "Added support for new languages",
      date: "March 28, 2025",
    },
  ];

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#fff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
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
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!personaData?.traits || personaData.traits.length === 0) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#fff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography>No traits found for this persona.</Typography>
      </Box>
    );
  }

  // Use either the prop persona or the fetched persona data
  const persona = propPersona || personaData;

  // Get similar personas (all except the current one)
  // (You may want to fetch this from backend in the future)

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fff" }}>
      <Header />
      <Box
        sx={{
          display: "flex",
          pt: 4,
          pb: 6,
          pr: 8,
          maxWidth: 1350,
          margin: "0 auto",
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        {/* Similar Personas Sidebar - Hidden on mobile */}
        <Box sx={{ display: { xs: "none", md: "block" }, pl: 3 }}>
          <ViewPersonaSidebar
            personas={getSimilarPersonas()}
            onSelect={handleSimilarPersonaSelect}
            currentPersonaId={id}
          />
        </Box>
        <Box
          sx={{
            flex: 1,
            pl: { xs: 2, md: 2 },
            maxWidth: { xs: "100%", md: "calc(100% - 240px)" },
            overflowX: "hidden",
          }}
        >
          <ViewPersonaHeader
            avatar={persona?.avatar || ""}
            name={persona?.name || ""}
            role={persona?.role || ""}
            onStartChat={() => navigate(`/chat/${persona?.id}`)}
          />
          {/* Sync tile for traits update */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Button
                variant="contained"
                onClick={async () => {
                  try {
                    setUpdating(true);
                    setUpdateError("");
                    setUpdateStatus("Triggering traits update...");
                    const token = await getAuthToken();
                    await forwardPersonaTraitsViaBackend(
                      {
                        personaName: persona?.name || "",
                        metadata: {
                          about: (
                            getAboutContent() || "About not available"
                          ).trim(),
                          coreExpertise: getCoreExpertiseItems(),
                          communicationStyle: (
                            getCommunicationStyleContent() || "Not specified"
                          ).trim(),
                          traits: getTraitsItems(),
                          painPoints: getPainPointsItems(),
                          keyResponsibilities: getKeyResponsibilitiesItems(),
                        },
                      },
                      token
                    );
                    setUpdateStatus("Traits update triggered successfully!");
                    if (id) fetchPersonaData();
                  } catch (e: any) {
                    setUpdateError(e?.message || "Failed to update traits");
                    setUpdateStatus("");
                  } finally {
                    setUpdating(false);
                  }
                }}
                disabled={updating}
                sx={{
                  background:
                    "linear-gradient(90deg, #2950DA 0%, #1E88E5 100%)",
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                {updating ? "Updating..." : "Update persona traits"}
              </Button>
              {updateStatus && (
                <Typography sx={{ color: "#2950DA", fontSize: 12, mt: 1 }}>
                  {updateStatus}
                </Typography>
              )}
              {updateError && (
                <Typography sx={{ color: "#c62828", fontSize: 12, mt: 1 }}>
                  {updateError}
                </Typography>
              )}
            </Box>
          </Box>

          <ViewPersonaTabs value={tab} onChange={setTab} />
          {tab === 0 && (
            <>
              {/* Stats Boxes */}
              <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
                <Box
                  sx={{
                    border: "1.5px solid #e0e0e0",
                    borderRadius: 2,
                    p: 3,
                    minWidth: 200,
                    flex: "1 1 200px",
                    bgcolor: "#fff",
                  }}
                >
                  <Typography
                    sx={{ color: "#666", fontSize: 14, fontWeight: 500, mb: 1 }}
                  >
                    Avg. User Rating
                  </Typography>
                  <Typography
                    sx={{ fontSize: 24, fontWeight: 700, color: "#222" }}
                  >
                    4.8/5
                  </Typography>
                </Box>
                <Box
                  sx={{
                    border: "1.5px solid #e0e0e0",
                    borderRadius: 2,
                    p: 3,
                    minWidth: 200,
                    flex: "1 1 200px",
                    bgcolor: "#fff",
                  }}
                >
                  <Typography
                    sx={{ color: "#666", fontSize: 14, fontWeight: 500, mb: 1 }}
                  >
                    Total Conversations
                  </Typography>
                  <Typography
                    sx={{ fontSize: 24, fontWeight: 700, color: "#222" }}
                  >
                    23.4K
                  </Typography>
                </Box>
                <Box
                  sx={{
                    border: "1.5px solid #e0e0e0",
                    borderRadius: 2,
                    p: 3,
                    minWidth: 200,
                    flex: "1 1 200px",
                    bgcolor: "#fff",
                  }}
                >
                  <Typography
                    sx={{ color: "#666", fontSize: 14, fontWeight: 500, mb: 1 }}
                  >
                    Success Rate
                  </Typography>
                  <Typography
                    sx={{ fontSize: 24, fontWeight: 700, color: "#222" }}
                  >
                    92%
                  </Typography>
                </Box>
              </Box>
              <ViewPersonaSection title="About">
                {getAboutContent()
                  .split("\n")
                  .map((p: string, i: number) => (
                    <Box
                      key={i}
                      sx={{
                        mb: 1,
                        overflowWrap: "break-word",
                        textAlign: "justify",
                      }}
                    >
                      <span>{p}</span>
                    </Box>
                  ))}
              </ViewPersonaSection>
              <ViewPersonaSection title="Core Expertise">
                <ViewPersonaChips chips={getCoreExpertiseItems()} />
              </ViewPersonaSection>
              <ViewPersonaSection title="Communication Style">
                <Box sx={{ overflowWrap: "break-word", textAlign: "justify" }}>
                  <span>{getCommunicationStyleContent()}</span>
                </Box>
              </ViewPersonaSection>
            </>
          )}
          {tab === 1 && (
            <>
              <ViewPersonaSection title="Traits">
                <ViewPersonaChips chips={getTraitsItems()} />
              </ViewPersonaSection>
              <ViewPersonaSection title="Pain Points">
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  {getPainPointsItems().map((point) => (
                    <Box
                      key={point}
                      sx={{
                        border: "1.5px solid #e0e0e0",
                        borderRadius: 2,
                        p: 2.2,
                        minWidth: 250,
                        maxWidth: 280,
                        fontWeight: 500,
                        fontSize: 16,
                        color: "#222",
                        bgcolor: "#fff",
                        flex: "1 1 260px",
                        overflowWrap: "break-word",
                      }}
                    >
                      {point}
                    </Box>
                  ))}
                </Box>
              </ViewPersonaSection>
              <ViewPersonaSection title="Key Responsibilities">
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  {getKeyResponsibilitiesItems().map((resp) => (
                    <Box
                      key={resp}
                      sx={{
                        border: "1.5px solid #e0e0e0",
                        borderRadius: 2,
                        p: 2.2,
                        minWidth: 250,
                        maxWidth: 280,
                        fontWeight: 500,
                        fontSize: 16,
                        color: "#222",
                        bgcolor: "#fff",
                        flex: "1 1 260px",
                        overflowWrap: "break-word",
                      }}
                    >
                      {resp}
                    </Box>
                  ))}
                </Box>
              </ViewPersonaSection>
            </>
          )}
          {tab === 2 && (
            <>
              <ViewPersonaSection title="Sample Questions" sx={{ mb: 4 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 4,
                    overflowX: "auto",
                    justifyContent: "flex-start",
                    pb: 1,
                  }}
                >
                  {mockSampleQuestions.map((q, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        bgcolor: "#fff",
                        borderRadius: 3,
                        p: 0,
                        minWidth: 200,
                        maxWidth: 200,
                        width: 150,
                        boxShadow: "0 1px 4px rgba(44,62,80,0.04)",
                      }}
                    >
                      <Box
                        sx={{
                          width: 200,
                          height: 200,
                          bgcolor: q.img ? "transparent" : "#E8ECF2",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mt: 2,
                          mb: 2,
                          overflow: "hidden",
                        }}
                      >
                        {q.img ? (
                          <Box
                            component="img"
                            src={q.img}
                            alt="question"
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 2,
                              bgcolor: "#cfe7db",
                            }}
                          />
                        )}
                      </Box>
                      <Typography
                        sx={{
                          fontSize: 14,
                          color: "#111",
                          fontWeight: 500,
                          textAlign: "center",
                          px: 1,
                          pb: 2,
                        }}
                      >
                        {q.text}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </ViewPersonaSection>
              <ViewPersonaSection title="Example Interactions">
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {mockExampleInteractions.map((ex, idx) => (
                    <Box
                      key={idx}
                      sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}
                    >
                      <Box
                        component="img"
                        src={ex.avatar}
                        alt={ex.name}
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: "50%",
                          objectFit: "cover",
                          mt: 0.5,
                        }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            fontSize: 15,
                            color: "#2950DA",
                            mb: 0.5,
                          }}
                        >
                          {ex.name}
                        </Typography>
                        <Box
                          sx={{
                            bgcolor: "#e8f5e9",
                            borderRadius: 2,
                            px: 2,
                            py: 1,
                            display: "inline-block",
                            fontSize: 16,
                            color: "#222",
                            fontWeight: 500,
                          }}
                        >
                          {ex.text}
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </ViewPersonaSection>
            </>
          )}
          {tab === 3 && (
            <ViewPersonaSection title="Latest Updates">
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {mockUpdates.map((update, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      bgcolor: "#f8fafb",
                      borderRadius: 2,
                      p: 2,
                      boxShadow: "0 1px 4px rgba(44,62,80,0.04)",
                    }}
                  >
                    <Box>{update.icon}</Box>
                    <Box sx={{ flex: 1 }}>
                      <Box
                        sx={{ fontWeight: 600, fontSize: 16, color: "#222" }}
                      >
                        {update.title}
                      </Box>
                      <Box sx={{ fontSize: 14, color: "#888", mt: 0.5 }}>
                        {update.date}
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </ViewPersonaSection>
          )}
          {/* Remove tabs 2 and 3 or update to use real data if needed */}
        </Box>
      </Box>
    </Box>
  );
};

export default ViewPersonaPage;
