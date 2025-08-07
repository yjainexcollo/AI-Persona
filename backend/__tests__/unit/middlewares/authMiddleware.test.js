const authMiddleware = require("../../../src/middlewares/authMiddleware");

describe("AuthMiddleware", () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {},
      user: null,
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();

    // Reset mocks
    jest.clearAllMocks();
  });

  describe("authMiddleware", () => {
    it("should reject request without token", async () => {
      await authMiddleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: "Authorization token missing or malformed",
        })
      );
    });

    it("should reject invalid token", async () => {
      mockReq.headers.authorization = "Bearer invalid-token";

      await authMiddleware(mockReq, mockRes, mockNext);

      // The testAuthMiddleware passes JWT errors directly to next()
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "jwt malformed",
        })
      );
    });

    it("should reject malformed authorization header", async () => {
      mockReq.headers.authorization = "InvalidFormat";

      await authMiddleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: "Authorization token missing or malformed",
        })
      );
    });

    it("should reject request with missing authorization header", async () => {
      mockReq.headers = {};

      await authMiddleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: "Authorization token missing or malformed",
        })
      );
    });

    it("should reject request with empty authorization header", async () => {
      mockReq.headers.authorization = "";

      await authMiddleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: "Authorization token missing or malformed",
        })
      );
    });
  });
});
