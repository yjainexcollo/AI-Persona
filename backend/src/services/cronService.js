/**
 * CronService - Automated cleanup and maintenance jobs
 * Handles scheduled tasks for user lifecycle management
 */

const cron = require("node-cron");
const authService = require("./authService");
const emailService = require("./emailService");
const logger = require("../utils/logger");

class CronService {
  constructor() {
    this.jobs = new Map();
  }

  // Initialize all cron jobs
  init() {
    this.scheduleUnverifiedUserCleanup();
    this.schedulePendingDeletionCleanup();
    this.scheduleExpiredSessionCleanup();
    this.scheduleExpiredTokenCleanup();

    logger.info("Cron jobs initialized successfully");
  }

  // Cleanup unverified users (hourly)
  scheduleUnverifiedUserCleanup() {
    const job = cron.schedule(
      "0 * * * *",
      async () => {
        try {
          const count = await authService.cleanupUnverifiedUsers(7); // 7 days
          if (count > 0) {
            logger.info(`Cron: Cleaned up ${count} unverified users`);
          }
        } catch (error) {
          logger.error(
            `Cron: Failed to cleanup unverified users: ${error.message}`
          );
        }
      },
      {
        scheduled: false,
        timezone: "UTC",
      }
    );

    this.jobs.set("unverified-cleanup", job);
    job.start();
  }

  // Cleanup pending deletion users (daily at 2 AM)
  schedulePendingDeletionCleanup() {
    const job = cron.schedule(
      "0 2 * * *",
      async () => {
        try {
          const count = await authService.cleanupPendingDeletionUsers(30); // 30 days
          if (count > 0) {
            logger.info(`Cron: Cleaned up ${count} pending deletion users`);
          }
        } catch (error) {
          logger.error(
            `Cron: Failed to cleanup pending deletion users: ${error.message}`
          );
        }
      },
      {
        scheduled: false,
        timezone: "UTC",
      }
    );

    this.jobs.set("pending-deletion-cleanup", job);
    job.start();
  }

  // Cleanup expired sessions (every 6 hours)
  scheduleExpiredSessionCleanup() {
    const job = cron.schedule(
      "0 */6 * * *",
      async () => {
        try {
          const count = await authService.cleanupExpiredSessions();
          if (count > 0) {
            logger.info(`Cron: Cleaned up ${count} expired sessions`);
          }
        } catch (error) {
          logger.error(
            `Cron: Failed to cleanup expired sessions: ${error.message}`
          );
        }
      },
      {
        scheduled: false,
        timezone: "UTC",
      }
    );

    this.jobs.set("session-cleanup", job);
    job.start();
  }

  // Cleanup expired tokens (every 2 hours)
  scheduleExpiredTokenCleanup() {
    const job = cron.schedule(
      "0 */2 * * *",
      async () => {
        try {
          await emailService.cleanupExpiredVerifications();
          // Add password reset token cleanup here if needed
        } catch (error) {
          logger.error(
            `Cron: Failed to cleanup expired tokens: ${error.message}`
          );
        }
      },
      {
        scheduled: false,
        timezone: "UTC",
      }
    );

    this.jobs.set("token-cleanup", job);
    job.start();
  }

  // Stop all cron jobs
  stop() {
    for (const [name, job] of this.jobs) {
      job.stop();
      logger.info(`Stopped cron job: ${name}`);
    }
    this.jobs.clear();
  }

  // Get status of all jobs
  getStatus() {
    const status = {};
    for (const [name, job] of this.jobs) {
      status[name] = {
        running: job.running,
        nextDate: job.nextDate(),
      };
    }
    return status;
  }
}

module.exports = new CronService();
