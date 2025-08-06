const {
  authLimiter,
  generalLimiter,
  strictLimiter,
} = require("../../../src/middlewares/rateLimiter");

// Mock express-rate-limit
jest.mock("express-rate-limit", () => {
  return jest.fn((options) => {
    // Return a mock middleware function that includes the options for testing
    const middleware = jest.fn((req, res, next) => {
      // Simulate rate limiting behavior
      const ip = req.ip || "127.0.0.1";
      const key = `${ip}-${options.windowMs}-${options.max}`;

      // Mock rate limit store
      if (!middleware._store) {
        middleware._store = new Map();
      }

      const now = Date.now();
      const windowStart = Math.floor(now / options.windowMs) * options.windowMs;
      const entry = middleware._store.get(key) || {
        count: 0,
        resetTime: windowStart + options.windowMs,
      };

      if (now >= entry.resetTime) {
        entry.count = 0;
        entry.resetTime = windowStart + options.windowMs;
      }

      entry.count++;
      middleware._store.set(key, entry);

      if (entry.count > options.max) {
        return res.status(429).json({
          error: {
            message: options.message,
            retryAfter: Math.ceil((entry.resetTime - now) / 1000),
          },
        });
      }

      // Set rate limit headers
      res.set({
        "X-RateLimit-Limit": options.max,
        "X-RateLimit-Remaining": Math.max(0, options.max - entry.count),
        "X-RateLimit-Reset": new Date(entry.resetTime).toISOString(),
      });

      next();
    });

    // Attach options to middleware for testing
    middleware._options = options;
    return middleware;
  });
});

describe("RateLimiter", () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      ip: "192.168.1.1",
      path: "/test",
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      set: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe("authLimiter", () => {
    it("should be configured with correct options", () => {
      expect(authLimiter._options).toBeDefined();
      expect(authLimiter._options.windowMs).toBe(15 * 60 * 1000); // 15 minutes
      expect(authLimiter._options.max).toBe(5); // 5 attempts
      expect(authLimiter._options.message).toContain(
        "Too many authentication attempts"
      );
    });

    it("should allow requests under the limit", () => {
      authLimiter(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.set).toHaveBeenCalledWith({
        "X-RateLimit-Limit": 5,
        "X-RateLimit-Remaining": 4,
        "X-RateLimit-Reset": expect.any(String),
      });
    });

    it("should block requests over the limit", () => {
      // Make 6 requests to exceed the limit
      for (let i = 0; i < 6; i++) {
        authLimiter(mockReq, mockRes, mockNext);
      }

      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: {
          message: expect.stringContaining("Too many authentication attempts"),
          retryAfter: expect.any(Number),
        },
      });
    });

    it("should reset counter after window expires", () => {
      // Mock Date.now to simulate time passing
      const originalNow = Date.now;
      let mockTime = originalNow();
      Date.now = jest.fn(() => mockTime);

      // Make 5 requests (at the limit)
      for (let i = 0; i < 5; i++) {
        authLimiter(mockReq, mockRes, mockNext);
      }

      // Advance time beyond the window
      mockTime += 16 * 60 * 1000; // 16 minutes

      // Clear the middleware store to simulate reset
      authLimiter._store = new Map();

      // Next request should be allowed
      authLimiter(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalledWith(429);

      // Restore Date.now
      Date.now = originalNow;
    });

    it("should handle different IP addresses separately", () => {
      const req1 = { ...mockReq, ip: "192.168.1.1" };
      const req2 = { ...mockReq, ip: "192.168.1.2" };

      // Make 5 requests from first IP
      for (let i = 0; i < 5; i++) {
        authLimiter(req1, mockRes, mockNext);
      }

      // Request from second IP should still be allowed
      authLimiter(req2, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalledWith(429);
    });
  });

  describe("generalLimiter", () => {
    it("should be configured with correct options", () => {
      expect(generalLimiter._options).toBeDefined();
      expect(generalLimiter._options.windowMs).toBe(15 * 60 * 1000); // 15 minutes
      expect(generalLimiter._options.max).toBe(100); // 100 requests
      expect(generalLimiter._options.message).toContain("Too many requests");
    });

    it("should allow requests under the limit", () => {
      generalLimiter(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.set).toHaveBeenCalledWith({
        "X-RateLimit-Limit": 100,
        "X-RateLimit-Remaining": 99,
        "X-RateLimit-Reset": expect.any(String),
      });
    });

    it("should have higher limit than auth limiter", () => {
      expect(generalLimiter._options.max).toBeGreaterThan(
        authLimiter._options.max
      );
    });

    it("should block requests over the limit", () => {
      // Make 101 requests to exceed the limit
      for (let i = 0; i < 101; i++) {
        generalLimiter(mockReq, mockRes, mockNext);
      }

      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: {
          message: expect.stringContaining("Too many requests"),
          retryAfter: expect.any(Number),
        },
      });
    });
  });

  describe("strictLimiter", () => {
    it("should be configured with correct options", () => {
      expect(strictLimiter._options).toBeDefined();
      expect(strictLimiter._options.windowMs).toBe(15 * 60 * 1000); // 15 minutes
      expect(strictLimiter._options.max).toBe(10); // 10 requests
      expect(strictLimiter._options.message).toContain("Too many requests");
    });

    it("should allow requests under the limit", () => {
      strictLimiter(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.set).toHaveBeenCalledWith({
        "X-RateLimit-Limit": 10,
        "X-RateLimit-Remaining": 9,
        "X-RateLimit-Reset": expect.any(String),
      });
    });

    it("should have lower limit than general limiter but higher than auth", () => {
      expect(strictLimiter._options.max).toBeLessThan(
        generalLimiter._options.max
      );
      expect(strictLimiter._options.max).toBeGreaterThan(
        authLimiter._options.max
      );
    });

    it("should block requests over the limit", () => {
      // Make 11 requests to exceed the limit
      for (let i = 0; i < 11; i++) {
        strictLimiter(mockReq, mockRes, mockNext);
      }

      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: {
          message: expect.stringContaining("Too many requests"),
          retryAfter: expect.any(Number),
        },
      });
    });
  });

  describe("Rate Limit Headers", () => {
    it("should set correct rate limit headers", () => {
      authLimiter(mockReq, mockRes, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith({
        "X-RateLimit-Limit": expect.any(Number),
        "X-RateLimit-Remaining": expect.any(Number),
        "X-RateLimit-Reset": expect.any(String),
      });
    });

    it("should decrease remaining count with each request", () => {
      // First request
      authLimiter(mockReq, mockRes, mockNext);
      expect(mockRes.set).toHaveBeenCalledWith(
        expect.objectContaining({
          "X-RateLimit-Remaining": 4,
        })
      );

      // Second request
      authLimiter(mockReq, mockRes, mockNext);
      expect(mockRes.set).toHaveBeenCalledWith(
        expect.objectContaining({
          "X-RateLimit-Remaining": 3,
        })
      );
    });

    it("should show 0 remaining when at limit", () => {
      // Make 5 requests (at the limit)
      for (let i = 0; i < 5; i++) {
        authLimiter(mockReq, mockRes, mockNext);
      }

      expect(mockRes.set).toHaveBeenLastCalledWith(
        expect.objectContaining({
          "X-RateLimit-Remaining": 0,
        })
      );
    });
  });
});
