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
app.get("/conversations", personaController.getConversations);
app.put(
  "/conversations/:id/visibility",
  personaController.updateConversationVisibility
);
app.put("/conversations/:id/archive", personaController.toggleArchive);

// Error handling middleware (after routes)
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    error: err.message,
  });
});

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
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].name).toBe("Assistant");
      expect(personaService.getPersonas).toHaveBeenCalledWith("user123", {
        favouritesOnly: false,
      });
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
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].isFavourited).toBe(true);
      expect(personaService.getPersonas).toHaveBeenCalledWith("user123", {
        favouritesOnly: true,
      });
    });

    it("should handle service errors", async () => {
      const error = new Error("Service error");
      error.statusCode = 500;
      personaService.getPersonas.mockRejectedValue(error);

      const response = await request(app).get("/personas").expect(500);

      expect(response.body.error).toBe("Service error");
    });
  });

  describe("POST /personas/:id/messages", () => {
    it("should send message to persona", async () => {
      const mockConversation = { id: "conv123" };
      const mockMessages = [
        { id: "msg1", text: "Hello" },
        { id: "msg2", text: "Hi!" },
      ];
      personaService.sendMessage.mockResolvedValue({
        conversation: mockConversation,
        messages: mockMessages,
      });

      const response = await request(app)
        .post("/personas/persona1/messages")
        .send({ message: "Hello" })
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.conversation.id).toBe("conv123");
      expect(response.body.data.messages).toHaveLength(2);
      expect(personaService.sendMessage).toHaveBeenCalledWith(
        "persona1",
        "Hello",
        undefined, // conversationId
        "user123",
        undefined // fileId
      );
    });

    it("should send message with file attachment", async () => {
      const mockConversation = { id: "conv123" };
      const mockMessages = [
        { id: "msg1", text: "Check this file" },
        { id: "msg2", text: "File received!" },
      ];
      personaService.sendMessage.mockResolvedValue({
        conversation: mockConversation,
        messages: mockMessages,
      });

      const response = await request(app)
        .post("/personas/persona1/messages")
        .send({ message: "Check this file", fileId: "file123" })
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(personaService.sendMessage).toHaveBeenCalledWith(
        "persona1",
        "Check this file",
        undefined, // conversationId
        "user123",
        "file123" // fileId
      );
    });

    it("should handle persona service errors", async () => {
      const error = new Error("Persona not found");
      error.statusCode = 404;
      personaService.sendMessage.mockRejectedValue(error);

      const response = await request(app)
        .post("/personas/invalid/messages")
        .send({ message: "Hi" })
        .expect(404);

      expect(response.body.error).toBe("Persona not found");
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
      const error = new Error("Persona not found");
      error.statusCode = 404;
      personaService.toggleFavourite.mockRejectedValue(error);

      const response = await request(app)
        .post("/personas/invalid/favourite")
        .expect(404);

      expect(response.body.error).toBe("Persona not found");
    });
  });

  describe("GET /conversations", () => {
    it("should return user conversations", async () => {
      const mockConversations = [
        { id: "conv1", title: "Chat 1" },
        { id: "conv2", title: "Chat 2" },
      ];
      personaService.getConversations.mockResolvedValue({
        conversations: mockConversations,
        pagination: { total: 2, page: 1, limit: 10 },
      });

      const response = await request(app).get("/conversations").expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.conversations).toHaveLength(2);
      expect(response.body.data.pagination.total).toBe(2);
      expect(personaService.getConversations).toHaveBeenCalledWith(
        "user123",
        "workspace123",
        { archived: false }
      );
    });

    it("should support pagination", async () => {
      const mockConversations = [
        { id: "conv1", title: "Chat 1" },
        { id: "conv2", title: "Chat 2" },
      ];
      personaService.getConversations.mockResolvedValue({
        conversations: mockConversations,
        pagination: { total: 2, page: 2, limit: 5 },
      });

      const response = await request(app)
        .get("/conversations?page=2&limit=5")
        .expect(200);

      expect(response.body.data.pagination.page).toBe(2);
      expect(response.body.data.pagination.limit).toBe(5);
      expect(personaService.getConversations).toHaveBeenCalledWith(
        "user123",
        "workspace123",
        { archived: false }
      );
    });
  });

  describe("PUT /conversations/:id/archive", () => {
    it("should toggle archive conversation", async () => {
      personaService.toggleArchive.mockResolvedValue({ archived: true });

      const response = await request(app)
        .put("/conversations/conv1/archive")
        .send({ archived: true })
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.archived).toBe(true);
      expect(personaService.toggleArchive).toHaveBeenCalledWith(
        "conv1",
        "user123",
        true
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
