/**
 * AuthMiddleware - Protects routes by verifying JWT access tokens.
 * Attaches user and workspace context to req for downstream use.
 * Uses centralized error handling and is extensible for multi-tenancy.
 *
 * Usage:
 *   app.use('/api/protected', authMiddleware, protectedRoutes);
 */

const { verifyToken } = require("../utils/jwt");
const ApiError = require("../utils/apiError");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function authMiddleware(req, res, next) {
  try {
    // Get token from Authorization header (Bearer <token>)
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Authorization token missing or malformed");
    }
    const token = authHeader.split(" ")[1];

    // Verify token and extract payload (now async)
    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      throw new ApiError(401, "Invalid or expired token");
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user || user.status !== "ACTIVE") {
      throw new ApiError(401, "User not found or inactive");
    }
    if (!user.workspaceId) {
      throw new ApiError(403, "User is not assigned to any workspace");
    }
    // Attach user and workspace context to request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      workspaceId: user.workspaceId,
    };
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = authMiddleware;
