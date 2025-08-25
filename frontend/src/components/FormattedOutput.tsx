// Component to format and display AI responses with markdown-like syntax
import React from "react";
import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";

interface FormattedOutputProps {
  content: string;
}

const FormattedOutput: React.FC<FormattedOutputProps> = ({ content }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Split content into lines and process each line
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      // Empty line - add small spacing
      elements.push(<Box key={index} sx={{ height: isMobile ? 6 : 8 }} />);
      return;
    }

    // Check for numbered list items (1., 2., 3., etc.)
    const numberedMatch = trimmedLine.match(/^(\d+)\.\s*(.+)$/);
    if (numberedMatch) {
      const [, number, text] = numberedMatch;
      elements.push(
        <Box
          key={index}
          sx={{
            display: "flex",
            alignItems: "flex-start",
            mb: isMobile ? 0.5 : 1,
          }}
        >
          <Typography
            component="span"
            sx={{
              fontWeight: 600,
              minWidth: isMobile ? "20px" : "24px",
              mr: isMobile ? 0.5 : 1,
              color: "inherit",
              fontSize: isMobile ? "14px" : "16px",
            }}
          >
            {number}.
          </Typography>
          <Typography
            component="span"
            sx={{
              flex: 1,
              lineHeight: 1.5,
              color: "inherit",
              fontSize: isMobile ? "14px" : "16px",
            }}
          >
            {text}
          </Typography>
        </Box>
      );
      return;
    }

    // Check for bullet points (-, *, •)
    const bulletMatch = trimmedLine.match(/^[-*•]\s*(.+)$/);
    if (bulletMatch) {
      const [, text] = bulletMatch;
      elements.push(
        <Box
          key={index}
          sx={{
            display: "flex",
            alignItems: "flex-start",
            mb: isMobile ? 0.5 : 1,
          }}
        >
          <Typography
            component="span"
            sx={{
              fontWeight: 600,
              minWidth: isMobile ? "14px" : "16px",
              mr: isMobile ? 0.5 : 1,
              color: "inherit",
              fontSize: isMobile ? "14px" : "16px",
            }}
          >
            •
          </Typography>
          <Typography
            component="span"
            sx={{
              flex: 1,
              lineHeight: 1.5,
              color: "inherit",
              fontSize: isMobile ? "14px" : "16px",
            }}
          >
            {text}
          </Typography>
        </Box>
      );
      return;
    }

    // Check for headers (#, ##, ###)
    const headerMatch = trimmedLine.match(/^(#{1,3})\s*(.+)$/);
    if (headerMatch) {
      const [, hashes, text] = headerMatch;
      const level = hashes?.length || 1;
      const fontSize =
        level === 1
          ? isMobile
            ? 18
            : 20
          : level === 2
          ? isMobile
            ? 16
            : 18
          : isMobile
          ? 14
          : 16;
      const fontWeight = level === 1 ? 700 : level === 2 ? 600 : 500;

      elements.push(
        <Typography
          key={index}
          sx={{
            fontSize,
            fontWeight,
            mb: isMobile ? 0.5 : 1,
            mt: index > 0 ? (isMobile ? 1.5 : 2) : 0,
            color: "inherit",
          }}
        >
          {text}
        </Typography>
      );
      return;
    }

    // Regular text
    elements.push(
      <Typography
        key={index}
        sx={{
          mb: isMobile ? 0.25 : 0.5,
          lineHeight: 1.5,
          color: "inherit",
          fontSize: isMobile ? "14px" : "16px",
        }}
      >
        {trimmedLine}
      </Typography>
    );
  });

  return <Box>{elements}</Box>;
};

export default FormattedOutput;
