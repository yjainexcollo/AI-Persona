const ApiError = require("../utils/apiError");

function roleMiddleware(requiredRole) {
  return (req, res, next) => {
    if (
      !req.user ||
      req.user.role.toLowerCase() !== requiredRole.toLowerCase()
    ) {
      return next(new ApiError(403, "Insufficient permissions"));
    }
    next();
  };
}

module.exports = roleMiddleware;
