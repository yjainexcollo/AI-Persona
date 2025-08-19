import React from "react";
import { Box, Typography } from "@mui/material";

const PersonaSelectorHeader: React.FC = () => (
  <Box sx={{ mt: 6, mb: 4, textAlign: 'center', px: { xs: 2, sm: 0 } }}>
    <Typography variant="h4" sx={{ fontWeight: 800, color: '#222', fontSize: { xs: 28, sm: 36 }, mb: 1 }}>
      Choose a persona to chat
    </Typography>
  </Box>
);

export default PersonaSelectorHeader; 