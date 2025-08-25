import React from "react";
import { Box } from "@mui/material";

interface BrandLogoProps {
  href?: string;
  imgSrc?: string;
  alt?: string;
}

const BrandLogo: React.FC<BrandLogoProps> = ({
  href = "/",
  imgSrc = "/logo.png",
  alt = "crudo.ai logo",
}) => {
  return (
    <Box
      component="a"
      href={href}
      aria-label="Go to home"
      sx={{
        position: "fixed",
        top: { xs: 12, sm: 16 },
        left: { xs: 12, sm: 16 },
        display: "flex",
        alignItems: "center",
        gap: 1,
        textDecoration: "none",
        zIndex: (theme) => theme.zIndex.appBar + 1,
      }}
    >
      <Box
        component="img"
        src={imgSrc}
        alt={alt}
        loading="lazy"
        sx={{ height: { xs: 10, sm: 20 }, width: "auto", cursor: "pointer" }}
      />
    </Box>
  );
};

export default BrandLogo;
