/**
 * ChatSessionService Unit Tests
 * Tests for chat session management functionality
 */

const chatSessionService = require("../../../src/services/chatSessionService");
const { PrismaClient } = require("@prisma/client");

// Mock Prisma
jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    chatSession: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
      groupBy: jest.fn(),
      count: jest.fn(),
    },
    message: {
      update: jest.fn(),
    },
  })),
}));

describe("ChatSessionService", () => {
  let mockPrisma;

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    global.testPrisma = mockPrisma;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createChatSession", () => {
    it("should create a new chat session", async () => {
      const mockSession = {
        id: "session123",
        sessionId: "abc123def456",
        conversationId: "conv123",
        personaId: "persona123",
        userId: "user123",
        status: "ACTIVE",
        metadata: {
          userAgent: "test-agent",
          ipAddress: "127.0.0.1",
        },
      };

      mockPrisma.chatSession.create.mockResolvedValue(mockSession);

      const result = await chatSessionService.createChatSession(
        "conv123",
        "persona123",
        "user123",
        { userAgent: "test-agent", ipAddress: "127.0.0.1" }
      );

      expect(result).toEqual(mockSession);
      expect(mockPrisma.chatSession.create).toHaveBeenCalledWith({
        data: {
          conversationId: "conv123",
          personaId: "persona123",
          userId: "user123",
          sessionId: expect.any(String),
          metadata: {
            userAgent: "test-agent",
            ipAddress: "127.0.0.1",
            deviceInfo: null,
          },
        },
        include: {
          conversation: true,
          persona: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
    });

    it("should handle creation errors", async () => {
      mockPrisma.chatSession.create.mockRejectedValue(
        new Error("Database error")
      );

      await expect(
        chatSessionService.createChatSession("conv123", "persona123", "user123")
      ).rejects.toThrow("Failed to create chat session");
    });
  });

  describe("updateChatSessionStatus", () => {
    it("should update session status to completed", async () => {
      const mockUpdatedSession = {
        id: "session123",
        sessionId: "abc123def456",
        status: "COMPLETED",
        endedAt: new Date(),
      };

      mockPrisma.chatSession.update.mockResolvedValue(mockUpdatedSession);

      const result = await chatSessionService.updateChatSessionStatus(
        "abc123def456",
        "COMPLETED"
      );

      expect(result).toEqual(mockUpdatedSession);
      expect(mockPrisma.chatSession.update).toHaveBeenCalledWith({
        where: { sessionId: "abc123def456" },
        data: {
          status: "COMPLETED",
          lastActivityAt: expect.any(Date),
          endedAt: expect.any(Date),
        },
        include: {
          conversation: true,
          persona: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
    });

    it("should update session status with error message", async () => {
      const mockUpdatedSession = {
        id: "session123",
        sessionId: "abc123def456",
        status: "FAILED",
        errorMessage: "Webhook timeout",
      };

      mockPrisma.chatSession.update.mockResolvedValue(mockUpdatedSession);

      const result = await chatSessionService.updateChatSessionStatus(
        "abc123def456",
        "FAILED",
        "Webhook timeout"
      );

      expect(result).toEqual(mockUpdatedSession);
      expect(mockPrisma.chatSession.update).toHaveBeenCalledWith({
        where: { sessionId: "abc123def456" },
        data: {
          status: "FAILED",
          lastActivityAt: expect.any(Date),
          endedAt: expect.any(Date),
          errorMessage: "Webhook timeout",
        },
        include: {
          conversation: true,
          persona: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
    });
  });

  describe("getChatSession", () => {
    it("should return chat session by session ID", async () => {
      const mockSession = {
        id: "session123",
        sessionId: "abc123def456",
        userId: "user123",
        messages: [
          { id: "msg1", content: "Hello", role: "USER" },
          { id: "msg2", content: "Hi there!", role: "ASSISTANT" },
        ],
      };

      mockPrisma.chatSession.findUnique.mockResolvedValue(mockSession);

      const result = await chatSessionService.getChatSession("abc123def456");

      expect(result).toEqual(mockSession);
      expect(mockPrisma.chatSession.findUnique).toHaveBeenCalledWith({
        where: { sessionId: "abc123def456" },
        include: {
          conversation: true,
          persona: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          messages: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              content: true,
              role: true,
              createdAt: true,
            },
          },
        },
      });
    });

    it("should throw error when session not found", async () => {
      mockPrisma.chatSession.findUnique.mockResolvedValue(null);

      await expect(
        chatSessionService.getChatSession("nonexistent")
      ).rejects.toThrow("Chat session not found");
    });
  });

  describe("getUserChatSessions", () => {
    it("should return user's chat sessions", async () => {
      const mockSessions = [
        {
          id: "session1",
          sessionId: "abc123",
          status: "COMPLETED",
        },
        {
          id: "session2",
          sessionId: "def456",
          status: "ACTIVE",
        },
      ];

      mockPrisma.chatSession.findMany.mockResolvedValue(mockSessions);

      const result = await chatSessionService.getUserChatSessions("user123", {
        limit: 10,
        offset: 0,
      });

      expect(result).toEqual(mockSessions);
      expect(mockPrisma.chatSession.findMany).toHaveBeenCalledWith({
        where: { userId: "user123" },
        include: {
          conversation: true,
          persona: true,
          messages: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              content: true,
              role: true,
              createdAt: true,
            },
          },
        },
        orderBy: { startedAt: "desc" },
        take: 10,
        skip: 0,
      });
    });

    it("should filter by status", async () => {
      const mockSessions = [
        {
          id: "session1",
          sessionId: "abc123",
          status: "COMPLETED",
        },
      ];

      mockPrisma.chatSession.findMany.mockResolvedValue(mockSessions);

      const result = await chatSessionService.getUserChatSessions("user123", {
        status: "COMPLETED",
      });

      expect(result).toEqual(mockSessions);
      expect(mockPrisma.chatSession.findMany).toHaveBeenCalledWith({
        where: { userId: "user123", status: "COMPLETED" },
        include: expect.any(Object),
        orderBy: { startedAt: "desc" },
        take: 50,
        skip: 0,
      });
    });
  });

  describe("cleanupExpiredSessions", () => {
    it("should clean up expired sessions", async () => {
      mockPrisma.chatSession.updateMany.mockResolvedValue({ count: 5 });

      const result = await chatSessionService.cleanupExpiredSessions(24);

      expect(result).toBe(5);
      expect(mockPrisma.chatSession.updateMany).toHaveBeenCalledWith({
        where: {
          status: "ACTIVE",
          lastActivityAt: {
            lt: expect.any(Date),
          },
        },
        data: {
          status: "TIMEOUT",
          endedAt: expect.any(Date),
          errorMessage: "Session timed out due to inactivity",
        },
      });
    });
  });

  describe("getChatSessionStats", () => {
    it("should return session statistics", async () => {
      const mockStats = [
        { status: "ACTIVE", _count: { id: 3 } },
        { status: "COMPLETED", _count: { id: 10 } },
        { status: "FAILED", _count: { id: 2 } },
      ];

      mockPrisma.chatSession.groupBy.mockResolvedValue(mockStats);
      mockPrisma.chatSession.count
        .mockResolvedValueOnce(15) // total
        .mockResolvedValueOnce(3); // active

      const result = await chatSessionService.getChatSessionStats("user123");

      expect(result).toEqual({
        total: 15,
        active: 3,
        byStatus: {
          ACTIVE: 3,
          COMPLETED: 10,
          FAILED: 2,
        },
      });
    });
  });
});
