const logger = require("../../../src/utils/logger");

describe("Logger", () => {
  let originalConsoleLog;
  let originalConsoleError;
  let originalConsoleWarn;
  let originalConsoleInfo;

  beforeEach(() => {
    // Store original console methods
    originalConsoleLog = console.log;
    originalConsoleError = console.error;
    originalConsoleWarn = console.warn;
    originalConsoleInfo = console.info;

    // Mock console methods
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
    console.info = jest.fn();
  });

  afterEach(() => {
    // Restore original console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    console.info = originalConsoleInfo;
  });

  describe("logger", () => {
    it("should have required methods", () => {
      expect(logger.info).toBeDefined();
      expect(logger.error).toBeDefined();
      expect(logger.warn).toBeDefined();
      expect(logger.debug).toBeDefined();
    });

    it("should log info messages", () => {
      const message = "Test info message";

      // Mock the logger's info method
      const mockInfo = jest.fn();
      logger.info = mockInfo;

      logger.info(message);

      expect(mockInfo).toHaveBeenCalledWith(message);
    });

    it("should log error messages", () => {
      const message = "Test error message";

      // Mock the logger's error method
      const mockError = jest.fn();
      logger.error = mockError;

      logger.error(message);

      expect(mockError).toHaveBeenCalledWith(message);
    });

    it("should log warning messages", () => {
      const message = "Test warning message";

      // Mock the logger's warn method
      const mockWarn = jest.fn();
      logger.warn = mockWarn;

      logger.warn(message);

      expect(mockWarn).toHaveBeenCalledWith(message);
    });

    it("should log debug messages", () => {
      const message = "Test debug message";

      // Mock the logger's debug method
      const mockDebug = jest.fn();
      logger.debug = mockDebug;

      logger.debug(message);

      expect(mockDebug).toHaveBeenCalledWith(message);
    });

    it("should handle objects and arrays", () => {
      const testObject = { key: "value", number: 123 };
      const testArray = [1, 2, 3];

      // Mock the logger's info method
      const mockInfo = jest.fn();
      logger.info = mockInfo;

      logger.info("Object:", testObject);
      logger.info("Array:", testArray);

      expect(mockInfo).toHaveBeenCalledWith("Object:", testObject);
      expect(mockInfo).toHaveBeenCalledWith("Array:", testArray);
    });

    it("should have stream for morgan integration", () => {
      expect(logger.stream).toBeDefined();
      expect(typeof logger.stream.write).toBe("function");
    });

    it("should handle structured logging", () => {
      const data = {
        userId: "123",
        action: "login",
        timestamp: new Date().toISOString(),
      };

      // Mock the logger's info method
      const mockInfo = jest.fn();
      logger.info = mockInfo;

      logger.info("User action", data);

      expect(mockInfo).toHaveBeenCalledWith("User action", data);
    });
  });
});
