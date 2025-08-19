// Component to format and display AI responses with markdown-like syntax
import React from "react";
import { Box, Typography } from "@mui/material";

interface FormattedOutputProps {
  content: string;
}

const FormattedOutput: React.FC<FormattedOutputProps> = ({ content }) => {
  // Split content into lines and process each line
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    if (!trimmedLine) {
      // Empty line - add small spacing
      elements.push(<Box key={index} sx={{ height: 8 }} />);
      return;
    }
    
    // Check for numbered list items (1., 2., 3., etc.)
    const numberedMatch = trimmedLine.match(/^(\d+)\.\s*(.+)$/);
    if (numberedMatch) {
      const [, number, text] = numberedMatch;
      elements.push(
        <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
          <Typography 
            component="span" 
            sx={{ 
              fontWeight: 600, 
              minWidth: '24px', 
              mr: 1,
              color: 'inherit'
            }}
          >
            {number}.
          </Typography>
          <Typography 
            component="span" 
            sx={{ 
              flex: 1, 
              lineHeight: 1.5,
              color: 'inherit'
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
        <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
          <Typography 
            component="span" 
            sx={{ 
              fontWeight: 600, 
              minWidth: '16px', 
              mr: 1,
              color: 'inherit'
            }}
          >
            •
          </Typography>
          <Typography 
            component="span" 
            sx={{ 
              flex: 1, 
              lineHeight: 1.5,
              color: 'inherit'
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
      const level = hashes.length;
      const fontSize = level === 1 ? 20 : level === 2 ? 18 : 16;
      const fontWeight = level === 1 ? 700 : level === 2 ? 600 : 500;
      
      elements.push(
        <Typography 
          key={index}
          sx={{ 
            fontSize, 
            fontWeight, 
            mb: 1, 
            mt: index > 0 ? 2 : 0,
            color: 'inherit'
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
          mb: 0.5, 
          lineHeight: 1.5,
          color: 'inherit'
        }}
      >
        {trimmedLine}
      </Typography>
    );
  });
  
  return <Box>{elements}</Box>;
};

export default FormattedOutput;
