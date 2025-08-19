import React from "react";
import {
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import type { FilterOption } from "../../types";

interface FilterChipsProps {
  filters: FilterOption[];
  onFilterChange: (filterId: string) => void;
  showSelectedIndicator?: boolean;
  showClearAll?: boolean;
  title?: string;
}

const menuOptions = ["All", "Tech", "Marketing", "Sales"];

const FilterChips: React.FC<FilterChipsProps> = ({
  filters,
  onFilterChange,
  showSelectedIndicator = false,
  showClearAll = true,
  title = "Department Filters",
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Get selected filters
  const selectedFilters = filters.filter((f) => f.active);
  const hasActiveFilters = selectedFilters.length > 0;
  const isAllSelected = selectedFilters.length === 0;

  // Clear all filters (select "All")
  const handleClearAll = () => {
    filters.forEach((filter) => {
      if (filter.active) {
        onFilterChange(filter.value);
      }
    });
  };

  // Handle "All" selection
  const handleAllSelection = () => {
    if (hasActiveFilters) {
      handleClearAll();
    }
  };

  // Handle individual filter selection
  const handleFilterSelection = (filterId: string) => {
    onFilterChange(filterId);
  };

  // Get department color
  const getDepartmentColor = (department: string) => {
    switch (department) {
      case "Tech":
      case "Technology":
        return "#2950DA";
      case "Marketing":
        return "#2950DA";
      case "Sales":
        return "#2950DA";
      case "All":
        return "#2950DA";
      default:
        return "#2950DA";
    }
  };

  // Check if a menu option is selected
  const isOptionSelected = (option: string) => {
    if (option === "All") {
      return isAllSelected;
    }
    return filters.find((f) => f.value === option)?.active || false;
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Filter Chips Row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: { xs: 1, sm: 2 },
          flexWrap: "wrap",
          mb: showSelectedIndicator && hasActiveFilters ? 2 : 0,
        }}
      >
        {/* Filter Chips */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, sm: 1 },
            flexWrap: "wrap",
            flex: 1,
          }}
        >
          {/* Show "All" chip when no filters are active */}
          {isAllSelected && (
            <Chip
              label="All Departments"
              variant="filled"
              sx={{
                backgroundColor: "#E8ECF2",
                color: "#222",
                fontWeight: 600,
                borderRadius: 2,
                fontSize: { xs: "13px", sm: "14px" },
                height: { xs: 32, sm: 36 },
                "& .MuiChip-label": {
                  px: { xs: 1, sm: 1.5 },
                },
                "& .MuiChip-deleteIcon": {
                  color: "#222",
                  "&:hover": {
                    color: "#526794",
                  },
                },
                boxShadow: `0 0 0 2px #E8ECF220`,
              }}
            />
          )}

          {/* Show active filter chips */}
          {filters.map(
            (filter) =>
              filter.active && (
                <Chip
                  key={filter.value}
                  label={filter.label}
                  onClick={() => onFilterChange(filter.value)}
                  onDelete={() => onFilterChange(filter.value)}
                  variant="filled"
                  sx={{
                    backgroundColor: "#E8ECF2",
                    color: "#2950DA",
                    fontWeight: 600,
                    borderRadius: 2,
                    fontSize: { xs: "13px", sm: "14px" },
                    height: { xs: 32, sm: 36 },
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      backgroundColor: "#E8ECF2",
                      transform: "translateY(-1px)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    },
                    "& .MuiChip-label": {
                      px: { xs: 1, sm: 1.5 },
                    },
                    "& .MuiChip-deleteIcon": {
                      color: "#2950DA",
                      "&:hover": {
                        color: "#526794",
                      },
                    },
                    boxShadow: `0 0 0 2px #E8ECF220`,
                  }}
                />
              )
          )}
        </Box>

        {/* Filter Menu Icon */}
        <IconButton
          sx={{
            color: hasActiveFilters
              ? getDepartmentColor(selectedFilters[0]?.value)
              : "#2950DA",
            backgroundColor: hasActiveFilters ? "#f5f5f5" : "transparent",
            ml: { xs: 0.5, sm: 1 },
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              backgroundColor: "#f0f0f0",
              transform: "rotate(90deg)",
            },
            width: { xs: 40, sm: 36 },
            height: { xs: 40, sm: 36 },
          }}
          onClick={handleMenuClick}
          aria-controls={open ? "filter-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
        >
          <FilterIcon sx={{ fontSize: { xs: 22, sm: 20 } }} />
        </IconButton>

        {/* Clear All Button */}
        {showClearAll && hasActiveFilters && (
          <IconButton
            onClick={handleClearAll}
            sx={{
              color: "#666",
              backgroundColor: "#f5f5f5",
              ml: 0.5,
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                backgroundColor: "#ffebee",
                color: "#d32f2f",
                transform: "scale(1.1)",
              },
              width: { xs: 32, sm: 28 },
              height: { xs: 32, sm: 28 },
            }}
            title="Clear all filters"
          >
            <ClearIcon sx={{ fontSize: { xs: 18, sm: 16 } }} />
          </IconButton>
        )}

        {/* Filter Dropdown Menu with Checkboxes */}
        <Menu
          id="filter-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              minWidth: 200,
              borderRadius: 3,
              boxShadow: "0 4px 24px rgba(44,62,80,0.13)",
              maxHeight: 320,
              overflowY: "auto",
              p: 1,
            },
          }}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          {/* Menu Title */}
          <MenuItem
            sx={{
              fontSize: 14,
              py: 1,
              px: 1.5,
              borderRadius: 2,
              color: "#333",
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "transparent",
              },
              cursor: "default",
            }}
            disabled
          >
            {title}
          </MenuItem>

          {/* Menu Options with Checkboxes */}
          {menuOptions.map((option, idx) => {
            const isSelected = isOptionSelected(option);

            return (
              <MenuItem
                key={idx}
                onClick={(e) => {
                  // Prevent event from bubbling to FormControlLabel
                  e.preventDefault();
                  e.stopPropagation();

                  if (option === "All") {
                    handleAllSelection();
                  } else {
                    // Find matching filter and toggle it
                    const matchingFilter = filters.find(
                      (f) => f.value === option
                    );
                    if (matchingFilter) {
                      handleFilterSelection(matchingFilter.value);
                    }
                  }
                  // Don't close menu to allow multiple selections
                }}
                sx={{
                  fontSize: 14,
                  py: 0.5,
                  px: 1,
                  borderRadius: 2,
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  "&:hover": {
                    backgroundColor: "#f0f0f0",
                  },
                  // Make the entire menu item clickable
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isSelected}
                      size="small"
                      sx={{
                        color: "#2950DA",
                        "&.Mui-checked": {
                          color: "#2950DA",
                        },
                        "&:hover": {
                          backgroundColor: "rgba(41, 80, 218, 0.04)",
                        },
                        "& .MuiSvgIcon-root": {
                          fontSize: 18,
                        },
                        pointerEvents: "none",
                      }}
                      onChange={() => {}}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                      {option === "All"
                        ? "All Departments"
                        : `${option} Department`}
                    </Typography>
                  }
                  sx={{
                    margin: 0,
                    width: "100%",
                    "& .MuiFormControlLabel-label": {
                      flex: 1,
                    },
                    pointerEvents: "none",
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                />
              </MenuItem>
            );
          })}
        </Menu>
      </Box>
    </Box>
  );
};

export default FilterChips;
