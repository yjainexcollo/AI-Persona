const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const fs = require("fs").promises;
const path = require("path");
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

// Key storage path
const KEY_STORAGE_PATH = path.join(__dirname, "../../.keys");

// Initialize or rotate keys
async function initializeKeys() {
  if (!currentKeyPair) {
    try {
      // Try to load existing keys from storage
      await fs.mkdir(KEY_STORAGE_PATH, { recursive: true });

      const privateKeyPath = path.join(KEY_STORAGE_PATH, "private.pem");
      const publicKeyPath = path.join(KEY_STORAGE_PATH, "public.pem");
      const keyIdPath = path.join(KEY_STORAGE_PATH, "keyid.txt");

      try {
        const [privateKey, publicKey, storedKeyId] = await Promise.all([
          fs.readFile(privateKeyPath, "utf8"),
          fs.readFile(publicKeyPath, "utf8"),
          fs.readFile(keyIdPath, "utf8"),
        ]);

        currentKeyPair = { privateKey, publicKey };
        keyId = storedKeyId.trim();

        console.log("✅ Loaded existing RSA keys from storage");
      } catch (error) {
        // Keys don't exist, generate new ones
        console.log("🔑 Generating new RSA key pair...");

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

        // Save keys to storage
        await Promise.all([
          fs.writeFile(privateKeyPath, currentKeyPair.privateKey),
          fs.writeFile(publicKeyPath, currentKeyPair.publicKey),
          fs.writeFile(keyIdPath, keyId),
        ]);

        console.log("✅ Generated and saved new RSA keys");
      }
    } catch (error) {
      console.error("❌ Error initializing keys:", error.message);
      // Fallback to in-memory keys if storage fails
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
  }

  return {
    privateKey: currentKeyPair.privateKey,
    publicKey: currentKeyPair.publicKey,
    kid: keyId,
  };
}

// Rotate keys (for production)
async function rotateKeys() {
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

  // Save new keys
  try {
    await fs.mkdir(KEY_STORAGE_PATH, { recursive: true });
    const privateKeyPath = path.join(KEY_STORAGE_PATH, "private.pem");
    const publicKeyPath = path.join(KEY_STORAGE_PATH, "public.pem");
    const keyIdPath = path.join(KEY_STORAGE_PATH, "keyid.txt");

    await Promise.all([
      fs.writeFile(privateKeyPath, newKeyPair.privateKey),
      fs.writeFile(publicKeyPath, newKeyPair.publicKey),
      fs.writeFile(keyIdPath, keyId),
    ]);
  } catch (error) {
    console.error("❌ Error saving rotated keys:", error.message);
  }

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
async function getCurrentKeys() {
  const keys = await initializeKeys();
  return {
    privateKey: keys.privateKey,
    publicKey: keys.publicKey,
    kid: keys.kid,
  };
}

// Generate JWKS (JSON Web Key Set)
async function generateJWKS() {
  const keys = await getCurrentKeys();
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

async function signToken(payload, options = {}) {
  const keys = await getCurrentKeys();
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

async function verifyToken(token) {
  try {
    const keys = await getCurrentKeys();
    return jwt.verify(token, keys.publicKey, { algorithms: ["RS256"] });
  } catch (err) {
    throw new ApiError(401, "Invalid or expired access token");
  }
}

async function signRefreshToken(payload, options = {}) {
  const keys = await getCurrentKeys();
  const opts = {
    expiresIn: options.expiresIn || config.jwtRefreshExpiresIn,
    algorithm: "RS256",
    keyid: keys.kid,
    ...options,
  };
  return jwt.sign(payload, keys.privateKey, opts);
}

async function verifyRefreshToken(token) {
  try {
    const keys = await getCurrentKeys();
    return jwt.verify(token, keys.publicKey, { algorithms: ["RS256"] });
  } catch (err) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }
}

// Initialize keys on module load
initializeKeys().catch(console.error);

module.exports = {
  signToken,
  verifyToken,
  signRefreshToken,
  verifyRefreshToken,
  generateJWKS,
  rotateKeys,
  getCurrentKeys,
};
