const passport = require("passport");
const oauthService = require("../services/oauthService");
const asyncHandler = require("../utils/asyncHandler");
const oauthProviders = require("../utils/oauthProviders");

const googleAuth = passport.authenticate("google", {
  scope: oauthProviders.google.scope,
});

const googleCallback = [
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  asyncHandler(async (req, res) => {
    // req.user = { user, profile }
    const response = await oauthService.handleOAuthLogin(
      "google",
      req.user.profile
    );
    // Extract the JWT token from the response
    const jwtToken = response.data && response.data.accessToken;
    const workspaceId = response.data && response.data.workspaceId;
    const workspaceName = response.data && response.data.workspaceName;

    if (jwtToken) {
      // Redirect to frontend with token and workspace info
      const redirectUrl = `http://localhost:5173/oauth-callback?token=${jwtToken}${
        workspaceId ? `&workspaceId=${workspaceId}` : ""
      }${
        workspaceName
          ? `&workspaceName=${encodeURIComponent(workspaceName)}`
          : ""
      }`;
      return res.redirect(redirectUrl);
    } else {
      // Fallback: return error if token is missing
      return res
        .status(500)
        .json({ error: "OAuth login failed: token missing" });
    }
  }),
];

module.exports = {
  googleAuth,
  googleCallback,
};
