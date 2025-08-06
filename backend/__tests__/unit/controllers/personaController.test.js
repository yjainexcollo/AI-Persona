const request = require("supertest");
const express = require("express");
const personaController = require("../../../src/controllers/personaController");

// Mock the persona service
jest.mock("../../../src/services/personaService", () => ({
  getPersonas: jest.fn(),
  sendMessage: jest.fn(),
  toggleFavourite: jest.fn(),
  getConversations: jest.fn(),
  updateConversationVisibility: jest.fn(),
  toggleArchive: jest.fn(),
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

const personaService = require("../../../src/services/personaService");

// Create test app
const app = express();
app.use(express.json());
app.use(mockAuthMiddleware);

// Add persona routes for testing
app.get("/personas", personaController.getPersonas);
app.post("/personas/:id/messages", personaController.sendMessage);
app.post("/personas/:id/favourite", personaController.toggleFavourite);
app.get("/personas/:id/conversations", personaController.getConversations);
app.put(
  "/conversations/:id/visibility",
  personaController.updateConversationVisibility
);
app.put("/conversations/:id/archive", personaController.toggleArchive);

describe("PersonaController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /personas", () => {
    it("should return all personas", async () => {
      const mockPersonas = [
        {
          id: "persona1",
          name: "Assistant",
          description: "Helpful assistant",
          isActive: true,
          isFavourited: false,
        },
        {
          id: "persona2",
          name: "Writer",
          description: "Creative writer",
          isActive: true,
          isFavourited: true,
        },
      ];

      personaService.getPersonas.mockResolvedValue(mockPersonas);

      const response = await request(app).get("/personas").expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.personas).toHaveLength(2);
      expect(response.body.data.personas[0].name).toBe("Assistant");
      expect(personaService.getPersonas).toHaveBeenCalledWith("user123", {});
    });

    it("should filter favourites when requested", async () => {
      const mockPersonas = [
        {
          id: "persona2",
          name: "Writer",
          description: "Creative writer",
          isActive: true,
          isFavourited: true,
        },
      ];

      personaService.getPersonas.mockResolvedValue(mockPersonas);

      const response = await request(app)
        .get("/personas?favouritesOnly=true")
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.personas).toHaveLength(1);
      expect(response.body.data.personas[0].isFavourited).toBe(true);
      expect(personaService.getPersonas).toHaveBeenCalledWith("user123", {
        favouritesOnly: true,
      });
    });

    it("should handle service errors", async () => {
      personaService.getPersonas.mockRejectedValue(new Error("Service error"));

      const response = await request(app).get("/personas").expect(500);

      expect(response.body.error.message).toBe("Service error");
    });
  });

  describe("POST /personas/:id/messages", () => {
    it("should send message to persona", async () => {
      const mockResult = {
        conversation: {
          id: "conv123",
          title: "Chat with Assistant",
        },
        messages: [
          {
            id: "msg1",
            content: "Hello",
            role: "USER",
            createdAt: new Date(),
          },
          {
            id: "msg2",
            content: "Hi there!",
            role: "ASSISTANT",
            createdAt: new Date(),
          },
        ],
      };

      personaService.sendMessage.mockResolvedValue(mockResult);

      const response = await request(app)
        .post("/personas/persona1/messages")
        .send({
          message: "Hello",
        })
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.conversation.id).toBe("conv123");
      expect(response.body.data.messages).toHaveLength(2);
      expect(personaService.sendMessage).toHaveBeenCalledWith(
        "persona1",
        "Hello",
        null,
        "user123",
        null
      );
    });

    it("should send message with file attachment", async () => {
      const mockResult = {
        conversation: {
          id: "conv123",
          title: "Chat with Assistant",
        },
        messages: [
          {
            id: "msg1",
            content: "Check this file",
            role: "USER",
            fileId: "file123",
            createdAt: new Date(),
          },
        ],
      };

      personaService.sendMessage.mockResolvedValue(mockResult);

      const response = await request(app)
        .post("/personas/persona1/messages")
        .send({
          message: "Check this file",
          fileId: "file123",
        })
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(personaService.sendMessage).toHaveBeenCalledWith(
        "persona1",
        "Check this file",
        null,
        "user123",
        "file123"
      );
    });

    it("should handle persona service errors", async () => {
      personaService.sendMessage.mockRejectedValue(
        new Error("Persona not found")
      );

      const response = await request(app)
        .post("/personas/invalid/messages")
        .send({
          message: "Hello",
        })
        .expect(500);

      expect(response.body.error.message).toBe("Persona not found");
    });
  });

  describe("POST /personas/:id/favourite", () => {
    it("should toggle persona favourite status", async () => {
      personaService.toggleFavourite.mockResolvedValue({
        isFavourited: true,
      });

      const response = await request(app)
        .post("/personas/persona1/favourite")
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.isFavourited).toBe(true);
      expect(personaService.toggleFavourite).toHaveBeenCalledWith(
        "persona1",
        "user123"
      );
    });

    it("should handle toggle favourite errors", async () => {
      personaService.toggleFavourite.mockRejectedValue(
        new Error("Persona not found")
      );

      const response = await request(app)
        .post("/personas/invalid/favourite")
        .expect(500);

      expect(response.body.error.message).toBe("Persona not found");
    });
  });

  describe("GET /personas/:id/conversations", () => {
    it("should return persona conversations", async () => {
      const mockConversations = {
        conversations: [
          {
            id: "conv1",
            title: "First chat",
            lastMessageAt: new Date(),
            messageCount: 5,
          },
          {
            id: "conv2",
            title: "Second chat",
            lastMessageAt: new Date(),
            messageCount: 3,
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          pages: 1,
        },
      };

      personaService.getConversations.mockResolvedValue(mockConversations);

      const response = await request(app)
        .get("/personas/persona1/conversations")
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.conversations).toHaveLength(2);
      expect(response.body.pagination.total).toBe(2);
      expect(personaService.getConversations).toHaveBeenCalledWith(
        "persona1",
        "user123",
        { page: 1, limit: 10 }
      );
    });

    it("should support pagination", async () => {
      const mockConversations = {
        conversations: [],
        pagination: {
          page: 2,
          limit: 5,
          total: 10,
          pages: 2,
        },
      };

      personaService.getConversations.mockResolvedValue(mockConversations);

      const response = await request(app)
        .get("/personas/persona1/conversations?page=2&limit=5")
        .expect(200);

      expect(response.body.pagination.page).toBe(2);
      expect(response.body.pagination.limit).toBe(5);
      expect(personaService.getConversations).toHaveBeenCalledWith(
        "persona1",
        "user123",
        { page: 2, limit: 5 }
      );
    });
  });

  describe("PUT /conversations/:id/archive", () => {
    it("should toggle archive conversation", async () => {
      personaService.toggleArchive.mockResolvedValue({
        id: "conv1",
        isArchived: true,
      });

      const response = await request(app)
        .put("/conversations/conv1/archive")
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.isArchived).toBe(true);
      expect(personaService.toggleArchive).toHaveBeenCalledWith(
        "conv1",
        "user123"
      );
    });
  });

  describe("PUT /conversations/:id/visibility", () => {
    it("should update conversation visibility", async () => {
      personaService.updateConversationVisibility.mockResolvedValue({
        id: "conv1",
        visibility: "PRIVATE",
      });

      const response = await request(app)
        .put("/conversations/conv1/visibility")
        .send({ visibility: "PRIVATE" })
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.visibility).toBe("PRIVATE");
      expect(personaService.updateConversationVisibility).toHaveBeenCalledWith(
        "conv1",
        "user123",
        "PRIVATE"
      );
    });
  });
});
