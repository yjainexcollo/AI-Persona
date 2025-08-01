/**
 * BreachCheckService - Have I Been Pwned API integration
 * Checks passwords against breached database
 */

const crypto = require("crypto");
const axios = require("axios");
const logger = require("../utils/logger");

class BreachCheckService {
  constructor() {
    this.apiUrl = "https://api.pwnedpasswords.com/range/";
    this.userAgent = "AI-Persona-Backend/1.0.0";
  }

  /**
   * Check if password has been breached using HIBP API
   * Uses k-anonymity approach for privacy
   */
  async checkPasswordBreach(password) {
    try {
      // SHA-1 hash the password
      const sha1Hash = crypto
        .createHash("sha1")
        .update(password)
        .digest("hex")
        .toUpperCase();
      const prefix = sha1Hash.substring(0, 5);
      const suffix = sha1Hash.substring(5);

      // Make API request with only the prefix
      const response = await axios.get(`${this.apiUrl}${prefix}`, {
        headers: {
          "User-Agent": this.userAgent,
          "Add-Padding": "true",
        },
      });

      // Parse response and check if our suffix exists
      const hashes = response.data.split("\r\n");
      const foundHash = hashes.find((hash) => hash.startsWith(suffix));

      if (foundHash) {
        const count = parseInt(foundHash.split(":")[1]);
        logger.warn(`Password breach detected: ${count} occurrences`);
        return {
          breached: true,
          count: count,
          severity: this.getSeverityLevel(count),
        };
      }

      return {
        breached: false,
        count: 0,
        severity: "safe",
      };
    } catch (error) {
      logger.error(`HIBP API error: ${error.message}`);
      // Don't fail registration if HIBP is down
      return {
        breached: false,
        count: 0,
        severity: "unknown",
        error: "Service unavailable",
      };
    }
  }

  /**
   * Get severity level based on breach count
   */
  getSeverityLevel(count) {
    if (count > 100000) return "critical";
    if (count > 10000) return "high";
    if (count > 1000) return "medium";
    if (count > 100) return "low";
    return "safe";
  }

  /**
   * Enhanced password validation with breach checking
   */
  async validatePasswordWithBreachCheck(password) {
    const breachResult = await this.checkPasswordBreach(password);

    if (breachResult.breached) {
      return {
        isValid: false,
        reason: `Password has been breached ${breachResult.count} times`,
        severity: breachResult.severity,
        count: breachResult.count,
      };
    }

    return {
      isValid: true,
      reason: "Password is secure",
      severity: "safe",
    };
  }
}

module.exports = new BreachCheckService();
