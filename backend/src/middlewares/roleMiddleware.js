const ApiError = require("../utils/apiError");

function roleMiddleware(requiredRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required"));
    }

    // Convert to array if single role is passed
    const roles = Array.isArray(requiredRoles)
      ? requiredRoles
      : [requiredRoles];

    // Check if user's role is in the required roles
    const hasRequiredRole = roles.some(
      (role) => req.user.role.toLowerCase() === role.toLowerCase()
    );

    if (!hasRequiredRole) {
      return next(new ApiError(403, "Insufficient permissions"));
    }

    next();
  };
}

module.exports = roleMiddleware;
