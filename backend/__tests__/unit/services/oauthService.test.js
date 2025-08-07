const oauthService = require("../../../src/services/oauthService");

// Mock email service
jest.mock("../../../src/services/emailService", () => ({
  sendWelcomeEmail: jest.fn().mockResolvedValue({ success: true }),
}));

describe("OAuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock implementations
    global.mockFindUnique.mockReset();
    global.mockCreate.mockReset();
    global.mockUpdate.mockReset();
    global.mockCount.mockReset();
  });

  describe("handleOAuthLogin", () => {
    it("should create new user for OAuth login", async () => {
      const provider = "google";
      const oauthProfile = {
        id: "google123",
        emails: [{ value: "test@example.com" }],
        displayName: "Test User",
      };

      const mockWorkspace = {
        id: "workspace123",
        name: "example.com",
        domain: "example.com",
      };

      const mockUser = {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
        emailVerified: true,
        status: "ACTIVE",
        role: "ADMIN",
        workspaceId: "workspace123",
      };

      global.mockFindUnique
        .mockResolvedValueOnce(null) // No existing workspace
        .mockResolvedValueOnce(null); // No existing user
      global.mockCreate
        .mockResolvedValueOnce(mockWorkspace) // Workspace creation
        .mockResolvedValueOnce(mockUser); // User creation
      global.mockCount.mockResolvedValue(0); // First user in workspace

      const result = await oauthService.handleOAuthLogin(
        provider,
        oauthProfile
      );

      expect(result).toBeDefined();
      expect(result.status).toBe("success");
      expect(result.data.user).toBeDefined();
      expect(result.data.user.email).toBe("test@example.com");
      expect(result.data.isNewUser).toBe(true);
    });

    it("should return existing user for OAuth login", async () => {
      const provider = "google";
      const oauthProfile = {
        id: "google123",
        emails: [{ value: "test@example.com" }],
        displayName: "Test User",
      };

      const mockUser = {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
        emailVerified: true,
        status: "ACTIVE",
        role: "MEMBER",
        workspaceId: "workspace123",
        workspace: {
          id: "workspace123",
          name: "Test Workspace",
        },
      };

      global.mockFindUnique.mockResolvedValue(mockUser);
      global.mockCreate.mockResolvedValue({
        id: "session123",
        userId: "user123",
        refreshToken: "mock-refresh-token",
        expiresAt: new Date(),
      });

      const result = await oauthService.handleOAuthLogin(
        provider,
        oauthProfile
      );

      expect(result).toBeDefined();
      expect(result.status).toBe("success");
      expect(result.data.user).toBeDefined();
      expect(result.data.user.email).toBe("test@example.com");
      expect(result.data.isNewUser).toBe(false);
    });

    it("should update existing user with new OAuth info", async () => {
      const provider = "google";
      const oauthProfile = {
        id: "google123",
        emails: [{ value: "test@example.com" }],
        displayName: "Updated User",
      };

      const existingUser = {
        id: "user123",
        email: "test@example.com",
        name: "Old Name",
        emailVerified: true,
        status: "ACTIVE",
        role: "MEMBER",
        workspaceId: "workspace123",
        workspace: {
          id: "workspace123",
          name: "Test Workspace",
        },
      };

      const updatedUser = {
        ...existingUser,
        name: "Updated User",
      };

      global.mockFindUnique.mockResolvedValue(existingUser);
      global.mockUpdate.mockResolvedValue(updatedUser);
      global.mockCreate.mockResolvedValue({
        id: "session123",
        userId: "user123",
        refreshToken: "mock-refresh-token",
        expiresAt: new Date(),
      });

      const result = await oauthService.handleOAuthLogin(
        provider,
        oauthProfile
      );

      expect(result).toBeDefined();
      expect(result.status).toBe("success");
      expect(result.data.user).toBeDefined();
      expect(result.data.user.name).toBe("Updated User");
    });

    it("should handle user without email", async () => {
      const provider = "google";
      const oauthProfile = {
        id: "google123",
        emails: [],
        displayName: "Test User",
      };

      await expect(
        oauthService.handleOAuthLogin(provider, oauthProfile)
      ).rejects.toThrow("Email is required for OAuth login");
    });

    it("should handle user without display name", async () => {
      const provider = "google";
      const oauthProfile = {
        id: "google123",
        emails: [{ value: "test@example.com" }],
        displayName: null,
      };

      const mockWorkspace = {
        id: "workspace123",
        name: "example.com",
        domain: "example.com",
      };

      const mockUser = {
        id: "user123",
        email: "test@example.com",
        name: "User", // Default name from email
        emailVerified: true,
        status: "ACTIVE",
        role: "ADMIN",
        workspaceId: "workspace123",
      };

      global.mockFindUnique
        .mockResolvedValueOnce(null) // No existing workspace
        .mockResolvedValueOnce(null); // No existing user
      global.mockCreate
        .mockResolvedValueOnce(mockWorkspace) // Workspace creation
        .mockResolvedValueOnce(mockUser); // User creation
      global.mockCount.mockResolvedValue(0);

      const result = await oauthService.handleOAuthLogin(
        provider,
        oauthProfile
      );

      expect(result).toBeDefined();
      expect(result.data.user.name).toBe("User");
    });
  });
});
