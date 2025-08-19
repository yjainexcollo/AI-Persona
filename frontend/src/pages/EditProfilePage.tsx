import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  TextField,
  InputAdornment,
  Paper,
  Breadcrumbs,
  CircularProgress,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { fetchWithAuth } from "../utils/session";
import { getAvatarUrl } from "../services/avatarService";

const sidebarItems = [
  {
    icon: <HomeOutlinedIcon sx={{ fontSize: 28 }} />,
    label: "Dashboard",
    active: true,
  },
  { icon: <PeopleAltOutlinedIcon sx={{ fontSize: 28 }} />, label: "Users" },
  { icon: <SettingsOutlinedIcon sx={{ fontSize: 28 }} />, label: "Settings" },
];

const EditProfilePage: React.FC = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
  });

  // Profile state
  const [profile, setProfile] = useState<any>(null);

  // Avatar upload states
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Fetch profile data
  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const backendUrl =
          import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
        const res = await fetchWithAuth(`${backendUrl}/api/users/me`);
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data.data.user);
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    };
    fetchProfile();
  }, []);

  // Avatar upload functions
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

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f7f8fa" }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: 120,
          bgcolor: "#fff",
          borderRight: "1px solid #f0f0f0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          py: 3,
          position: "relative",
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 900, color: "#b97a7a", mb: 6 }}
        >
          LOGO
        </Typography>
        <Box sx={{ flex: 1, width: "100%" }}>
          {sidebarItems.map((item) => (
            <Box
              key={item.label}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 4,
                cursor: "pointer",
              }}
            >
              {item.icon}
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: 15,
                  color: item.active ? "#2950DA" : "#444",
                  mt: 1,
                }}
              >
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>
        <Avatar
          src="https://randomuser.me/api/portraits/women/44.jpg"
          sx={{
            width: 48,
            height: 48,
            position: "absolute",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />
      </Box>
      {/* Main Content */}
      <Box sx={{ flex: 1, px: 6, py: 4 }}>
        {/* Breadcrumb and Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Breadcrumbs separator={"›"} aria-label="breadcrumb">
            <Typography sx={{ color: "#888", fontWeight: 600, fontSize: 22 }}>
              Profile
            </Typography>
            <Typography sx={{ color: "#222", fontWeight: 800, fontSize: 26 }}>
              Edit Profile
            </Typography>
          </Breadcrumbs>
          <TextField
            placeholder="Search"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#bdbdbd" }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 3,
                bgcolor: "#fff",
                width: 220,
                fontSize: 16,
              },
            }}
          />
        </Box>
        {/* Profile Card */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            p: 0,
            mb: 4,
            overflow: "hidden",
            bgcolor: "#f2f7f3",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 5,
              position: "relative",
              minHeight: 220,
            }}
          >
            <Box sx={{ position: "relative", width: 140, height: 140, mb: 2 }}>
              <Avatar
                src={previewUrl || getAvatarUrl(profile?.avatarUrl)}
                sx={{
                  width: 140,
                  height: 140,
                  bgcolor: "#e6e6e6",
                  fontSize: 80,
                }}
              >
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="#222" strokeWidth="2" />
                  <path
                    d="M4 20c0-4 4-7 8-7s8 3 8 7"
                    stroke="#222"
                    strokeWidth="2"
                  />
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
                <PhotoCameraIcon sx={{ color: "#fff", fontSize: 32 }} />
              </Box>
            </Box>

            {/* Avatar upload preview and controls */}
            {selectedFile && (
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
                        <CircularProgress
                          size={16}
                          sx={{ color: "#fff", mr: 1 }}
                        />
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
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
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
          </Box>
        </Paper>
        {/* Form Card */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            p: 4,
            maxWidth: 900,
            mx: "auto",
            position: "relative",
          }}
        >
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mb: 2 }}
          >
            <Button
              variant="contained"
              sx={{
                bgcolor: "#bdbdbd",
                color: "#fff",
                fontWeight: 700,
                borderRadius: 2,
                px: 4,
                py: 1,
                fontSize: 16,
                textTransform: "none",
                boxShadow: "none",
                "&:hover": { bgcolor: "#a0a0a0" },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              sx={{
                bgcolor: "#2950DA",
                color: "#fff",
                fontWeight: 700,
                borderRadius: 2,
                px: 4,
                py: 1,
                fontSize: 16,
                textTransform: "none",
                boxShadow: "none",
                "&:hover": { bgcolor: "#526794" },
              }}
            >
              Save Changes
            </Button>
          </Box>
          <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            <Box sx={{ flex: 1, minWidth: 220 }}>
              <Typography
                sx={{ fontWeight: 700, fontSize: 18, color: "#888", mb: 2 }}
              >
                Personal Information
              </Typography>
            </Box>
            <Box
              sx={{
                flex: 3,
                minWidth: 320,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <TextField
                label="Full name"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                fullWidth
                sx={{ bgcolor: "#fafbfc", borderRadius: 2 }}
              />
              <TextField
                label="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
                fullWidth
                sx={{ bgcolor: "#fafbfc", borderRadius: 2 }}
              />
              <TextField
                label="Phone No."
                name="phone"
                value={form.phone}
                onChange={handleChange}
                fullWidth
                sx={{ bgcolor: "#fafbfc", borderRadius: 2 }}
              />
              <TextField
                label="Address"
                name="address"
                value={form.address}
                onChange={handleChange}
                fullWidth
                multiline
                minRows={2}
                sx={{ bgcolor: "#fafbfc", borderRadius: 2 }}
              />
            </Box>
          </Box>
        </Paper>
      </Box>

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

export default EditProfilePage;
