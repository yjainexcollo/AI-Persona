/**
 * MetricsRoutes - Metrics endpoints
 * Exposes Prometheus and JSON metrics
 */

const express = require("express");
const router = express.Router();
const metricsController = require("../controllers/metricsController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Public metrics endpoints (for monitoring)
router.get("/", metricsController.getPrometheusMetrics);
router.get("/json", metricsController.getJsonMetrics);

// Admin-only metrics management
const adminOnly = [authMiddleware, roleMiddleware("ADMIN")];
router.post("/reset", ...adminOnly, metricsController.resetMetrics);

module.exports = router;
 