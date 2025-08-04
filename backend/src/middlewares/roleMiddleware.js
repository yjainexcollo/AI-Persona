const ApiError = require("../utils/apiError");

function roleMiddleware(requiredRoles, permitSelf = false) {
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

    // If permitSelf is true, allow access if user is accessing their own resource
    if (permitSelf && !hasRequiredRole) {
      const resourceUserId = req.params.uid || req.params.userId;
      if (resourceUserId && resourceUserId === req.user.id) {
        return next();
      }
    }

    if (!hasRequiredRole) {
      return next(new ApiError(403, "Insufficient permissions"));
    }

    next();
  };
}

module.exports = roleMiddleware;
