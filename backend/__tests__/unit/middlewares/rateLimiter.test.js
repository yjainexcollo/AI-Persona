// Mock Redis for testing
jest.mock("ioredis", () => {
  const mockRedisInstance = {
    ping: jest.fn().mockResolvedValue("PONG"),
    keys: jest.fn().mockResolvedValue(["test-key-1", "test-key-2"]),
    del: jest.fn().mockResolvedValue(1),
    zcard: jest.fn().mockResolvedValue(0),
    ttl: jest.fn().mockResolvedValue(-1),
    zremrangebyscore: jest.fn().mockResolvedValue(0),
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue("OK"),
    expire: jest.fn().mockResolvedValue(1),
    zadd: jest.fn().mockResolvedValue(1),
    zcount: jest.fn().mockResolvedValue(0),
    on: jest.fn(),
    pipeline: jest.fn().mockReturnValue({
      zremrangebyscore: jest.fn().mockReturnThis(),
      zadd: jest.fn().mockReturnThis(),
      zcard: jest.fn().mockReturnThis(),
      expire: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([
        [null, 1], // zremrangebyscore result
        [null, 1], // zadd result
        [null, 1], // zcard result
        [null, 1], // expire result
      ]),
    }),
  };

  const MockRedis = jest.fn(() => mockRedisInstance);
  return MockRedis;
});

// Mock express-rate-limit
jest.mock("express-rate-limit", () => {
  return jest.fn(() => (req, res, next) => {
    // Simulate rate limiting middleware
    next();
  });
});

const rateLimiter = require("../../../src/middlewares/rateLimiter");

const {
  registerLimiter,
  loginLimiter,
  personaLimiter,
  checkRedisHealth,
  clearRateLimit,
  getRateLimitStatus,
} = require("../../../src/middlewares/rateLimiter");

describe("RateLimiter", () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      ip: "192.168.1.1",
      path: "/test",
      user: { id: "test-user-id" },
      headers: {},
      method: "GET",
      originalUrl: "/test",
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      set: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe("registerLimiter", () => {
    it("should be a function", () => {
      expect(typeof registerLimiter).toBe("function");
    });

    it("should call next() when called", async () => {
      // Rate limiters are async, so we need to wait
      registerLimiter(mockReq, mockRes, mockNext);

      // Wait a bit for the async operation to complete
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("loginLimiter", () => {
    it("should be a function", () => {
      expect(typeof loginLimiter).toBe("function");
    });

    it("should call next() when called", async () => {
      loginLimiter(mockReq, mockRes, mockNext);

      // Wait a bit for the async operation to complete
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("personaLimiter", () => {
    it("should be a function", () => {
      expect(typeof personaLimiter).toBe("function");
    });

    it("should call next() when called", async () => {
      personaLimiter(mockReq, mockRes, mockNext);

      // Wait a bit for the async operation to complete
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("Utility Functions", () => {
    it("should have checkRedisHealth function", () => {
      expect(typeof checkRedisHealth).toBe("function");
    });

    it("should have clearRateLimit function", () => {
      expect(typeof clearRateLimit).toBe("function");
    });

    it("should have getRateLimitStatus function", () => {
      expect(typeof getRateLimitStatus).toBe("function");
    });

    it("should check Redis health", async () => {
      const result = await checkRedisHealth();
      expect(result).toHaveProperty("healthy");
    });

    it.skip("should clear rate limits", async () => {
      const result = await clearRateLimit("test-key");
      expect(result).toHaveProperty("cleared");
    });

    it("should get rate limit status", async () => {
      const result = await getRateLimitStatus("test-key");
      expect(result).toHaveProperty("key");
    });
  });
});
