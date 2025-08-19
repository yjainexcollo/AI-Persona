// Search input component for filtering personas
import React from "react";
import {
  TextField,
  InputAdornment,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { CiSearch } from "react-icons/ci";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  fullWidth?: boolean;
  maxWidth?: number | string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search personas",
  fullWidth = false,
  maxWidth,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
      sx={{
        mb: { xs: 2, sm: 3 },
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <TextField
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        variant="outlined"
        size={isMobile ? "medium" : "small"}
        sx={{
          maxWidth:
            maxWidth !== undefined
              ? maxWidth
              : isMobile
              ? "100%"
              : isTablet
              ? 350
              : 500,
          width: fullWidth ? "100%" : undefined,
          minWidth: { xs: 180, sm: 250, md: 350 },
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#E8ECF2",
            borderRadius: 2,
            height: { xs: 48, sm: 40 },
            "& fieldset": {
              border: "none",
            },
            "&:hover fieldset": {
              border: "none",
            },
            "&.Mui-focused fieldset": {
              border: "1px solid #2950DA",
            },
          },
          "& .MuiOutlinedInput-input": {
            fontSize: { xs: "16px", sm: "14px" },
            padding: { xs: "12px 16px", sm: "8px 12px" },
          },
          "& .MuiOutlinedInput-input::placeholder": {
            color: "#2950DA",
            opacity: 1,
            fontSize: { xs: "16px", sm: "14px" },
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <CiSearch size={isMobile ? 24 : 20} color="#2950DA" />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};

export default SearchBar;
