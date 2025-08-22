// Chat input component with file upload and suggestions
import React, { useRef, useState } from "react";
import {
  Box,
  IconButton,
  Paper,
  InputBase,
  Chip,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { IoSend } from "react-icons/io5";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import type { Persona } from "../types";
import { useDropzone } from "react-dropzone";
import { requestFileUpload } from "../services/personaService";

// Add global declaration for window.gapi, window.google, window.onSendFromDrive
declare global {
  interface Window {
    gapi: unknown;
    google: unknown;
    onSendFromDrive?: (fileObj: unknown) => void;
  }
}

interface ChatInputBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSend?: (msgObj: {
    message: string;
    fileUrl?: string;
    fileType?: string;
    fileId?: string;
  }) => void;
  onFileUpload?: (file: File) => void;
  placeholder?: string;
  suggestions?: string[];
  showSuggestions?: boolean;
  disabled?: boolean;
  persona?: Persona;
  conversationId?: string;
  sidebarOpen?: boolean;
  sidebarWidth?: number;
  maxWidth?: number | string;
}

const ChatInputBar: React.FC<ChatInputBarProps> = ({
  value = "",
  onChange,
  onSend,
  placeholder = "Send a message",
  suggestions = [],
  showSuggestions = false,
  disabled = false,
  persona,
  conversationId,
  sidebarOpen = false,
  sidebarWidth = 160,
  maxWidth = 960,
}) => {
  // Remove internal messageInput state; use value prop directly
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviewUrls, setFilePreviewUrls] = useState<(string | null)[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Handle input change
  const handleInputChange = (newValue: string) => {
    onChange?.(newValue);
  };

  // Send message with optional file upload
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = value.trim();
    if ((!trimmed && selectedFiles.length === 0) || disabled) return;

    const fileIds: string[] = [];
    const fileUrls: string[] = [];
    const fileTypes: string[] = [];

    // Upload files if any are selected
    if (selectedFiles.length > 0) {
      if (!conversationId) {
        alert("Cannot upload files without an active conversation");
        return;
      }

      try {
        // Upload each file using the backend API
        for (const file of selectedFiles) {
          // Validate file size (10MB limit to match backend)
          if (file.size > 10 * 1024 * 1024) {
            alert(`File ${file.name} is too large. Maximum size is 10MB.`);
            return;
          }

          // Validate file type (match backend allowed types)
          const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "application/pdf",
          ];
          if (!allowedTypes.includes(file.type)) {
            alert(
              `File ${file.name} has an unsupported type. Allowed: images and PDFs.`
            );
            return;
          }

          // Request upload URL from backend
          const uploadResponse = await requestFileUpload(conversationId, {
            filename: file.name,
            mimeType: file.type,
            sizeBytes: file.size,
          });

          // Upload file to presigned URL
          const uploadRes = await fetch(uploadResponse.data.presignedUrl, {
            method: "PUT",
            body: file,
            headers: {
              "Content-Type": file.type,
            },
          });

          if (!uploadRes.ok) {
            throw new Error(`Failed to upload ${file.name}`);
          }

          fileIds.push(uploadResponse.data.fileId);
          fileUrls.push(uploadResponse.data.presignedUrl);
          fileTypes.push(file.type);
        }
      } catch (error) {
        console.error("File upload error:", error);
        alert(
          `File upload failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
        return;
      }
    }

    // Send message with file data
    if (onSend) {
      if (fileIds.length <= 1) {
        onSend({
          message: trimmed,
          fileUrl: fileUrls[0],
          fileType: fileTypes[0],
          fileId: fileIds[0],
        });
      } else {
        // For multiple files, we'll need to handle this differently
        // For now, just send the first file
        onSend({
          message: trimmed,
          fileUrl: fileUrls[0],
          fileType: fileTypes[0],
          fileId: fileIds[0],
        });
      }
    }

    // Clear file selection
    setSelectedFiles([]);
    setFilePreviewUrls([]);
    if (onChange) onChange("");
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) return;
    const newFiles: File[] = Array.from(files);

    // Limit to 5 files
    if (selectedFiles.length + newFiles.length > 5) {
      alert("You can upload up to 5 files per message.");
      return;
    }

    // Validate file size (max 10MB each to match backend)
    for (const file of newFiles) {
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} exceeds 10MB limit.`);
        return;
      }
    }

    // Validate file types (match backend allowed types)
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
    ];
    for (const file of newFiles) {
      if (!allowedTypes.includes(file.type)) {
        alert(
          `File ${file.name} has an unsupported type. Allowed: images and PDFs.`
        );
        return;
      }
    }

    const allFiles = [...selectedFiles, ...newFiles];
    setSelectedFiles(allFiles);
    setFilePreviewUrls(
      allFiles.map((f) =>
        f.type.startsWith("image/") ? URL.createObjectURL(f) : null
      )
    );
  };

  // Remove selected file
  const handleRemoveFile = (idx: number) => {
    const newFiles = [...selectedFiles];
    const newPreviews = [...filePreviewUrls];
    newFiles.splice(idx, 1);
    newPreviews.splice(idx, 1);
    setSelectedFiles(newFiles);
    setFilePreviewUrls(newPreviews);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    if (onChange) onChange(suggestion);
    // Do NOT auto-send the message
  };

  // Get suggestion chips for persona
  const getSuggestionChips = (department: string, personaId?: string) => {
    // Special handling for Head of Payment persona
    if (personaId === "1") {
      return [
        "Analyze payment gateway performance",
        "Review transaction failure rates",
        "Optimize checkout conversion rates",
        "Check payment processing costs",
        "Evaluate fraud detection metrics",
      ];
    }

    // Special handling for Product Manager persona
    if (personaId === "2") {
      return [
        "Review product roadmap priorities",
        "Analyze feature adoption metrics",
        "Get user feedback insights",
        "Check sprint progress status",
        "Evaluate market competitive analysis",
      ];
    }

    switch (department) {
      case "Tech":
        return [
          "Ask about QR transaction flows",
          "Get merchant risk metrics",
          "Clarify settlement SLA",
        ];
      case "Marketing":
        return [
          "Request latest campaign stats",
          "Ask for competitor analysis",
          "Get social media insights",
        ];
      case "Sales":
        return [
          "Ask for sales pipeline update",
          "Request lead conversion rates",
          "Get monthly sales summary",
        ];
      default:
        return ["Ask a question", "Request a report", "Get latest updates"];
    }
  };

  const suggestionChips = React.useMemo(() => {
    if (suggestions.length > 0) {
      return suggestions;
    }
    if (persona) {
      return getSuggestionChips(persona.department || "", persona.id || "");
    }
    return [];
  }, [suggestions, persona]);

  // Dropzone logic
  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        const newFiles: File[] = acceptedFiles;

        if (selectedFiles.length + newFiles.length > 5) {
          alert("You can upload up to 5 files per message.");
          return;
        }

        // Validate file size (max 10MB each to match backend)
        for (const file of newFiles) {
          if (file.size > 10 * 1024 * 1024) {
            alert(`File ${file.name} exceeds 10MB limit.`);
            return;
          }
        }

        // Validate file types (match backend allowed types)
        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
          "application/pdf",
        ];
        for (const file of newFiles) {
          if (!allowedTypes.includes(file.type)) {
            alert(
              `File ${file.name} has an unsupported type. Allowed: images and PDFs.`
            );
            return;
          }
        }

        const allFiles = [...selectedFiles, ...newFiles];
        setSelectedFiles(allFiles);
        setFilePreviewUrls(
          allFiles.map((f) =>
            f.type.startsWith("image/") ? URL.createObjectURL(f) : null
          )
        );
      }
    },
    [selectedFiles]
  );
  // For useDropzone, cast options as any to avoid DropzoneOptions error
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    noClick: true,
  } as any);

  // Google Picker constants (replace with your real values)
  const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";
  const GOOGLE_API_KEY = "YOUR_GOOGLE_API_KEY";

  // Google Picker logic
  let oauthToken: string | null = null;
  let pickerApiLoaded = false;

  function onAuthApiLoad() {
    (window.gapi as any).auth.authorize(
      {
        client_id: GOOGLE_CLIENT_ID,
        scope: ["https://www.googleapis.com/auth/drive.readonly"],
        immediate: false,
      },
      handleAuthResult
    );
  }

  function onPickerApiLoad() {
    pickerApiLoaded = true;
  }

  function handleAuthResult(authResult: unknown) {
    if (
      authResult &&
      typeof authResult === "object" &&
      !(authResult as any).error
    ) {
      oauthToken = (authResult as any).access_token;
      createPicker();
    }
  }

  function createPicker() {
    if (pickerApiLoaded && oauthToken) {
      const picker = new (window.google as any).picker.PickerBuilder()
        .addView((window.google as any).picker.ViewId.DOCS)
        .setOAuthToken(oauthToken)
        .setDeveloperKey(GOOGLE_API_KEY)
        .setCallback(pickerCallback)
        .build();
      picker.setVisible(true);
    }
  }

  function pickerCallback(data: unknown) {
    if (
      data &&
      typeof data === "object" &&
      (data as any).action === (window.google as any).picker.Action.PICKED
    ) {
      const file = (data as any).docs[0];
      // For images, use file.url; for others, use file.url or file.embedUrl
      if (file && file.url) {
        // Call onSend with the file URL (as an image or file link)
        if (file.url.match(/\.(jpg|jpeg|png|gif)$/i)) {
          // Image
          if (typeof window.onSendFromDrive === "function") {
            window.onSendFromDrive({
              fileUrl: file.url,
              fileType: file.mimeType,
            });
          }
        } else {
          // Other file types: send as a link
          if (typeof window.onSendFromDrive === "function") {
            window.onSendFromDrive({ message: file.name + ": " + file.url });
          }
        }
      }
    }
  }

  const openGooglePicker = () => {
    if (!(window.gapi as any)) {
      alert("Google API not loaded.");
      return;
    }
    (window.gapi as any).load("auth", { callback: onAuthApiLoad });
    (window.gapi as any).load("picker", { callback: onPickerApiLoad });
  };

  // Attach a global handler for Google Picker callback
  (window as any).onSendFromDrive = (fileObj: any) => {
    if (onSend) onSend(fileObj);
  };

  const handleClipClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLocalUpload = () => {
    handleMenuClose();
    fileInputRef.current?.click();
  };

  const handleGoogleDrive = () => {
    handleMenuClose();
    openGooglePicker();
  };

  return (
    <Box
      sx={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pt: 0,
        pb: { xs: 2, sm: 4 },
        background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, #fff 20%)",
      }}
      {...getRootProps({})}
    >
      <input {...getInputProps({})} />
      {isDragActive && (
        <Box
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            top: 0,
            zIndex: 100,
            bgcolor: "rgba(41,80,218,0.1)",
            border: "3px dashed #2950DA",
            borderRadius: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#2950DA",
            fontSize: 22,
            fontWeight: 600,
            backdropFilter: "blur(4px)",
          }}
        >
          <AttachFileIcon sx={{ fontSize: 48, mb: 2, opacity: 0.8 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            Drop files here to attach
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Supports images, documents, and other file types
          </Typography>
        </Box>
      )}
      {/* Suggestion Chips */}
      {showSuggestions && suggestionChips.length > 0 && (
        <Box
          sx={{
            display: "flex",
            gap: { xs: 1, sm: 2 },
            maxWidth: sidebarOpen
              ? { xs: "100%", sm: `calc(${maxWidth}px - ${sidebarWidth}px)` }
              : { xs: "100%", sm: maxWidth },
            width: "100%",
            px: { xs: 2, sm: 3 },
            mb: 0,
            mt: 0,
            flexWrap: "wrap",
            justifyContent: "flex-start",
          }}
        >
          {suggestionChips.map((label, idx) => (
            <Chip
              key={idx}
              label={label}
              onClick={() => handleSuggestionClick(label)}
              sx={{
                bgcolor: "#E8ECF2",
                fontWeight: 500,
                fontSize: { xs: 13, sm: 15 },
                height: { xs: 32, sm: 36 },
                mb: { xs: 1, sm: 0 },
                cursor: "pointer",
                "&:hover": {
                  bgcolor: "#E8ECF2",
                },
              }}
            />
          ))}
        </Box>
      )}

      {/* Chat Input */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          maxWidth: sidebarOpen
            ? { xs: "100%", sm: `calc(${maxWidth}px - ${sidebarWidth}px)` }
            : { xs: "100%", sm: maxWidth },
          width: "100%",
          px: { xs: 2, sm: 3 },
          mt: { xs: 2, sm: 3 },
        }}
      >
        {/* File input (hidden) */}
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: "none" }}
          onChange={handleFileChange}
          multiple
        />
        {/* File previews */}
        {selectedFiles.length > 0 && (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              mb: 2,
              p: 1.5,
              bgcolor: "#F8F9FA",
              borderRadius: 2,
              border: "1px solid #E8ECF2",
            }}
          >
            {selectedFiles.map((file, idx) =>
              file.type.startsWith("image/") ? (
                <Box
                  key={idx}
                  sx={{
                    position: "relative",
                    borderRadius: 2,
                    overflow: "hidden",
                    border: "2px solid #E8ECF2",
                  }}
                >
                  <img
                    src={filePreviewUrls[idx] || ""}
                    alt={file.name}
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveFile(idx)}
                    sx={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      bgcolor: "rgba(255,255,255,0.9)",
                      color: "#dc3545",
                      width: 24,
                      height: 24,
                      "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                    }}
                  >
                    ×
                  </IconButton>
                </Box>
              ) : (
                <Chip
                  key={idx}
                  label={file.name}
                  onDelete={() => handleRemoveFile(idx)}
                  sx={{
                    bgcolor: "#E8ECF2",
                    fontWeight: 500,
                    "& .MuiChip-deleteIcon": {
                      color: "#dc3545",
                      "&:hover": { color: "#c82333" },
                    },
                  }}
                />
              )
            )}
          </Box>
        )}

        {/* Single integrated chat input bar */}
        <Paper
          component="form"
          onSubmit={handleSendMessage}
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            width: "100%",
            borderRadius: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            bgcolor: "#E8ECF2",
            p: { xs: 1.5, sm: 2 },
            border: "1px solid #d0d7de",
            minHeight: { xs: 60, sm: 70 },
          }}
          elevation={0}
        >
          {/* File upload button (always visible) */}
          <IconButton
            onClick={handleClipClick}
            disabled={disabled}
            title="Attach file"
            sx={{
              color: "#2950DA",
              "&:hover": {
                bgcolor: "#F5F7FA",
                transform: "scale(1.05)",
              },
              transition: "all 0.2s ease",
            }}
          >
            <AttachFileIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 200,
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                borderRadius: 2,
                border: "1px solid #e5e7eb",
              },
            }}
          >
            <MenuItem
              onClick={handleLocalUpload}
              sx={{
                py: 1.5,
                px: 2,
                gap: 1.5,
                "&:hover": { bgcolor: "#F5F7FA" },
              }}
            >
              <AttachFileIcon sx={{ fontSize: 20, color: "#2950DA" }} />
              <Box>
                <Typography sx={{ fontWeight: 500, fontSize: 14 }}>
                  Upload from device
                </Typography>
                <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
                  Select files from your computer
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem
              onClick={handleGoogleDrive}
              sx={{
                py: 1.5,
                px: 2,
                gap: 1.5,
                "&:hover": { bgcolor: "#F5F7FA" },
              }}
            >
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#4285F4">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 500, fontSize: 14 }}>
                  Pick from Google Drive
                </Typography>
                <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
                  Select files from your Drive
                </Typography>
              </Box>
            </MenuItem>
          </Menu>

          {/* Main input field */}
          <InputBase
            sx={{
              flex: 1,
              fontSize: { xs: 14, sm: 16 },
              mr: 2,
              "& input": {
                fontSize: { xs: 14, sm: 16 },
                py: 0.5,
                caretColor: "#2950DA",
                "&::placeholder": {
                  color: "#9ca3af",
                  opacity: 1,
                },
              },
              "& textarea": {
                fontSize: { xs: 14, sm: 16 },
                resize: "none",
                lineHeight: 1.4,
                py: 0.5,
                caretColor: "#2950DA",
                "&::placeholder": {
                  color: "#9ca3af",
                  opacity: 1,
                },
              },
            }}
            placeholder={placeholder}
            inputProps={{ "aria-label": placeholder }}
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            autoFocus={!disabled}
            multiline
            maxRows={4}
            minRows={1}
            disabled={disabled}
          />

          {/* Send button */}
          <IconButton
            sx={{
              backgroundColor:
                value.trim() && !disabled ? "#2950DA" : "#d1d5db",
              color: value.trim() && !disabled ? "white" : "#6b7280",
              width: { xs: 36, sm: 40 },
              height: { xs: 36, sm: 40 },
              borderRadius: "50%",
              transition: "all 0.2s ease",
              flexShrink: 0,
              "&:hover": {
                backgroundColor:
                  value.trim() && !disabled ? "#526794" : "#d1d5db",
                transform: value.trim() && !disabled ? "scale(1.05)" : "none",
              },
            }}
            disabled={!value.trim() || disabled}
            type="submit"
          >
            <IoSend size={16} />
          </IconButton>
        </Paper>
      </Box>
    </Box>
  );
};

export default ChatInputBar;
