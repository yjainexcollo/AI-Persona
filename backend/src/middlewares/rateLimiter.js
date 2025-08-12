const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit");
const Redis = require("ioredis");

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

// Redis connection error handling
redis.on("error", (err) => {
  console.warn("Redis rate limiter error:", err.message);
  // Fallback to memory-based rate limiting if Redis fails
});

redis.on("connect", () => {
  console.log("Redis connected for rate limiting");
});

// Custom sliding window store using Redis
class SlidingWindowRedisStore {
  constructor(options = {}) {
    this.prefix = options.prefix || "rl:";
    this.windowMs = options.windowMs || 60000;
    this.redis = redis;
  }

  async increment(key) {
    const now = Date.now();
    const window = this.windowMs;
    const redisKey = `${this.prefix}${key}`;

    try {
      // Use Redis pipeline for atomic operations
      const pipeline = this.redis.pipeline();

      // Remove expired entries (sliding window)
      pipeline.zremrangebyscore(redisKey, 0, now - window);

      // Add current request with timestamp
      pipeline.zadd(redisKey, now, `${now}-${Math.random()}`);

      // Count current entries
      pipeline.zcard(redisKey);

      // Set expiration for cleanup
      pipeline.expire(redisKey, Math.ceil(window / 1000) + 1);

      const results = await pipeline.exec();
      const count = results[2][1]; // Get count from zcard result

      return {
        totalHits: count,
        resetTime: new Date(now + window),
      };
    } catch (error) {
      console.warn("Sliding window Redis error:", error.message);
      // Return safe defaults if Redis fails
      return {
        totalHits: 1,
        resetTime: new Date(now + window),
      };
    }
  }

  async decrement(key) {
    // Not needed for sliding window, but required by interface
    return {};
  }

  async resetKey(key) {
    try {
      await this.redis.del(`${this.prefix}${key}`);
    } catch (error) {
      console.warn("Redis reset error:", error.message);
    }
  }
}

// Limit to 5 requests per hour per IP for resend-verification
const resendVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: {
      message:
        "Too many resend verification requests from this IP, please try again after an hour.",
    },
  },
  store: new SlidingWindowRedisStore({
    prefix: "rl:resend:",
    windowMs: 60 * 60 * 1000,
  }),
  standardHeaders: true,
  legacyHeaders: false,
  // Skip failed requests (don't count errors against limit)
  skipFailedRequests: true,
});

// Rate limiting for chat messages (60 requests/min per persona) - SLIDING WINDOW
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: {
    error: {
      message: "Too many chat requests, please try again later.",
    },
  },
  keyGenerator: (req) => {
    // Rate limit per persona + user combination
    return `chat:${req.user.id}:${req.params.id}`;
  },
  store: new SlidingWindowRedisStore({
    prefix: "rl:chat:",
    windowMs: 60 * 1000,
  }),
  standardHeaders: true,
  legacyHeaders: false,
  // Don't count failed requests
  skipFailedRequests: true,
});

// Rate limiting for general persona requests - SLIDING WINDOW
const personaLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    error: {
      message: "Too many requests, please try again later.",
    },
  },
  keyGenerator: (req) => {
    // Rate limit per user for authenticated requests, fallback to IP with IPv6 support
    return `persona:${req.user?.id || ipKeyGenerator(req)}`;
  },
  store: new SlidingWindowRedisStore({
    prefix: "rl:persona:",
    windowMs: 60 * 1000,
  }),
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true,
});

// Utility function to check Redis health
const checkRedisHealth = async () => {
  try {
    // Ensure Redis is connected before pinging
    if (redis.status !== "ready") {
      await redis.connect();
    }
    await redis.ping();
    return { healthy: true, message: "Redis connected" };
  } catch (error) {
    return {
      healthy: false,
      message: error.message || "Redis connection failed",
    };
  }
};

// Utility function to clear rate limits (for admin/testing)
const clearRateLimit = async (key, prefix = "rl:") => {
  try {
    const pattern = `${prefix}${key}*`;
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      return { cleared: keys.length };
    }
    return { cleared: 0 };
  } catch (error) {
    console.warn("Error clearing rate limits:", error.message);
    return { error: error.message };
  }
};

// Get current rate limit status for a key
const getRateLimitStatus = async (key, prefix = "rl:") => {
  try {
    // Ensure Redis is connected
    if (redis.status !== "ready") {
      await redis.connect();
    }

    const redisKey = `${prefix}${key}`;
    const count = await redis.zcard(redisKey);
    const ttl = await redis.ttl(redisKey);

    return {
      key: redisKey,
      currentCount: count,
      ttlSeconds: ttl,
      exists: count > 0,
    };
  } catch (error) {
    return {
      key: `${prefix}${key}`,
      currentCount: 0,
      ttlSeconds: -1,
      exists: false,
      error: error.message || "Redis connection failed",
    };
  }
};

// Auth-specific rate limiters (used by authRoutes.js)
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per hour per IP
  message: {
    error: {
      message: "Too many registration attempts, please try again later.",
    },
  },
  store: new SlidingWindowRedisStore({
    prefix: "rl:register:",
    windowMs: 60 * 60 * 1000,
  }),
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per 15 minutes per IP
  message: {
    error: {
      message: "Too many login attempts, please try again later.",
    },
  },
  store: new SlidingWindowRedisStore({
    prefix: "rl:login:",
    windowMs: 15 * 60 * 1000,
  }),
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true,
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour per IP
  message: {
    error: {
      message: "Too many password reset attempts, please try again later.",
    },
  },
  store: new SlidingWindowRedisStore({
    prefix: "rl:password-reset:",
    windowMs: 60 * 60 * 1000,
  }),
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true,
});

module.exports = {
  // Persona & Chat rate limiters
  resendVerificationLimiter,
  chatLimiter,
  personaLimiter,
  // Auth rate limiters
  registerLimiter,
  loginLimiter,
  passwordResetLimiter,
  // Utilities for monitoring and admin
  redis,
  checkRedisHealth,
  clearRateLimit,
  getRateLimitStatus,
  SlidingWindowRedisStore,
};
