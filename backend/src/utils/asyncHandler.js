const logger = require("./logger");

function asyncHandler(fn) {
  if (typeof fn !== "function") {
    throw new TypeError("asyncHandler expects a function");
  }
  return function (req, res, next) {
    try {
      const result = fn(req, res, next);
      if (result && typeof result.then === "function") {
        // Handle async function
        result.catch((err) => {
          // Optional: log error with request context
          logger.error(
            "Async error in route %s %s: %o",
            req.method,
            req.originalUrl,
            err
          );
          next(err);
        });
      }
    } catch (err) {
      // Handle synchronous errors
      logger.error(
        "Sync error in route %s %s: %o",
        req.method,
        req.originalUrl,
        err
      );
      next(err);
    }
  };
}

module.exports = asyncHandler;
