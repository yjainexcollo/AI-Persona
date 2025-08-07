/**
 * Test script for Chat Session endpoints
 * Run this after starting the server to test the endpoints
 */

const axios = require("axios");

const BASE_URL = "http://localhost:3000";
const TEST_TOKEN = "your-test-token-here"; // You'll need to get this from login

async function testChatSessions() {
  const headers = {
    Authorization: `Bearer ${TEST_TOKEN}`,
    "Content-Type": "application/json",
  };

  try {
    console.log("🧪 Testing Chat Session Endpoints...\n");

    // 1. Test GET /api/chat-sessions
    console.log("1. Testing GET /api/chat-sessions");
    try {
      const listResponse = await axios.get(`${BASE_URL}/api/chat-sessions`, {
        headers,
      });
      console.log("✅ List sessions:", listResponse.data);
      console.log("");
    } catch (error) {
      console.log(
        "❌ List sessions failed:",
        error.response?.data || error.message
      );
    }

    // 2. Test GET /api/chat-sessions/:sessionId (if sessions exist)
    try {
      const listResponse = await axios.get(`${BASE_URL}/api/chat-sessions`, {
        headers,
      });
      if (listResponse.data.data && listResponse.data.data.length > 0) {
        const sessionId = listResponse.data.data[0].sessionId;
        console.log(`2. Testing GET /api/chat-sessions/${sessionId}`);
        const getResponse = await axios.get(
          `${BASE_URL}/api/chat-sessions/${sessionId}`,
          { headers }
        );
        console.log("✅ Get session:", getResponse.data);
        console.log("");

        // 3. Test DELETE /api/chat-sessions/:sessionId
        console.log(`3. Testing DELETE /api/chat-sessions/${sessionId}`);
        const deleteResponse = await axios.delete(
          `${BASE_URL}/api/chat-sessions/${sessionId}`,
          { headers }
        );
        console.log("✅ Delete session:", deleteResponse.data);
        console.log("");
      } else {
        console.log("⚠️  No sessions found to test GET and DELETE endpoints");
      }
    } catch (error) {
      console.log(
        "❌ Get/Delete session failed:",
        error.response?.data || error.message
      );
    }

    console.log("🎉 All tests completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

// Instructions for testing
console.log("📋 Instructions:");
console.log("1. Start the server: npm start");
console.log("2. Get a valid JWT token by logging in");
console.log("3. Update TEST_TOKEN in this file");
console.log("4. Run: node test-chat-sessions.js");
console.log("");

testChatSessions();
