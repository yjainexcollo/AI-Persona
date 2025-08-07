const request = require("supertest");
const express = require("express");
const workspaceController = require("../../../src/controllers/workspaceController");

// Mock the workspace service
jest.mock("../../../src/services/workspaceService", () => ({
  getWorkspace: jest.fn(),
  updateWorkspace: jest.fn(),
  listMembers: jest.fn(),
}));

// Mock auth middleware
const mockAuthMiddleware = (req, res, next) => {
  req.user = {
    id: "user123",
    email: "test@example.com",
    workspaceId: "workspace123",
    role: "ADMIN",
  };
  next();
};

const workspaceService = require("../../../src/services/workspaceService");

// Create test app
const app = express();
app.use(express.json());
app.use(mockAuthMiddleware);

// Add workspace routes for testing
app.get("/workspaces/:id", workspaceController.getWorkspace);
app.put("/workspaces/:id", workspaceController.updateWorkspace);
app.get("/workspaces/:id/members", workspaceController.listMembers);

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message,
  });
});

describe("WorkspaceController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /workspaces/:id", () => {
    it("should return workspace details", async () => {
      const mockWorkspace = {
        id: "workspace123",
        name: "Test Workspace",
        domain: "test.com",
        timezone: "UTC",
        locale: "en",
        isActive: true,
        maxMembers: 1000,
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      workspaceService.getWorkspace.mockResolvedValue(mockWorkspace);

      const response = await request(app)
        .get("/workspaces/workspace123")
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.workspace.name).toBe("Test Workspace");
      expect(response.body.data.workspace.domain).toBe("test.com");
      expect(workspaceService.getWorkspace).toHaveBeenCalledWith(
        "workspace123",
        "user123"
      );
    });

    it("should handle workspace not found", async () => {
      workspaceService.getWorkspace.mockRejectedValue(
        new Error("Workspace not found")
      );

      const response = await request(app)
        .get("/workspaces/invalid")
        .expect(500);

      expect(response.body.error).toBeDefined();
      expect(response.body.error).toContain("Workspace not found");
    });

    it("should handle access denied", async () => {
      workspaceService.getWorkspace.mockRejectedValue(
        new Error("Access denied to this workspace")
      );

      const response = await request(app)
        .get("/workspaces/other-workspace")
        .expect(500);

      expect(response.body.error).toBeDefined();
      expect(response.body.error).toContain("Access denied to this workspace");
    });
  });

  describe("PUT /workspaces/:id", () => {
    it("should update workspace settings", async () => {
      const mockUpdatedWorkspace = {
        id: "workspace123",
        name: "Updated Workspace",
        domain: "test.com",
        timezone: "America/New_York",
        locale: "es",
        isActive: true,
        maxMembers: 1000,
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      workspaceService.updateWorkspace.mockResolvedValue(mockUpdatedWorkspace);

      const updateData = {
        name: "Updated Workspace",
        timezone: "America/New_York",
        locale: "es",
      };

      const response = await request(app)
        .put("/workspaces/workspace123")
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.workspace.name).toBe("Updated Workspace");
      expect(response.body.data.workspace.timezone).toBe("America/New_York");
      expect(response.body.data.workspace.locale).toBe("es");
      expect(workspaceService.updateWorkspace).toHaveBeenCalledWith(
        "workspace123",
        "user123",
        updateData
      );
    });

    it("should handle partial updates", async () => {
      const mockUpdatedWorkspace = {
        id: "workspace123",
        name: "Partially Updated",
        domain: "test.com",
        timezone: "UTC",
        locale: "en",
        isActive: true,
        maxMembers: 1000,
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      workspaceService.updateWorkspace.mockResolvedValue(mockUpdatedWorkspace);

      const updateData = {
        name: "Partially Updated",
      };

      const response = await request(app)
        .put("/workspaces/workspace123")
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.workspace.name).toBe("Partially Updated");
      expect(workspaceService.updateWorkspace).toHaveBeenCalledWith(
        "workspace123",
        "user123",
        updateData
      );
    });

    it("should handle insufficient permissions", async () => {
      workspaceService.updateWorkspace.mockRejectedValue(
        new Error("Only workspace admins can update workspace settings")
      );

      const updateData = {
        name: "Unauthorized Update",
      };

      const response = await request(app)
        .put("/workspaces/workspace123")
        .send(updateData)
        .expect(500);

      expect(response.body.error).toBeDefined();
      expect(response.body.error).toContain(
        "Only workspace admins can update workspace settings"
      );
    });
  });

  describe("GET /workspaces/:id/members", () => {
    it("should list workspace members", async () => {
      const mockMembers = [
        {
          id: "user1",
          name: "John Doe",
          email: "john@example.com",
          role: "MEMBER",
          status: "ACTIVE",
          joinedAt: new Date(),
        },
        {
          id: "user2",
          name: "Jane Smith",
          email: "jane@example.com",
          role: "ADMIN",
          status: "ACTIVE",
          joinedAt: new Date(),
        },
      ];

      workspaceService.listMembers.mockResolvedValue({
        members: mockMembers,
        total: 2,
      });

      const response = await request(app)
        .get("/workspaces/workspace123/members")
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.total).toBe(2);
      expect(workspaceService.listMembers).toHaveBeenCalledWith(
        "workspace123",
        "user123",
        {
          search: undefined,
          status: undefined,
          role: undefined,
          page: 1,
          limit: 20,
        }
      );
    });

    it("should support pagination", async () => {
      const mockMembers = {
        members: [],
        pagination: {
          page: 2,
          limit: 5,
          total: 15,
          pages: 3,
        },
      };

      workspaceService.listMembers.mockResolvedValue(mockMembers);

      const response = await request(app)
        .get("/workspaces/workspace123/members?page=2&limit=5")
        .expect(200);

      expect(response.body.pagination.page).toBe(2);
      expect(response.body.pagination.limit).toBe(5);
      expect(workspaceService.listMembers).toHaveBeenCalledWith(
        "workspace123",
        "user123",
        { page: 2, limit: 5 }
      );
    });

    it("should support search", async () => {
      const mockMembers = [
        {
          id: "user1",
          name: "John Doe",
          email: "john@example.com",
          role: "MEMBER",
          status: "ACTIVE",
          joinedAt: new Date(),
        },
      ];

      workspaceService.listMembers.mockResolvedValue({
        members: mockMembers,
        total: 1,
      });

      const response = await request(app)
        .get("/workspaces/workspace123/members")
        .query({ search: "John" })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe("John Doe");
      expect(workspaceService.listMembers).toHaveBeenCalledWith(
        "workspace123",
        "user123",
        {
          search: "John",
          status: undefined,
          role: undefined,
          page: 1,
          limit: 20,
        }
      );
    });

    it("should handle access denied", async () => {
      workspaceService.listMembers.mockRejectedValue(
        new Error("Access denied to this workspace")
      );

      const response = await request(app)
        .get("/workspaces/other-workspace/members")
        .expect(500);

      expect(response.body.error).toBeDefined();
      expect(response.body.error).toContain("Access denied to this workspace");
    });
  });
});
