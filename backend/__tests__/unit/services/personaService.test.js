const personaService = require("../../../src/services/personaService");

// Mock axios
jest.mock("axios");

// Mock encrypt and decrypt
jest.mock("../../../src/utils/encrypt", () => ({
  encrypt: jest.fn((data) => `encrypted:${data}`),
  decrypt: jest.fn((data) => {
    if (typeof data === "string" && data.startsWith("encrypted:")) {
      return data.replace("encrypted:", "");
    }
    return data;
  }),
}));

// Mock authService
jest.mock("../../../src/services/authService", () => ({
  createAuditEvent: jest.fn().mockResolvedValue(undefined),
}));

// Mock logger
jest.mock("../../../src/utils/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

describe("PersonaService", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock implementations
    global.mockFindMany.mockReset();
    global.mockFindUnique.mockReset();
    global.mockCreate.mockReset();
  });

  describe("getPersonas", () => {
    it("should return all active personas", async () => {
      const user = { id: "user123" };
      const mockPersonas = [
        {
          id: "p1",
          name: "Test Persona 1",
          personaRole: "Test Role 1",
          about: "About test persona 1",
          traits: "Analytical; Strategic",
          painPoints: "Complex processes; Time constraints",
          coreExpertise: "Testing; Quality Assurance",
          communicationStyle: "Direct and clear",
          keyResponsibility: "Ensuring quality; Managing tests",
          description: "Test Description",
          webhookUrl: "https://test.com/webhook1",
          isActive: true,
          favourites: [],
          _count: { conversations: 0, messages: 0 },
        },
        {
          id: "p2",
          name: "Test Persona 2",
          personaRole: "Test Role 2",
          about: "About test persona 2",
          traits: "Creative; Collaborative",
          painPoints: "Resource limitations; Tight deadlines",
          coreExpertise: "Design; User Experience",
          communicationStyle: "Collaborative and visual",
          keyResponsibility: "Creating designs; User research",
          description: "Test Description 2",
          webhookUrl: "https://test.com/webhook2",
          isActive: true,
          favourites: [],
          _count: { conversations: 0, messages: 0 },
        },
      ];
      global.mockFindMany.mockResolvedValue(mockPersonas);

      const personas = await personaService.getPersonas(user.id);

      expect(personas).toHaveLength(2);
      expect(personas[0].name).toBe("Test Persona 1");
      expect(personas[0].personaRole).toBe("Test Role 1");
      expect(personas[0].about).toBe("About test persona 1");
      expect(personas[0].traits).toBe("Analytical; Strategic");
      expect(personas[0].painPoints).toBe(
        "Complex processes; Time constraints"
      );
      expect(personas[0].coreExpertise).toBe("Testing; Quality Assurance");
      expect(personas[0].communicationStyle).toBe("Direct and clear");
      expect(personas[0].keyResponsibility).toBe(
        "Ensuring quality; Managing tests"
      );
      expect(personas[0].description).toBe("Test Description");
      expect(personas[0].webhookUrl).toBeUndefined(); // Should be hidden
    });

    it("should filter favourites when requested", async () => {
      const user = { id: "user123" };
      const mockPersonas = [
        {
          id: "p1",
          name: "Test Persona",
          personaRole: "Test Role",
          about: "About test persona",
          traits: "Test traits",
          painPoints: "Test pain points",
          coreExpertise: "Test expertise",
          communicationStyle: "Test communication style",
          keyResponsibility: "Test responsibilities",
          description: "Test Description",
          webhookUrl: "https://test.com/webhook",
          isActive: true,
          favourites: [{ userId: user.id }],
          _count: { conversations: 0, messages: 0 },
        },
      ];
      global.mockFindMany.mockResolvedValue(mockPersonas);

      const personas = await personaService.getPersonas(user.id, {
        favouritesOnly: true,
      });

      expect(personas).toHaveLength(1);
      expect(personas[0].isFavourited).toBe(true);
    });
  });

  describe("sendMessage", () => {
    it("should send message to persona webhook", async () => {
      const personaId = "persona123";
      const message = "Hello!";
      const userId = "user123";

      const mockPersona = {
        id: personaId,
        name: "Test Persona",
        isActive: true,
        webhookUrl: "encrypted-webhook-url",
      };

      const mockConversation = {
        id: "conv1",
        userId,
        personaId,
        title: "Chat with Test Persona",
        isActive: true,
      };

      global.mockFindUnique.mockResolvedValue(mockPersona);
      global.mockCreate
        .mockResolvedValueOnce({ id: "conv1" }) // Conversation creation
        .mockResolvedValueOnce({ id: "msg1" }) // User message creation
        .mockResolvedValueOnce({ id: "msg2" }); // Assistant message creation

      const axios = require("axios");
      axios.post.mockResolvedValue({ data: { reply: "Hello!" } });

      const result = await personaService.sendMessage(
        personaId,
        message,
        null,
        userId
      );

      expect(result).toBeDefined();
      expect(result.reply).toBe("Hello!");
      expect(result.conversationId).toBe("conv1");
      expect(result.messageId).toBe("msg2");
    });

    it("should handle webhook failures with circuit breaker", async () => {
      const mockPersona = {
        id: "p1",
        name: "Test Persona",
        webhookUrl: "https://test.com/webhook",
        isActive: true,
      };
      global.mockFindUnique.mockResolvedValue(mockPersona);

      const axios = require("axios");
      axios.post.mockRejectedValue(new Error("Webhook failed"));

      global.mockCreate
        .mockResolvedValueOnce({ id: "conv1" }) // Conversation creation
        .mockResolvedValueOnce({ id: "msg1", text: "Hello" }); // Message creation

      await expect(
        personaService.sendMessage(
          "p1",
          "Hello",
          undefined,
          "user123",
          undefined
        )
      ).rejects.toThrow("Failed to get response from persona");
    });

    it("should throw error for non-existent persona", async () => {
      global.mockFindUnique.mockResolvedValue(null);

      await expect(
        personaService.sendMessage(
          "non-existent",
          "Hello",
          undefined,
          "user123",
          undefined
        )
      ).rejects.toThrow("Persona not found");
    });

    it("should throw error for inactive persona", async () => {
      const mockPersona = {
        id: "p1",
        name: "Test Persona",
        webhookUrl: "https://test.com/webhook",
        isActive: false,
      };
      global.mockFindUnique.mockResolvedValue(mockPersona);

      await expect(
        personaService.sendMessage(
          "p1",
          "Hello",
          undefined,
          "user123",
          undefined
        )
      ).rejects.toThrow("Persona is not active");
    });
  });
});
