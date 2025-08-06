describe("Simple Test", () => {
  it("should pass basic test", () => {
    expect(1 + 1).toBe(2);
  });

  it("should have access to global test utilities", () => {
    expect(global.testUtils).toBeDefined();
    expect(global.testPrisma).toBeDefined();
  });

  it("should be able to create test user", async () => {
    const user = await global.testUtils.createTestUser({
      email: "simple-test@example.com",
    });

    expect(user).toBeDefined();
    expect(user.email).toBe("simple-test@example.com");
    expect(user.workspace).toBeDefined();
  });
});
