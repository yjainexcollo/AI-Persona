const personaService = require("../../../src/services/personaService");
const axios = require("axios");

// Mock axios
jest.mock("axios");

describe("PersonaService", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe("getPersonas", () => {
    it("should return all active personas", async () => {
      const user = await global.testUtils.createTestUser();

      // Create test personas
      const persona1 = await global.testPrisma.persona.create({
        data: {
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
        },
      });

      const persona2 = await global.testPrisma.persona.create({
        data: {
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
        },
      });

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
      const user = await global.testUtils.createTestUser();

      const persona = await global.testPrisma.persona.create({
        data: {
          name: "Test Persona",
          personaRole: "Test Role",
          about: "About test persona",
          traits: "Test traits",
          painPoints: "Test pain points",
          coreExpertise: "Test expertise",
          communicationStyle: "Test communication style",
          keyResponsibility: "Test responsibilities",
          webhookUrl: "https://test.com/webhook",
          isActive: true,
        },
      });

      // Create favourite relationship
      await global.testPrisma.personaFavourite.create({
        data: {
          userId: user.id,
          personaId: persona.id,
        },
      });

      const personas = await personaService.getPersonas(user.id, {
        favouritesOnly: true,
      });

      expect(personas).toHaveLength(1);
      expect(personas[0].isFavourited).toBe(true);
    });
  });

  describe("sendMessage", () => {
    it("should send message to persona webhook", async () => {
      const user = await global.testUtils.createTestUser();

      // Create persona with encrypted webhook URL
      const { encrypt } = require("../../../src/utils/encrypt");
      const encryptedWebhookUrl = encrypt(
        "https://test.com/webhook",
        process.env.ENCRYPTION_KEY
      );

      const persona = await global.testPrisma.persona.create({
        data: {
          name: "Test Persona",
          webhookUrl: encryptedWebhookUrl,
          isActive: true,
        },
      });

      // Mock successful webhook response
      axios.post.mockResolvedValue({
        data: { response: "Test response" },
        status: 200,
      });

      const result = await personaService.sendMessage(
        persona.id,
        "Hello, test message",
        null,
        user.id
      );

      expect(result.messages).toHaveLength(2); // User message + AI response
      expect(axios.post).toHaveBeenCalledWith(
        "https://test.com/webhook",
        expect.objectContaining({
          message: "Hello, test message",
        }),
        expect.any(Object)
      );
    });

    it("should handle webhook failures with circuit breaker", async () => {
      const user = await global.testUtils.createTestUser();

      // Create persona with encrypted webhook URL
      const { encrypt } = require("../../../src/utils/encrypt");
      const encryptedWebhookUrl = encrypt(
        "https://test.com/webhook",
        process.env.ENCRYPTION_KEY
      );

      const persona = await global.testPrisma.persona.create({
        data: {
          name: "Test Persona",
          webhookUrl: encryptedWebhookUrl,
          isActive: true,
        },
      });

      // Mock webhook failure multiple times to trigger circuit breaker
      axios.post.mockRejectedValue(new Error("Webhook failed"));

      // First call should fail but not trigger circuit breaker
      await expect(
        personaService.sendMessage(
          persona.id,
          "Hello, test message",
          null,
          user.id
        )
      ).rejects.toThrow("Webhook failed");

      // Mock circuit breaker to be open
      const {
        getCircuitBreaker,
      } = require("../../../src/utils/circuitBreaker");
      const mockCircuitBreaker = {
        isOpen: jest.fn().mockReturnValue(true),
      };
      jest
        .spyOn(
          require("../../../src/utils/circuitBreaker"),
          "getCircuitBreaker"
        )
        .mockReturnValue(mockCircuitBreaker);

      // Now test circuit breaker error
      await expect(
        personaService.sendMessage(
          persona.id,
          "Hello, test message",
          null,
          user.id
        )
      ).rejects.toThrow("Persona is temporarily unavailable");
    });
  });
});
