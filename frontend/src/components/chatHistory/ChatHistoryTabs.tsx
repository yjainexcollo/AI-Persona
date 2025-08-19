import React from "react";
import { Box, Typography } from "@mui/material";

interface ChatHistoryTabsProps {
  tab: "all" | "archived";
  onTabChange: (tab: "all" | "archived") => void;
}

const ChatHistoryTabs: React.FC<ChatHistoryTabsProps> = ({
  tab,
  onTabChange,
}) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 3,
      mb: 2,
      mt: 1,
      ml: 1.5,
    }}
  >
    <Typography
      sx={{
        fontWeight: 600,
        fontSize: 17,
        color: tab === "all" ? "#2950DA" : "#526794",
        borderBottom:
          tab === "all" ? "2.5px solid #2950DA" : "2.5px solid transparent",
        pb: 0.5,
        cursor: "pointer",
        mr: 2,
      }}
      onClick={() => onTabChange("all")}
    >
      All
    </Typography>
    <Typography
      sx={{
        fontWeight: 600,
        fontSize: 17,
        color: tab === "archived" ? "#2950DA" : "#526794",
        borderBottom:
          tab === "archived"
            ? "2.5px solid #2950DA"
            : "2.5px solid transparent",
        pb: 0.5,
        cursor: "pointer",
      }}
      onClick={() => onTabChange("archived")}
    >
      Archived
    </Typography>
  </Box>
);

export default ChatHistoryTabs;
