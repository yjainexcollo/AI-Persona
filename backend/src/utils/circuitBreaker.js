/**
 * Circuit Breaker utility for handling webhook failures
 * Implements the circuit breaker pattern to prevent cascading failures
 */

const logger = require("./logger");

class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 5 * 60 * 1000; // 5 minutes
    this.failures = 0;
    this.lastFailureTime = null;
    this.state = "CLOSED"; // CLOSED, OPEN, HALF_OPEN
  }

  /**
   * Check if the circuit breaker is open (blocking requests)
   * @returns {boolean}
   */
  isOpen() {
    if (this.state === "OPEN") {
      // Check if enough time has passed to try again
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this.state = "HALF_OPEN";
        logger.info("Circuit breaker transitioning to HALF_OPEN state");
        return false;
      }
      return true;
    }
    return false;
  }

  /**
   * Record a successful request
   */
  onSuccess() {
    this.failures = 0;
    this.state = "CLOSED";
    this.lastFailureTime = null;
    logger.info("Circuit breaker reset to CLOSED state");
  }

  /**
   * Record a failed request
   */
  onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = "OPEN";
      logger.warn(
        `Circuit breaker opened after ${this.failures} consecutive failures`
      );
    }
  }

  /**
   * Get current state information
   * @returns {object}
   */
  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
      failureThreshold: this.failureThreshold,
      resetTimeout: this.resetTimeout,
    };
  }

  /**
   * Reset the circuit breaker manually
   */
  reset() {
    this.failures = 0;
    this.state = "CLOSED";
    this.lastFailureTime = null;
    logger.info("Circuit breaker manually reset");
  }
}

// Global circuit breaker registry
const circuitBreakers = new Map();

/**
 * Get or create a circuit breaker for a specific persona
 * @param {string} personaId - Persona ID
 * @returns {CircuitBreaker}
 */
function getCircuitBreaker(personaId) {
  if (!circuitBreakers.has(personaId)) {
    circuitBreakers.set(personaId, new CircuitBreaker());
  }
  return circuitBreakers.get(personaId);
}

/**
 * Get all circuit breaker states (for monitoring)
 * @returns {object}
 */
function getAllCircuitBreakerStates() {
  const states = {};
  for (const [personaId, breaker] of circuitBreakers.entries()) {
    states[personaId] = breaker.getState();
  }
  return states;
}

/**
 * Reset all circuit breakers (for testing/admin purposes)
 */
function resetAllCircuitBreakers() {
  for (const breaker of circuitBreakers.values()) {
    breaker.reset();
  }
  logger.info("All circuit breakers reset");
}

module.exports = {
  CircuitBreaker,
  getCircuitBreaker,
  getAllCircuitBreakerStates,
  resetAllCircuitBreakers,
};
