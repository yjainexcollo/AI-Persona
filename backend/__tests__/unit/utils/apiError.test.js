const ApiError = require("../../../src/utils/apiError");

describe("ApiError", () => {
  describe("constructor", () => {
    it("should create ApiError with status code and message", () => {
      const statusCode = 400;
      const message = "Bad Request";

      const error = new ApiError(statusCode, message);

      expect(error.statusCode).toBe(statusCode);
      expect(error.message).toBe(message);
      expect(error.name).toBe("ApiError");
    });

    it("should create ApiError with details", () => {
      const statusCode = 400;
      const message = "Bad Request";
      const details = { field: "email", reason: "invalid format" };

      const error = new ApiError(statusCode, message, details);

      expect(error.statusCode).toBe(statusCode);
      expect(error.message).toBe(message);
      expect(error.details).toEqual(details);
    });

    it("should inherit from Error", () => {
      const error = new ApiError(404, "Not Found");

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("ApiError");
    });
  });

  describe("different status codes", () => {
    it("should handle 400 Bad Request", () => {
      const error = new ApiError(400, "Bad Request");

      expect(error.statusCode).toBe(400);
      expect(error.message).toBe("Bad Request");
    });

    it("should handle 401 Unauthorized", () => {
      const error = new ApiError(401, "Unauthorized");

      expect(error.statusCode).toBe(401);
      expect(error.message).toBe("Unauthorized");
    });

    it("should handle 403 Forbidden", () => {
      const error = new ApiError(403, "Forbidden");

      expect(error.statusCode).toBe(403);
      expect(error.message).toBe("Forbidden");
    });

    it("should handle 404 Not Found", () => {
      const error = new ApiError(404, "Not Found");

      expect(error.statusCode).toBe(404);
      expect(error.message).toBe("Not Found");
    });

    it("should handle 500 Internal Server Error", () => {
      const error = new ApiError(500, "Internal Server Error");

      expect(error.statusCode).toBe(500);
      expect(error.message).toBe("Internal Server Error");
    });
  });

  describe("error handling", () => {
    it("should be throwable", () => {
      const error = new ApiError(400, "Bad Request");

      expect(() => {
        throw error;
      }).toThrow(ApiError);
    });

    it("should maintain stack trace", () => {
      const error = new ApiError(500, "Internal Server Error");

      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe("string");
    });

    it("should be serializable", () => {
      const error = new ApiError(404, "Not Found");

      const serialized = JSON.stringify({
        statusCode: error.statusCode,
        message: error.message,
        name: error.name,
      });

      expect(serialized).toContain("404");
      expect(serialized).toContain("Not Found");
      expect(serialized).toContain("ApiError");
    });
  });

  describe("details handling", () => {
    it("should include details when provided", () => {
      const details = { field: "email", reason: "invalid format" };
      const error = new ApiError(400, "Bad Request", details);

      expect(error.details).toEqual(details);
    });

    it("should not include details when not provided", () => {
      const error = new ApiError(404, "Not Found");

      expect(error.details).toBeUndefined();
    });

    it("should handle undefined details", () => {
      const error = new ApiError(500, "Internal Error", undefined);

      expect(error.details).toBeUndefined();
    });
  });
});
