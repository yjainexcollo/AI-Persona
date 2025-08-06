const request = require("supertest");
const app = require("../../../src/app");

describe("Authentication Integration Tests", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new user and create workspace", async () => {
      const uniqueEmail = `newuser-${Date.now()}@example.com`;

      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: uniqueEmail,
          password: "TestPassword123!",
          name: "New User",
        })
        .expect(201);

      expect(response.body.status).toBe("success");
      expect(response.body.data.user.email).toBe(uniqueEmail);
      expect(response.body.data.user.status).toBe("PENDING_VERIFY");
      expect(response.body.data.workspace).toBeDefined();

      // Verify user was created in database
      const user = await global.testPrisma.user.findUnique({
        where: { email: uniqueEmail },
        include: { workspace: true },
      });

      expect(user).toBeDefined();
      expect(user.workspace).toBeDefined();
    });

    it("should validate email format", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "invalid-email",
          password: "TestPassword123!",
          name: "Test User",
        })
        .expect(400);

      expect(response.body.error.message).toContain("Invalid email format");
    });

    it("should validate password strength", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: `test-${Date.now()}@example.com`,
          password: "weak",
          name: "Test User",
        })
        .expect(400);

      expect(response.body.error.message).toContain("Password too weak");
    });

    it("should handle duplicate email", async () => {
      const existingEmail = `existing-${Date.now()}@example.com`;

      // Create existing user
      await global.testUtils.createTestUser({
        email: existingEmail,
      });

      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: existingEmail,
          password: "TestPassword123!",
          name: "Test User",
        })
        .expect(400);

      expect(response.body.error.message).toContain("Email already exists");
    });
  });

  describe("POST /api/auth/login", () => {
    let testUser;

    beforeEach(async () => {
      // Create test user
      testUser = await global.testUtils.createTestUser({
        email: `test-${Date.now()}@example.com`,
        status: "ACTIVE",
        emailVerified: true,
      });
    });

    it("should login successfully with valid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: "TestPassword123!",
        })
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
      expect(response.body.data.user.email).toBe(testUser.email);
    });

    it("should reject unverified users", async () => {
      const unverifiedUser = await global.testUtils.createTestUser({
        email: `unverified-${Date.now()}@example.com`,
        status: "PENDING_VERIFY",
        emailVerified: false,
      });

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: unverifiedUser.email,
          password: "TestPassword123!",
        })
        .expect(401);

      expect(response.body.error.message).toContain("Please verify your email");
    });
  });
});
