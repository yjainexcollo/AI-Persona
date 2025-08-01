/**
 * MetricsController - Exposes metrics endpoints
 * Provides Prometheus and JSON format metrics
 */

const metricsService = require("../services/metricsService");
const asyncHandler = require("../utils/asyncHandler");

// GET /metrics (Prometheus format)
const getPrometheusMetrics = asyncHandler(async (req, res) => {
  const metrics = metricsService.getPrometheusMetrics();

  res.setHeader("Content-Type", "text/plain");
  res.status(200).send(metrics);
});

// GET /metrics/json (JSON format)
const getJsonMetrics = asyncHandler(async (req, res) => {
  const metrics = metricsService.getJsonMetrics();

  res.status(200).json({
    status: "success",
    data: metrics,
  });
});

// POST /metrics/reset (Admin only)
const resetMetrics = asyncHandler(async (req, res) => {
  metricsService.reset();

  res.status(200).json({
    status: "success",
    message: "Metrics reset successfully",
  });
});

module.exports = {
  getPrometheusMetrics,
  getJsonMetrics,
  resetMetrics,
};
