/**
 * Discovery Page Component
 * 
 * Main page for browsing and discovering personas/characters in the application.
 * Features search, filtering, pagination, and persona grid display.
 * 
 * Features:
 * - Real-time search functionality
 * - Department-based filtering
 * - Pagination for large datasets
 * - Responsive grid layout
 * - Integration with Supabase for data fetching
 * - URL search parameter support
 */

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Box, Typography } from "@mui/material";
import Header from "../components/discover/Header";
import SearchBar from "../components/discover/SearchBar";
import FilterChips from "../components/discover/FilterChips";
import PersonaGrid from "../components/PersonaGrid";
import Pagination from "../components/Pagination";
import { mockFilters } from "../data/mockData";
import type { Persona, FilterOption } from "../types";
import { getPersonas, type Persona as BackendPersona } from "../services/personaService";

/**
 * Props interface for the Discovery component
 */
interface DiscoveryProps {
  /** Callback function when user starts a chat with a persona */
  onStartChat: (persona: Persona) => void;
}

// Responsive search area width configuration
const SEARCH_AREA_WIDTH = { xs: "100%", sm: 900, md: 1100, lg: 1200 };

// Define department order for consistent sorting across the application
const DEPARTMENT_ORDER = ["Tech", "Marketing", "Sales"];

/**
 * Discovery Component
 * 
 * Main page for persona discovery with search, filtering, and pagination.
 * Fetches persona data from Supabase and provides interactive browsing experience.
 */
const Discovery: React.FC<DiscoveryProps> = ({ onStartChat }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Read 'search' query param from URL for deep linking
  const params = new URLSearchParams(location.search);
  const initialSearch = params.get('search') || "";
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  // Initialize filters with all set to inactive (false) so "All" appears selected
  const [filters, setFilters] = useState<FilterOption[]>(
    mockFilters.map((filter) => ({
      ...filter,
      active: false, // Set all filters to inactive by default
    }))
  );

  // State for personas data and pagination
  const [personas, setPersonas] = useState<BackendPersona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  /**
   * Fetch personas data from backend API on component mount
   */
  useEffect(() => {
    async function fetchPersonas() {
      try {
        setLoading(true);
        setError("");
        const response = await getPersonas();
        setPersonas(response.data || []);
      } catch (err) {
        console.error('Error fetching personas from backend:', err);
        setError(err instanceof Error ? err.message : "Failed to load personas");
        setPersonas([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPersonas();
  }, []);

  // Get currently selected departments for filtering
  const selectedDepartments = filters.filter(filter => filter.active);

  /**
   * Enhanced filter and sort logic
   * 
   * Filters personas by search term and selected departments,
   * then sorts them by department order and name.
   */
  const filteredAndSortedPersonas = personas
    .filter((persona) => {
      // Filter by search term (case-insensitive)
      const matchesSearch = searchTerm === "" || 
          persona.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          persona.description.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by department if any are selected (if department field exists)
      const matchesDepartment = selectedDepartments.length === 0 || 
        selectedDepartments.some(filter => filter.value === persona.department);

      return matchesSearch && matchesDepartment;
    })
    .sort((a, b) => {
      // Sort by department order, then by name (if department field exists)
      if (a.department && b.department) {
        const aDeptIndex = DEPARTMENT_ORDER.indexOf(a.department);
        const bDeptIndex = DEPARTMENT_ORDER.indexOf(b.department);

        if (aDeptIndex !== bDeptIndex) {
          return aDeptIndex - bDeptIndex;
        }
      }
      return a.name.localeCompare(b.name);
    });

  // Pagination calculations
  const totalPersonas = filteredAndSortedPersonas.length;
  const totalPages = Math.ceil(totalPersonas / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPersonas = filteredAndSortedPersonas.slice(startIndex, startIndex + itemsPerPage);

  // Debug logging for development (commented out for performance)
  // console.log("Personas state:", personas);
  // console.log("Filtered personas:", filteredAndSortedPersonas);
  // console.log("Paginated personas:", paginatedPersonas);
  // console.log("Total personas:", totalPersonas);

  /**
   * Handle filter selection changes
   * Updates the active state of filters and resets pagination
   */
  const handleFilterChange = (filterId: string) => {
    setFilters((prev) =>
      prev.map((filter) =>
        filter.value === filterId
          ? { ...filter, active: !filter.active }
          : filter
      )
    );
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    // Update the query param in the URL
    const params = new URLSearchParams(location.search);
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    navigate({ search: params.toString() }, { replace: true });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle view persona navigation
  const handleViewPersona = (persona: Persona) => {
    navigate(`/view-persona/${persona.id}`);
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#ffffff",
          overflowX: "hidden",
          position: "relative",
        }}
      >
        <Header />
        <Container
          maxWidth={false}
          sx={{
            py: { xs: 2, sm: 3, md: 4 },
            px: { xs: 1, sm: 3, md: 4 },
            maxWidth: { xs: "100%", sm: "900px", md: "1200px", lg: "1200px" },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <Typography>Loading personas...</Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#ffffff",
          overflowX: "hidden",
          position: "relative",
        }}
      >
        <Header />
        <Container
          maxWidth={false}
          sx={{
            py: { xs: 2, sm: 3, md: 4 },
            px: { xs: 1, sm: 3, md: 4 },
            maxWidth: { xs: "100%", sm: "900px", md: "1200px", lg: "1200px" },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <Typography color="error">{error}</Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      <Header />
      <Container
        maxWidth={false}
        sx={{
          py: { xs: 2, sm: 3, md: 4 },
          px: { xs: 1, sm: 3, md: 4 },
          maxWidth: { xs: "100%", sm: "900px", md: "1200px", lg: "1200px" },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Search Section */}
        <Box
          sx={{
            width: "100%",
            maxWidth: SEARCH_AREA_WIDTH,
            mb: { xs: 2, sm: 3 },
          }}
        >
          <Box
            sx={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              maxWidth="100%"
              fullWidth={true}
            />
          </Box>
        </Box>

        {/* Enhanced Filter Chips */}
        <Box
          sx={{
            width: "100%",
            maxWidth: SEARCH_AREA_WIDTH,
            mb: 3,
          }}
        >
          <FilterChips
            filters={filters}
            onFilterChange={handleFilterChange}
            showSelectedIndicator={true}
            showClearAll={true}
            title="Filter by Department"
          />
        </Box>

        {/* Results Summary with better messaging */}
        <Box
          sx={{
            width: "100%",
            maxWidth: SEARCH_AREA_WIDTH,
            mb: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        ></Box>

        {/* Personas Grid */}
        <Box
          sx={{
            width: "100%",
            maxWidth: SEARCH_AREA_WIDTH,
            display: "flex",
            justifyContent: "flex-start",
          }}
        >
          {totalPersonas > 0 ? (
            <PersonaGrid
              personas={paginatedPersonas}
              onStartChat={onStartChat}
              onViewPersona={handleViewPersona}
            />
          ) : (
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                px: 2,
                width: "100%",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: "#666",
                  mb: 1,
                }}
              >
                No personas found
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#999",
                }}
              >
                Try adjusting your search or filters
              </Typography>
            </Box>
          )}
        </Box>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: { xs: 3, sm: 4 },
              mb: { xs: 2, sm: 3 },
            }}
          >
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Discovery;
