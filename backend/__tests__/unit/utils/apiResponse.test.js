const apiResponse = require("../../../src/utils/apiResponse");

describe("ApiResponse", () => {
  describe("apiResponse function", () => {
    it("should create success response with data", () => {
      const data = { user: { id: "123", name: "Test User" } };
      const message = "User created successfully";

      const response = apiResponse({
        data,
        message,
        status: "success",
      });

      expect(response).toEqual({
        status: "success",
        message,
        data,
      });
    });

    it("should create response with default values", () => {
      const response = apiResponse({});

      expect(response).toEqual({
        status: "success",
        message: "Success",
        data: null,
      });
    });

    it("should include meta when provided", () => {
      const data = { items: [] };
      const meta = { total: 0, page: 1 };

      const response = apiResponse({
        data,
        meta,
      });

      expect(response).toEqual({
        status: "success",
        message: "Success",
        data,
        meta,
      });
    });

    it("should create error response", () => {
      const message = "User not found";

      const response = apiResponse({
        message,
        status: "error",
      });

      expect(response).toEqual({
        status: "error",
        message,
        data: null,
      });
    });
  });
});
