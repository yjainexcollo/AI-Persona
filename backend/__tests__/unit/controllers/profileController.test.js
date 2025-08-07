const request = require("supertest");
const express = require("express");
const profileController = require("../../../src/controllers/profileController");

// Mock the profile service
jest.mock("../../../src/services/profileService", () => ({
  getProfile: jest.fn(),
  updateProfile: jest.fn(),
  processAvatarUpload: jest.fn(),
  processPresignedAvatar: jest.fn(),
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

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    error: err.message,
  });
});

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

      profileService.getProfile.mockResolvedValue(mockProfile);

      const response = await request(app).get("/profile").expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.user.email).toBe("test@example.com");
      expect(response.body.data.user.name).toBe("Test User");
      expect(response.body.data.user.avatarUrl).toBe(
        "https://example.com/avatar.jpg"
      );
      expect(profileService.getProfile).toHaveBeenCalledWith("user123");
    });

    it("should handle profile not found", async () => {
      const error = new Error("User not found");
      error.statusCode = 404;
      profileService.getProfile.mockRejectedValue(error);

      const response = await request(app).get("/profile").expect(404);

      expect(response.body.error).toBe("User not found");
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

      profileService.updateProfile.mockResolvedValue(mockUpdatedProfile);

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
      expect(response.body.data.user.name).toBe("Updated User");
      expect(profileService.updateProfile).toHaveBeenCalledWith(
        "user123",
        updateData
      );
    });

    it("should handle partial updates", async () => {
      const mockUpdatedProfile = {
        id: "user123",
        email: "test@example.com",
        name: "Partially Updated",
        avatarUrl: "https://example.com/avatar.jpg",
        timezone: "UTC",
        locale: "en",
        role: "MEMBER",
        status: "ACTIVE",
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      profileService.updateProfile.mockResolvedValue(mockUpdatedProfile);

      const updateData = {
        name: "Partially Updated",
      };

      const response = await request(app)
        .put("/profile")
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.user.name).toBe("Partially Updated");
      expect(profileService.updateProfile).toHaveBeenCalledWith(
        "user123",
        updateData
      );
    });

    it("should handle email validation errors", async () => {
      const error = new Error("Invalid email format");
      error.statusCode = 400;
      profileService.updateProfile.mockRejectedValue(error);

      const response = await request(app)
        .put("/profile")
        .send({ name: "Test" })
        .expect(400);

      expect(response.body.error).toBe("Invalid email format");
    });

    it("should handle duplicate email errors", async () => {
      const error = new Error("Email already exists");
      error.statusCode = 400;
      profileService.updateProfile.mockRejectedValue(error);

      const response = await request(app)
        .put("/profile")
        .send({ name: "Test" })
        .expect(400);

      expect(response.body.error).toBe("Email already exists");
    });
  });

  describe("POST /profile/avatar", () => {
    it("should upload avatar successfully", async () => {
      profileService.processPresignedAvatar.mockResolvedValue(
        "https://example.com/new-avatar.jpg"
      );

      const response = await request(app)
        .post("/profile/avatar")
        .send({
          presignedUrl: "https://example.com/new-avatar.jpg",
        })
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.avatarUrl).toBe(
        "https://example.com/new-avatar.jpg"
      );
      expect(profileService.processPresignedAvatar).toHaveBeenCalledWith(
        "user123",
        "https://example.com/new-avatar.jpg"
      );
    });

    it("should handle missing avatar URL", async () => {
      const response = await request(app)
        .post("/profile/avatar")
        .send({})
        .expect(400);

      expect(response.body.error).toBe(
        "No avatar file or presigned URL provided"
      );
    });

    it("should handle upload errors", async () => {
      const error = new Error("Invalid avatar URL");
      error.statusCode = 400;
      profileService.processPresignedAvatar.mockRejectedValue(error);

      const response = await request(app)
        .post("/profile/avatar")
        .send({
          presignedUrl: "invalid-url",
        })
        .expect(400);

      expect(response.body.error).toBe("Invalid avatar URL");
    });
  });

  describe("PUT /profile/password", () => {
    it("should change password successfully", async () => {
      profileService.changePassword.mockResolvedValue();

      const response = await request(app)
        .put("/profile/password")
        .send({
          currentPassword: "oldPassword123",
          newPassword: "newPassword123!",
        })
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(profileService.changePassword).toHaveBeenCalledWith(
        "user123",
        "oldPassword123",
        "newPassword123!"
      );
    });

    it("should handle incorrect current password", async () => {
      const error = new Error("Current password is incorrect");
      error.statusCode = 401;
      profileService.changePassword.mockRejectedValue(error);

      const response = await request(app)
        .put("/profile/password")
        .send({
          currentPassword: "wrongPassword",
          newPassword: "newPassword123!",
        })
        .expect(401);

      expect(response.body.error).toBe("Current password is incorrect");
    });

    it("should handle weak new password", async () => {
      const error = new Error("Password too weak");
      error.statusCode = 400;
      profileService.changePassword.mockRejectedValue(error);

      const response = await request(app)
        .put("/profile/password")
        .send({
          currentPassword: "oldPassword123",
          newPassword: "weak",
        })
        .expect(400);

      expect(response.body.error).toBe("Password too weak");
    });
  });
});
