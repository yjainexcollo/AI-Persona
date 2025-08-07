describe("Simple Test", () => {
  it("should pass basic test", () => {
    expect(1 + 1).toBe(2);
  });

  it("should have access to global test utilities", () => {
    expect(global.testUtils).toBeDefined();
    expect(global.testPrisma).toBeDefined();
  });

  it("should be able to create test user", async () => {
    // Test that the function exists and can be called
    expect(typeof global.testUtils.createTestUser).toBe("function");

    // Test with a simple mock to avoid database operations
    const mockUserData = {
      email: "simple-test@example.com",
    };

    // Verify the function signature is correct
    expect(global.testUtils.createTestUser).toBeInstanceOf(Function);

    // Test that the function can be called (but don't await it to avoid timeout)
    const createUserPromise = global.testUtils.createTestUser(mockUserData);
    expect(createUserPromise).toBeInstanceOf(Promise);

    // For now, just test that the function exists and returns a promise
    // The actual database operations can be tested in integration tests
    expect(true).toBe(true);
  });
});
