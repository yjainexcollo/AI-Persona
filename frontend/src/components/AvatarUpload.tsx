import React, { useState, useRef } from "react";
import {
  Box,
  Avatar,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { fetchWithAuth } from "../utils/session";
import { getAvatarUrl } from "../services/avatarService";

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  size?: number;
  onAvatarUpdate?: (newAvatarUrl: string) => void;
  showControls?: boolean;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatarUrl,
  size = 140,
  onAvatarUpdate,
  showControls = true,
}) => {
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
      return;
    }

    // Validate file size (2MB limit)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("File size too large. Maximum size is 2MB");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleAvatarUpload = async () => {
    if (!selectedFile) return;

    setAvatarUploading(true);
    try {
      const backendUrl =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
      const formData = new FormData();
      formData.append("avatar", selectedFile);

      const res = await fetchWithAuth(`${backendUrl}/api/users/me/avatar`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to upload avatar");
      }

      const data = await res.json();

      // Clear preview and selected file
      setPreviewUrl(null);
      setSelectedFile(null);

      // Call callback if provided
      if (onAvatarUpdate) {
        onAvatarUpdate(data.data.avatarUrl);
      }

      alert("Avatar uploaded successfully!");
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Failed to upload avatar. Please try again."
      );
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Box sx={{ position: "relative", width: size, height: size, mb: 2 }}>
        <Avatar
          src={previewUrl || getAvatarUrl(currentAvatarUrl)}
          sx={{
            width: size,
            height: size,
            bgcolor: "#e6e6e6",
            fontSize: size * 0.6,
          }}
        >
          <svg
            width={size * 0.6}
            height={size * 0.6}
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="12" cy="8" r="4" stroke="#222" strokeWidth="2" />
            <path d="M4 20c0-4 4-7 8-7s8 3 8 7" stroke="#222" strokeWidth="2" />
          </svg>
        </Avatar>
        <Box
          onClick={handleAvatarClick}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            bgcolor: "rgba(0,0,0,0.15)",
            borderRadius: "50%",
            transition: "background 0.2s",
            "&:hover": { bgcolor: "rgba(0,0,0,0.25)" },
          }}
        >
          <PhotoCameraIcon sx={{ color: "#fff", fontSize: size * 0.23 }} />
        </Box>
      </Box>

      {/* Avatar upload preview and controls */}
      {showControls && selectedFile && (
        <Box
          sx={{
            mb: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Typography sx={{ color: "#666", fontSize: 14 }}>
            Selected: {selectedFile.name}
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              disabled={avatarUploading}
              onClick={handleAvatarUpload}
              sx={{
                bgcolor: "#2950DA",
                color: "#fff",
                "&:hover": { bgcolor: "#526794" },
                "&:disabled": { bgcolor: "#ccc" },
              }}
            >
              {avatarUploading ? (
                <>
                  <CircularProgress size={16} sx={{ color: "#fff", mr: 1 }} />
                  Uploading...
                </>
              ) : (
                "Upload Avatar"
              )}
            </Button>
            <Button
              variant="outlined"
              size="small"
              disabled={avatarUploading}
              onClick={handleCancel}
              sx={{
                borderColor: "#666",
                color: "#666",
                "&:hover": { borderColor: "#333", color: "#333" },
              }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      )}

      {/* Hidden file input for avatar upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/jpeg,image/png,image/gif,image/webp"
        style={{ display: "none" }}
      />
    </Box>
  );
};

export default AvatarUpload;
