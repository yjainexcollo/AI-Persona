import React from "react";
import { Box, Typography } from "@mui/material";

interface ViewPersonaSectionProps {
  title: string;
  children: React.ReactNode;
  sx?: object;
}

const ViewPersonaSection: React.FC<ViewPersonaSectionProps> = ({ title, children, sx }) => (
  <Box sx={{ mb: 3, overflowX: 'hidden', wordBreak: 'break-word', ...sx }}>
    <Typography sx={{ fontWeight: 800, fontSize: 20, color: '#222', mb: 1 }}>{title}</Typography>
    <Box sx={{ maxWidth: '100%', overflowWrap: 'break-word' }}>
      {children}
    </Box>
  </Box>
);

export default ViewPersonaSection; 