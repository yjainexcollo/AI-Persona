const request = require("supertest");
const express = require("express");
const profileController = require("../../../src/controllers/profileController");

// Mock the profile service
jest.mock("../../../src/services/profileService", () => ({
  getMe: jest.fn(),
  updateMe: jest.fn(),
  uploadAvatar: jest.fn(),
  changePassword: jest.fn(),
}));

// Mock auth middleware
const mockAuthMiddleware = (req, res, next) => {
  req.user = {
    id: "user123",
    email: "test@example.com",
    workspaceId: "workspace123",
  };
  next();
};

const profileService = require("../../../src/services/profileService");

// Create test app
const app = express();
app.use(express.json());
app.use(mockAuthMiddleware);

// Add profile routes for testing
app.get("/profile", profileController.getMe);
app.put("/profile", profileController.updateMe);
app.post("/profile/avatar", profileController.uploadAvatar);
app.put("/profile/password", profileController.changePassword);

describe("ProfileController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /profile", () => {
    it("should return user profile", async () => {
      const mockProfile = {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
        avatarUrl: "https://example.com/avatar.jpg",
        timezone: "UTC",
        locale: "en",
        role: "MEMBER",
        status: "ACTIVE",
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      profileService.getMe.mockResolvedValue(mockProfile);

      const response = await request(app).get("/profile").expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.profile.email).toBe("test@example.com");
      expect(response.body.data.profile.name).toBe("Test User");
      expect(response.body.data.profile.avatarUrl).toBe(
        "https://example.com/avatar.jpg"
      );
      expect(profileService.getMe).toHaveBeenCalledWith("user123");
    });

    it("should handle profile not found", async () => {
      profileService.getMe.mockRejectedValue(new Error("User not found"));

      const response = await request(app).get("/profile").expect(500);

      expect(response.body.error.message).toBe("User not found");
    });
  });

  describe("PUT /profile", () => {
    it("should update user profile", async () => {
      const mockUpdatedProfile = {
        id: "user123",
        email: "test@example.com",
        name: "Updated User",
        avatarUrl: "https://example.com/new-avatar.jpg",
        timezone: "America/New_York",
        locale: "es",
        role: "MEMBER",
        status: "ACTIVE",
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      profileService.updateMe.mockResolvedValue(mockUpdatedProfile);

      const updateData = {
        name: "Updated User",
        avatarUrl: "https://example.com/new-avatar.jpg",
        timezone: "America/New_York",
        locale: "es",
      };

      const response = await request(app)
        .put("/profile")
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.profile.name).toBe("Updated User");
      expect(response.body.data.profile.timezone).toBe("America/New_York");
      expect(response.body.data.profile.locale).toBe("es");
      expect(profileService.updateMe).toHaveBeenCalledWith(
        "user123",
        updateData
      );
    });

    it("should handle partial updates", async () => {
      const mockUpdatedProfile = {
        id: "user123",
        email: "test@example.com",
        name: "Partially Updated",
        avatarUrl: null,
        timezone: "UTC",
        locale: "en",
        role: "MEMBER",
        status: "ACTIVE",
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      profileService.updateMe.mockResolvedValue(mockUpdatedProfile);

      const updateData = {
        name: "Partially Updated",
      };

      const response = await request(app)
        .put("/profile")
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.profile.name).toBe("Partially Updated");
      expect(profileService.updateMe).toHaveBeenCalledWith(
        "user123",
        updateData
      );
    });

    it("should handle email validation errors", async () => {
      profileService.updateMe.mockRejectedValue(
        new Error("Invalid email format")
      );

      const updateData = {
        email: "invalid-email",
      };

      const response = await request(app)
        .put("/profile")
        .send(updateData)
        .expect(500);

      expect(response.body.error.message).toBe("Invalid email format");
    });

    it("should handle duplicate email errors", async () => {
      profileService.updateMe.mockRejectedValue(
        new Error("Email already exists")
      );

      const updateData = {
        email: "existing@example.com",
      };

      const response = await request(app)
        .put("/profile")
        .send(updateData)
        .expect(500);

      expect(response.body.error.message).toBe("Email already exists");
    });
  });

  describe("POST /profile/avatar", () => {
    it("should upload avatar successfully", async () => {
      const mockUpdatedProfile = {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
        avatarUrl: "https://example.com/new-avatar.jpg",
        timezone: "UTC",
        locale: "en",
        role: "MEMBER",
        status: "ACTIVE",
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      profileService.uploadAvatar.mockResolvedValue(mockUpdatedProfile);

      const response = await request(app)
        .post("/profile/avatar")
        .send({
          avatarUrl: "https://example.com/new-avatar.jpg",
        })
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.profile.avatarUrl).toBe(
        "https://example.com/new-avatar.jpg"
      );
      expect(profileService.uploadAvatar).toHaveBeenCalledWith(
        "user123",
        "https://example.com/new-avatar.jpg"
      );
    });

    it("should handle missing avatar URL", async () => {
      const response = await request(app)
        .post("/profile/avatar")
        .send({})
        .expect(400);

      expect(response.body.error.message).toBe("Avatar URL is required");
    });

    it("should handle upload errors", async () => {
      profileService.uploadAvatar.mockRejectedValue(
        new Error("Invalid avatar URL")
      );

      const response = await request(app)
        .post("/profile/avatar")
        .send({
          avatarUrl: "invalid-url",
        })
        .expect(500);

      expect(response.body.error.message).toBe("Invalid avatar URL");
    });
  });

  describe("PUT /profile/password", () => {
    it("should change password successfully", async () => {
      profileService.changePassword.mockResolvedValue({
        message: "Password changed successfully",
      });

      const response = await request(app)
        .put("/profile/password")
        .send({
          currentPassword: "OldPassword123!",
          newPassword: "NewPassword123!",
        })
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.message).toBe("Password changed successfully");
      expect(profileService.changePassword).toHaveBeenCalledWith(
        "user123",
        "OldPassword123!",
        "NewPassword123!"
      );
    });

    it("should handle incorrect current password", async () => {
      profileService.changePassword.mockRejectedValue(
        new Error("Current password is incorrect")
      );

      const response = await request(app)
        .put("/profile/password")
        .send({
          currentPassword: "WrongPassword",
          newPassword: "NewPassword123!",
        })
        .expect(500);

      expect(response.body.error.message).toBe("Current password is incorrect");
    });

    it("should handle weak new password", async () => {
      profileService.changePassword.mockRejectedValue(
        new Error("Password too weak")
      );

      const response = await request(app)
        .put("/profile/password")
        .send({
          currentPassword: "OldPassword123!",
          newPassword: "weak",
        })
        .expect(500);

      expect(response.body.error.message).toBe("Password too weak");
    });
  });
});
