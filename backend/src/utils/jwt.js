const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const config = require("../config");
const ApiError = require("./apiError");
const apiResponse = require("./apiResponse");

/**
 * JWT utility with key rotation, kid headers, and JWKS support
 * Uses RSA key pairs for production security
 */

// Key management
let currentKeyPair = null;
let keyId = null;

// Initialize or rotate keys
function initializeKeys() {
  if (!currentKeyPair) {
    // Generate new RSA key pair
    currentKeyPair = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
      },
    });
    keyId = crypto.randomBytes(16).toString("hex");
  }
  return {
    privateKey: currentKeyPair.privateKey,
    publicKey: currentKeyPair.publicKey,
    kid: keyId,
  };
}

// Rotate keys (for production)
function rotateKeys() {
  const newKeyPair = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  // Keep old key for token verification during transition
  const oldKeyPair = currentKeyPair;
  const oldKid = keyId;

  currentKeyPair = newKeyPair;
  keyId = crypto.randomBytes(16).toString("hex");

  return {
    newKey: {
      privateKey: newKeyPair.privateKey,
      publicKey: newKeyPair.publicKey,
      kid: keyId,
    },
    oldKey: {
      privateKey: oldKeyPair.privateKey,
      publicKey: oldKeyPair.publicKey,
      kid: oldKid,
    },
  };
}

// Get current keys for JWKS
function getCurrentKeys() {
  const keys = initializeKeys();
  return {
    privateKey: keys.privateKey,
    publicKey: keys.publicKey,
    kid: keys.kid,
  };
}

// Generate JWKS (JSON Web Key Set)
function generateJWKS() {
  const keys = getCurrentKeys();
  const jwk = {
    kty: "RSA",
    use: "sig",
    kid: keys.kid,
    x5t: keys.kid,
    n: Buffer.from(
      keys.publicKey.replace(/-----.+-----/g, "").replace(/\s/g, ""),
      "base64"
    ).toString("base64url"),
    e: "AQAB",
  };

  return {
    keys: [jwk],
  };
}

function signToken(payload, options = {}) {
  const keys = getCurrentKeys();
  const opts = {
    expiresIn: options.expiresIn || config.jwtExpiresIn,
    algorithm: "RS256",
    keyid: keys.kid,
    ...options,
  };

  const token = jwt.sign(payload, keys.privateKey, opts);
  if (options.apiResponse) {
    return apiResponse({ data: { token }, message: "Token generated" });
  }
  return token;
}

function verifyToken(token) {
  try {
    const keys = getCurrentKeys();
    return jwt.verify(token, keys.publicKey, { algorithms: ["RS256"] });
  } catch (err) {
    throw new ApiError(401, "Invalid or expired access token");
  }
}

function signRefreshToken(payload, options = {}) {
  const keys = getCurrentKeys();
  const opts = {
    expiresIn: options.expiresIn || config.jwtRefreshExpiresIn,
    algorithm: "RS256",
    keyid: keys.kid,
    ...options,
  };
  return jwt.sign(payload, keys.privateKey, opts);
}

function verifyRefreshToken(token) {
  try {
    const keys = getCurrentKeys();
    return jwt.verify(token, keys.publicKey, { algorithms: ["RS256"] });
  } catch (err) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }
}

// Initialize keys on module load
initializeKeys();

module.exports = {
  signToken,
  verifyToken,
  signRefreshToken,
  verifyRefreshToken,
  generateJWKS,
  rotateKeys,
  getCurrentKeys,
};
