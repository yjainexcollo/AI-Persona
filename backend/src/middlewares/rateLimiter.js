const rateLimit = require("express-rate-limit");

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
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for chat messages (60 requests/min per persona)
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
    return `${req.user.id}:${req.params.id}`;
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for general persona requests
const personaLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    error: {
      message: "Too many requests, please try again later.",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  resendVerificationLimiter,
  chatLimiter,
  personaLimiter,
};
