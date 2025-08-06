const request = require("supertest");
const app = require("../../../src/app");

describe("User Registration Workflow", () => {
  it("should complete full user registration workflow", async () => {
    const uniqueEmail = `workflow-${Date.now()}@example.com`;

    // Step 1: Register user
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({
        email: uniqueEmail,
        password: "TestPassword123!",
        name: "Workflow User",
      })
      .expect(201);

    const { user, workspace } = registerResponse.body.data;
    expect(user.status).toBe("PENDING_VERIFY");

    // Step 2: Get verification token from database
    const verification = await global.testPrisma.emailVerification.findFirst({
      where: { userId: user.id },
    });

    // Step 3: Verify email
    const verifyResponse = await request(app)
      .get(`/api/auth/verify-email?token=${verification.token}`)
      .expect(200);

    expect(verifyResponse.body.status).toBe("success");

    // Step 4: Login with verified account
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: uniqueEmail,
        password: "TestPassword123!",
      })
      .expect(200);

    const { accessToken } = loginResponse.body.data;

    // Step 5: Access protected endpoints
    const profileResponse = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(profileResponse.body.data.user.email).toBe(uniqueEmail);

    // Step 6: Update profile
    const updateResponse = await request(app)
      .put("/api/users/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "Updated Workflow User",
        timezone: "UTC",
        locale: "en",
      })
      .expect(200);

    expect(updateResponse.body.data.user.name).toBe("Updated Workflow User");

    // Step 7: Access workspace
    const workspaceResponse = await request(app)
      .get(`/api/workspaces/${workspace.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(workspaceResponse.body.data.workspace.id).toBe(workspace.id);
  });

  it("should handle password reset workflow", async () => {
    const uniqueEmail = `reset-${Date.now()}@example.com`;

    // Step 1: Create verified user
    const user = await global.testUtils.createTestUser({
      email: uniqueEmail,
      status: "ACTIVE",
      emailVerified: true,
    });

    // Step 2: Request password reset
    const resetRequestResponse = await request(app)
      .post("/api/auth/request-password-reset")
      .send({
        email: uniqueEmail,
      })
      .expect(200);

    expect(resetRequestResponse.body.status).toBe("success");

    // Step 3: Get reset token from database
    const resetToken = await global.testPrisma.passwordResetToken.findFirst({
      where: { userId: user.id },
    });

    // Step 4: Reset password
    const resetResponse = await request(app)
      .post("/api/auth/reset-password")
      .send({
        token: resetToken.token,
        newPassword: "NewPassword123!",
      })
      .expect(200);

    expect(resetResponse.body.status).toBe("success");

    // Step 5: Login with new password
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: uniqueEmail,
        password: "NewPassword123!",
      })
      .expect(200);

    expect(loginResponse.body.data.accessToken).toBeDefined();
  });
});
