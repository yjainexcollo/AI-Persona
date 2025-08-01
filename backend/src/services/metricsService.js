/**
 * MetricsService - Prometheus-style metrics collection
 * Tracks authentication events, performance metrics, and business KPIs
 */

const logger = require("../utils/logger");

class MetricsService {
  constructor() {
    this.metrics = {
      // Authentication metrics
      auth_register_total: 0,
      auth_login_success_total: 0,
      auth_login_failed_total: 0,
      auth_logout_total: 0,
      auth_refresh_total: 0,
      auth_verify_email_total: 0,
      auth_password_reset_request_total: 0,
      auth_password_reset_success_total: 0,

      // User lifecycle metrics
      user_deactivated_total: 0,
      user_deletion_requested_total: 0,
      user_reactivated_total: 0,

      // Session metrics
      session_created_total: 0,
      session_revoked_total: 0,
      session_expired_total: 0,

      // Email metrics
      email_verification_sent_total: 0,
      email_password_reset_sent_total: 0,
      email_send_failed_total: 0,

      // Security metrics
      account_locked_total: 0,
      failed_login_attempts_total: 0,

      // Cleanup metrics
      cleanup_unverified_users_total: 0,
      cleanup_pending_deletion_users_total: 0,
      cleanup_expired_sessions_total: 0,
      cleanup_expired_tokens_total: 0,

      // Performance metrics
      request_duration_ms: [],
      database_query_duration_ms: [],

      // Error metrics
      error_total: 0,
      validation_error_total: 0,
      authentication_error_total: 0,
      database_error_total: 0,
    };

    this.startTime = Date.now();
  }

  // Increment a counter metric
  increment(metricName, value = 1) {
    if (this.metrics[metricName] !== undefined) {
      this.metrics[metricName] += value;
      logger.debug(
        `Metric incremented: ${metricName} = ${this.metrics[metricName]}`
      );
    } else {
      logger.warn(`Unknown metric: ${metricName}`);
    }
  }

  // Record a duration metric
  recordDuration(metricName, durationMs) {
    if (this.metrics[metricName] !== undefined) {
      this.metrics[metricName].push(durationMs);
      // Keep only last 1000 measurements
      if (this.metrics[metricName].length > 1000) {
        this.metrics[metricName] = this.metrics[metricName].slice(-1000);
      }
    } else {
      logger.warn(`Unknown duration metric: ${metricName}`);
    }
  }

  // Get metrics in Prometheus format
  getPrometheusMetrics() {
    const lines = [];

    // Add uptime
    const uptime = (Date.now() - this.startTime) / 1000;
    lines.push(`# HELP app_uptime_seconds Application uptime in seconds`);
    lines.push(`# TYPE app_uptime_seconds gauge`);
    lines.push(`app_uptime_seconds ${uptime}`);

    // Add counters
    for (const [metricName, value] of Object.entries(this.metrics)) {
      if (typeof value === "number") {
        lines.push(
          `# HELP ${metricName} ${this.getMetricDescription(metricName)}`
        );
        lines.push(`# TYPE ${metricName} counter`);
        lines.push(`${metricName} ${value}`);
      }
    }

    // Add histograms for duration metrics
    for (const [metricName, values] of Object.entries(this.metrics)) {
      if (Array.isArray(values) && values.length > 0) {
        const sorted = values.sort((a, b) => a - b);
        const count = values.length;
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / count;
        const min = sorted[0];
        const max = sorted[sorted.length - 1];
        const p50 = sorted[Math.floor(count * 0.5)];
        const p95 = sorted[Math.floor(count * 0.95)];
        const p99 = sorted[Math.floor(count * 0.99)];

        lines.push(
          `# HELP ${metricName}_count ${this.getMetricDescription(metricName)}`
        );
        lines.push(`# TYPE ${metricName}_count counter`);
        lines.push(`${metricName}_count ${count}`);

        lines.push(
          `# HELP ${metricName}_sum ${this.getMetricDescription(metricName)}`
        );
        lines.push(`# TYPE ${metricName}_sum counter`);
        lines.push(`${metricName}_sum ${sum}`);

        lines.push(
          `# HELP ${metricName}_avg ${this.getMetricDescription(metricName)}`
        );
        lines.push(`# TYPE ${metricName}_avg gauge`);
        lines.push(`${metricName}_avg ${avg}`);

        lines.push(
          `# HELP ${metricName}_min ${this.getMetricDescription(metricName)}`
        );
        lines.push(`# TYPE ${metricName}_min gauge`);
        lines.push(`${metricName}_min ${min}`);

        lines.push(
          `# HELP ${metricName}_max ${this.getMetricDescription(metricName)}`
        );
        lines.push(`# TYPE ${metricName}_max gauge`);
        lines.push(`${metricName}_max ${max}`);

        lines.push(
          `# HELP ${metricName}_p50 ${this.getMetricDescription(metricName)}`
        );
        lines.push(`# TYPE ${metricName}_p50 gauge`);
        lines.push(`${metricName}_p50 ${p50}`);

        lines.push(
          `# HELP ${metricName}_p95 ${this.getMetricDescription(metricName)}`
        );
        lines.push(`# TYPE ${metricName}_p95 gauge`);
        lines.push(`${metricName}_p95 ${p95}`);

        lines.push(
          `# HELP ${metricName}_p99 ${this.getMetricDescription(metricName)}`
        );
        lines.push(`# TYPE ${metricName}_p99 gauge`);
        lines.push(`${metricName}_p99 ${p99}`);
      }
    }

    return lines.join("\n");
  }

  // Get metrics in JSON format
  getJsonMetrics() {
    const result = {
      uptime: (Date.now() - this.startTime) / 1000,
      counters: {},
      histograms: {},
      timestamp: new Date().toISOString(),
    };

    // Add counters
    for (const [metricName, value] of Object.entries(this.metrics)) {
      if (typeof value === "number") {
        result.counters[metricName] = value;
      }
    }

    // Add histograms
    for (const [metricName, values] of Object.entries(this.metrics)) {
      if (Array.isArray(values) && values.length > 0) {
        const sorted = values.sort((a, b) => a - b);
        const count = values.length;
        const sum = values.reduce((a, b) => a + b, 0);

        result.histograms[metricName] = {
          count,
          sum,
          avg: sum / count,
          min: sorted[0],
          max: sorted[sorted.length - 1],
          p50: sorted[Math.floor(count * 0.5)],
          p95: sorted[Math.floor(count * 0.95)],
          p99: sorted[Math.floor(count * 0.99)],
        };
      }
    }

    return result;
  }

  // Get metric description
  getMetricDescription(metricName) {
    const descriptions = {
      auth_register_total: "Total number of user registrations",
      auth_login_success_total: "Total number of successful logins",
      auth_login_failed_total: "Total number of failed login attempts",
      auth_logout_total: "Total number of user logouts",
      auth_refresh_total: "Total number of token refreshes",
      auth_verify_email_total: "Total number of email verifications",
      auth_password_reset_request_total:
        "Total number of password reset requests",
      auth_password_reset_success_total:
        "Total number of successful password resets",
      user_deactivated_total: "Total number of account deactivations",
      user_deletion_requested_total:
        "Total number of account deletion requests",
      user_reactivated_total: "Total number of account reactivations",
      session_created_total: "Total number of sessions created",
      session_revoked_total: "Total number of sessions revoked",
      session_expired_total: "Total number of expired sessions",
      email_verification_sent_total: "Total number of verification emails sent",
      email_password_reset_sent_total:
        "Total number of password reset emails sent",
      email_send_failed_total: "Total number of failed email sends",
      account_locked_total: "Total number of account lockouts",
      failed_login_attempts_total: "Total number of failed login attempts",
      cleanup_unverified_users_total:
        "Total number of unverified users cleaned up",
      cleanup_pending_deletion_users_total:
        "Total number of pending deletion users cleaned up",
      cleanup_expired_sessions_total:
        "Total number of expired sessions cleaned up",
      cleanup_expired_tokens_total: "Total number of expired tokens cleaned up",
      error_total: "Total number of errors",
      validation_error_total: "Total number of validation errors",
      authentication_error_total: "Total number of authentication errors",
      database_error_total: "Total number of database errors",
      request_duration_ms: "Request duration in milliseconds",
      database_query_duration_ms: "Database query duration in milliseconds",
    };

    return descriptions[metricName] || metricName;
  }

  // Reset all metrics (useful for testing)
  reset() {
    for (const [metricName, value] of Object.entries(this.metrics)) {
      if (typeof value === "number") {
        this.metrics[metricName] = 0;
      } else if (Array.isArray(value)) {
        this.metrics[metricName] = [];
      }
    }
    this.startTime = Date.now();
    logger.info("Metrics reset");
  }
}

module.exports = new MetricsService();
