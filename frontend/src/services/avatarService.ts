import { env } from "../lib/config/env";

export interface AvatarUploadResponse {
  status: string;
  message: string;
  data: {
    avatarUrl: string;
  };
}

export const uploadAvatar = async (file: File): Promise<{ url: string }> => {
  const backendUrl = env.BACKEND_URL;
  const formData = new FormData();
  formData.append("avatar", file);
  const res = await fetch(`${backendUrl}/api/users/avatar`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  if (!res.ok) {
    throw new Error("Failed to upload avatar");
  }
  return await res.json();
};

// Helper function to get full avatar URL
export const getAvatarUrl = (avatarUrl?: string): string | undefined => {
  if (!avatarUrl) return undefined;

  // If it's already a full URL, return as is
  if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) {
    return avatarUrl;
  }

  // If it's a relative path, construct full URL
  const backendUrl = env.BACKEND_URL;
  return `${backendUrl}${avatarUrl}`;
};

export const validateAvatarFile = (
  file: File
): { isValid: boolean; error?: string } => {
  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Please select a valid image file (JPEG, PNG, GIF, or WebP)",
    };
  }

  // Validate file size (2MB limit)
  const maxSize = 2 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "File size too large. Maximum size is 2MB",
    };
  }

  return { isValid: true };
};
