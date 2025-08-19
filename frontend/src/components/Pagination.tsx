// Pagination component for navigating through large datasets
import React from "react";
import {
  Box,
  IconButton,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Generate page number buttons with ellipsis for large page counts
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = isMobile ? 5 : 7;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(
        <Button
          key={1}
          onClick={() => onPageChange(1)}
          variant="text"
          sx={{
            minWidth: { xs: 36, sm: 40 },
            height: { xs: 36, sm: 40 },
            borderRadius: 1,
            mx: { xs: 0.25, sm: 0.5 },
            backgroundColor: "transparent",
            color: "#666",
            fontWeight: 500,
            fontSize: { xs: 14, sm: 16 },
            "&:hover": {
              backgroundColor: "#f5f5f5",
            },
          }}
        >
          1
        </Button>
      );

      if (startPage > 2) {
        pages.push(
          <Box
            key="ellipsis1"
            sx={{
              mx: { xs: 0.25, sm: 0.5 },
              color: "#666",
              fontSize: { xs: 14, sm: 16 },
              display: "flex",
              alignItems: "center",
            }}
          >
            ...
          </Box>
        );
      }
    }

    // Add visible page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          onClick={() => onPageChange(i)}
          variant={currentPage === i ? "contained" : "text"}
          sx={{
            minWidth: { xs: 36, sm: 40 },
            height: { xs: 36, sm: 40 },
            borderRadius: 1,
            mx: { xs: 0.25, sm: 0.5 },
            backgroundColor: currentPage === i ? "#2950DA" : "transparent",
            color: currentPage === i ? "white" : "#666",
            fontWeight: 500,
            fontSize: { xs: 14, sm: 16 },
            "&:hover": {
              backgroundColor: currentPage === i ? "#526794" : "#f5f5f5",
            },
          }}
        >
          {i}
        </Button>
      );
    }

    // Add last page and ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <Box
            key="ellipsis2"
            sx={{
              mx: { xs: 0.25, sm: 0.5 },
              color: "#666",
              fontSize: { xs: 14, sm: 16 },
              display: "flex",
              alignItems: "center",
            }}
          >
            ...
          </Box>
        );
      }

      pages.push(
        <Button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          variant="text"
          sx={{
            minWidth: { xs: 36, sm: 40 },
            height: { xs: 36, sm: 40 },
            borderRadius: 1,
            mx: { xs: 0.25, sm: 0.5 },
            backgroundColor: "transparent",
            color: "#666",
            fontWeight: 500,
            fontSize: { xs: 14, sm: 16 },
            "&:hover": {
              backgroundColor: "#f5f5f5",
            },
          }}
        >
          {totalPages}
        </Button>
      );
    }

    return pages;
  };

  return (
    <Box sx={{ mt: { xs: 4, sm: 6 }, mb: { xs: 3, sm: 4 } }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          mx: { xs: 2, sm: 4 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            maxWidth: { xs: "100%", sm: 900 },
            width: "100%",
            flexWrap: "wrap",
          }}
        >
          <IconButton
            onClick={handlePrevious}
            disabled={currentPage === 1}
            sx={{
              mr: { xs: 0.5, sm: 1 },
              color: currentPage === 1 ? "#ccc" : "#666",
              width: { xs: 36, sm: 40 },
              height: { xs: 36, sm: 40 },
              "&:hover": {
                backgroundColor: currentPage === 1 ? "transparent" : "#f5f5f5",
              },
            }}
          >
            <ChevronLeftIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
          </IconButton>

          {renderPageNumbers()}

          <IconButton
            onClick={handleNext}
            disabled={currentPage === totalPages}
            sx={{
              ml: { xs: 0.5, sm: 1 },
              color: currentPage === totalPages ? "#ccc" : "#666",
              width: { xs: 36, sm: 40 },
              height: { xs: 36, sm: 40 },
              "&:hover": {
                backgroundColor:
                  currentPage === totalPages ? "transparent" : "#f5f5f5",
              },
            }}
          >
            <ChevronRightIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default Pagination;
