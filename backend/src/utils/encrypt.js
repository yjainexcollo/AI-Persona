/**
 * Encryption utility for sensitive data
 * Uses AES-256-GCM with random IV for secure encryption/decryption
 */

const crypto = require("crypto");
const logger = require("./logger");

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

function encrypt(text, secretKey) {
  if (
    text === undefined ||
    text === null ||
    secretKey === undefined ||
    secretKey === null
  ) {
    throw new Error("Text and secret key are required");
  }
  try {
    // Accept both base64 and utf8 keys
    const key =
      Buffer.from(secretKey, "base64").length === 32
        ? Buffer.from(secretKey, "base64")
        : Buffer.from(secretKey, "utf8");
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    cipher.setAAD(Buffer.from("persona-webhook", "utf8"));
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    const tag = cipher.getAuthTag();
    const result = Buffer.concat([iv, Buffer.from(encrypted, "hex"), tag]);
    return result.toString("base64");
  } catch (error) {
    logger.error("Encryption failed:", error);
    throw new Error("Encryption failed");
  }
}

function decrypt(encryptedText, secretKey) {
  if (
    encryptedText === undefined ||
    encryptedText === null ||
    secretKey === undefined ||
    secretKey === null
  ) {
    throw new Error("Encrypted text and secret key are required");
  }
  try {
    const key =
      Buffer.from(secretKey, "base64").length === 32
        ? Buffer.from(secretKey, "base64")
        : Buffer.from(secretKey, "utf8");
    const encryptedBuffer = Buffer.from(encryptedText, "base64");
    const iv = encryptedBuffer.subarray(0, IV_LENGTH);
    const tag = encryptedBuffer.subarray(encryptedBuffer.length - TAG_LENGTH);
    const encrypted = encryptedBuffer.subarray(
      IV_LENGTH,
      encryptedBuffer.length - TAG_LENGTH
    );
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    decipher.setAAD(Buffer.from("persona-webhook", "utf8"));
    let decrypted = decipher.update(encrypted, undefined, "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    logger.error("Decryption failed:", error);
    throw new Error("Decryption failed");
  }
}

function generateKey() {
  return crypto.randomBytes(32).toString("base64");
}

module.exports = {
  encrypt,
  decrypt,
  generateKey,
};
