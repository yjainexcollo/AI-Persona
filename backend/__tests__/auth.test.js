/**
 * Auth API Tests
 * Tests for authentication endpoints
 */

const request = require("supertest");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Create a simple Express app for testing
const express = require("express");
const app = express();
app.use(express.json());

// Import routes
const authRoutes = require("../src/routes/authRoutes");
app.use("/api/auth", authRoutes);

describe("Auth API", () => {
  let testUser;
  let testWorkspace;

  beforeAll(async () => {
    // Create test workspace
    testWorkspace = await prisma.workspace.create({
      data: {
        name: "test-workspace",
        domain: "test.com",
      },
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.user.deleteMany({ where: { workspaceId: testWorkspace.id } });
    await prisma.workspace.delete({ where: { id: testWorkspace.id } });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean test users
    await prisma.user.deleteMany({ where: { workspaceId: testWorkspace.id } });
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "test@test.com",
          password: "UniquePass123!@#$",
          name: "Test User",
        })
        .expect(201);

      expect(response.body.status).toBe("success");
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe("test@test.com");
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it("should reject weak passwords", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "test@test.com",
          password: "weak",
          name: "Test User",
        })
        .expect(400);

      expect(response.body.message).toContain("Password");
    });

    it("should reject breached passwords", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "test@test.com",
          password: "password123",
          name: "Test User",
        })
        .expect(400);

      expect(response.body.message).toContain("breached");
    });

    it("should reject duplicate emails", async () => {
      // First registration
      await request(app).post("/api/auth/register").send({
        email: "duplicate@test.com",
        password: "UniquePass123!@#$",
        name: "Test User",
      });

      // Second registration with same email
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "duplicate@test.com",
          password: "UniquePass123!@#$",
          name: "Test User 2",
        })
        .expect(409);

      expect(response.body.message).toContain("already registered");
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      // Create a test user
      testUser = await prisma.user.create({
        data: {
          email: "test@test.com",
          passwordHash: "$2b$10$test.hash.for.testing",
          name: "Test User",
          status: "ACTIVE",
          emailVerified: true,
          workspaceId: testWorkspace.id,
          role: "MEMBER",
        },
      });
    });

    it("should login successfully with valid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@test.com",
          password: "UniquePass123!@#$",
        })
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it("should reject invalid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@test.com",
          password: "wrongpassword",
        })
        .expect(401);

      expect(response.body.message).toContain("Invalid credentials");
    });

    it("should reject unverified users", async () => {
      // Create unverified user
      await prisma.user.create({
        data: {
          email: "unverified@test.com",
          passwordHash: "$2b$10$test.hash.for.testing",
          name: "Unverified User",
          status: "PENDING_VERIFY",
          emailVerified: false,
          workspaceId: testWorkspace.id,
          role: "MEMBER",
        },
      });

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "unverified@test.com",
          password: "StrongPass123!",
        })
        .expect(403);

      expect(response.body.message).toContain("Please verify your email");
    });
  });

  describe("GET /api/auth/.well-known/jwks.json", () => {
    it("should return JWKS", async () => {
      const response = await request(app)
        .get("/api/auth/.well-known/jwks.json")
        .expect(200);

      expect(response.body.keys).toBeDefined();
      expect(Array.isArray(response.body.keys)).toBe(true);
      expect(response.body.keys.length).toBeGreaterThan(0);
    });
  });

  describe("POST /api/auth/refresh", () => {
    let refreshToken;

    beforeEach(async () => {
      // Create user and get refresh token
      const loginResponse = await request(app).post("/api/auth/register").send({
        email: "test@test.com",
        password: "StrongPass123!",
        name: "Test User",
      });

      refreshToken = loginResponse.body.data.refreshToken;
    });

    it("should refresh tokens successfully", async () => {
      const response = await request(app)
        .post("/api/auth/refresh")
        .send({
          refreshToken: refreshToken,
        })
        .expect(200);

      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
      expect(response.body.data.accessToken).not.toBe(refreshToken);
    });

    it("should reject invalid refresh token", async () => {
      const response = await request(app)
        .post("/api/auth/refresh")
        .send({
          refreshToken: "invalid.token.here",
        })
        .expect(401);

      expect(response.body.message).toContain(
        "Invalid or expired refresh token"
      );
    });
  });

  describe("Rate Limiting", () => {
    it("should rate limit registration attempts", async () => {
      const requests = Array(6)
        .fill()
        .map(() =>
          request(app)
            .post("/api/auth/register")
            .send({
              email: `test${Date.now()}@test.com`,
              password: "StrongPass123!",
              name: "Test User",
            })
        );

      const responses = await Promise.all(requests);
      const lastResponse = responses[responses.length - 1];

      expect(lastResponse.status).toBe(429);
      expect(lastResponse.body.message).toContain(
        "Too many registration attempts"
      );
    });

    it("should rate limit login attempts", async () => {
      const requests = Array(11)
        .fill()
        .map(() =>
          request(app).post("/api/auth/login").send({
            email: "test@test.com",
            password: "wrongpassword",
          })
        );

      const responses = await Promise.all(requests);
      const lastResponse = responses[responses.length - 1];

      expect(lastResponse.status).toBe(429);
      expect(lastResponse.body.message).toContain("Too many login attempts");
    });
  });
});
 