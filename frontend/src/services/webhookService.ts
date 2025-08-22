/**
 * Webhook Service
 *
 * Handles communication with external AI workflows via webhooks.
 * Integrates with n8n persona workflows for AI-powered conversations.
 *
 * Features:
 * - Session management for conversation continuity
 * - File attachment support (images and documents)
 * - Error handling and retry logic
 * - Detailed logging for debugging
 * - Connection testing capabilities
 * - Persona traits update webhook integration
 */

// Webhook service for integrating with n8n persona workflows
const WEBHOOK_URL =
  "https://n8n-excollo.azurewebsites.net/webhook/e17df12a-2bfc-4270-8756-0c20442a4b9f";

// New webhook endpoint for traits updates
const TRAITS_WEBHOOK_URL =
  "https://n8n-excollo.azurewebsites.net/webhook-test/traits";

import { getSessionId, fetchWithAuth } from "../utils/session";

/**
 * Webhook Message Interface
 *
 * Defines the structure of messages sent to the webhook service.
 * Includes conversation context, user information, and file attachments.
 */
export interface WebhookMessage {
  /** The user's message content */
  message: string;
  /** Unique identifier for the persona */
  persona_id: string;
  /** Display name of the persona */
  persona_name: string;
  /** Optional user identifier */
  user_id?: string;
  /** Session ID for conversation continuity */
  session_id: string;
  /** ISO timestamp of the message */
  timestamp: string;
  /** Optional URL of attached file */
  fileUrl?: string;
  /** Optional MIME type of attached file */
  fileType?: string;
}

/**
 * Webhook Response Interface
 *
 * Defines the structure of responses received from the webhook service.
 */
export interface WebhookResponse {
  /** The AI-generated response text */
  response: string;
  /** Status of the webhook operation */
  status: string;
}

/**
 * Generic Response Interface
 *
 * Flexible interface for handling various response formats from webhook services.
 */
interface GenericResponse {
  [key: string]: unknown;
}

/**
 * Persona Traits Update Interface
 *
 * Defines the structure for updating persona traits via webhook.
 */
export interface PersonaTraitsUpdate {
  /** The exact name of the persona to update */
  personaName: string;
  /** The metadata containing traits and other persona information */
  metadata: {
    about: string;
    coreExpertise: string[];
    communicationStyle: string;
    traits: string[];
    painPoints: string[];
    keyResponsibilities: string[];
  };
}

/**
 * Send message to webhook service
 *
 * Sends a message to the AI workflow webhook with session management
 * and file attachment support.
 *
 * @param message - The user's message content
 * @param personaId - Unique identifier for the persona
 * @param personaName - Display name of the persona
 * @param fileUrl - Optional URL of attached file
 * @param fileType - Optional MIME type of attached file
 * @returns Promise that resolves to the AI response text
 * @throws Error if webhook request fails
 */
export const sendToWebhook = async (
  message: string,
  personaId: string,
  personaName: string,
  fileUrl?: string,
  fileType?: string
): Promise<string> => {
  try {
    // Get or create session ID for this persona
    const sessionId = getSessionId(personaId);

    // Enhance message with file information if present
    let enhancedMessage = message;
    if (fileUrl) {
      const fileInfo =
        fileType && fileType.startsWith("image/")
          ? `[IMAGE ATTACHED: ${fileUrl}]`
          : `[FILE ATTACHED: ${fileUrl}]`;
      enhancedMessage = fileInfo + (message ? ` ${message}` : "");
    }

    // Prepare the webhook payload
    const payload: WebhookMessage = {
      message: enhancedMessage,
      persona_id: personaId,
      persona_name: personaName,
      user_id: "current_user", // You can extend this to get actual user ID
      session_id: sessionId,
      timestamp: new Date().toISOString(),
      ...(fileUrl && { fileUrl }),
      ...(fileType && { fileType }),
    };

    // Log webhook request details for debugging
    console.log("🚀 Sending to webhook:", WEBHOOK_URL);
    console.log("👤 Persona:", personaName, `(ID: ${personaId})`);
    console.log("🔑 Session ID:", sessionId);
    if (fileUrl) {
      console.log("📎 File attachment:", fileUrl, `(Type: ${fileType})`);
      console.log("💬 Enhanced message:", enhancedMessage);
    }
    console.log("📦 Payload:", JSON.stringify(payload, null, 2));

    // Send POST request to webhook
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("📡 Response status:", response.status);
    console.log(
      "📡 Response headers:",
      Object.fromEntries(Array.from(response.headers.entries()))
    );

    // Handle error responses
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Webhook error response:", errorText);

      // Handle specific n8n webhook errors
      if (response.status === 404 && errorText.includes("not registered")) {
        return "🔧 The AI workflow is not currently active. Please activate the n8n workflow and try again.";
      }

      throw new Error(
        `Webhook request failed: ${response.status} - ${errorText}`
      );
    }

    const responseText = await response.text();
    console.log("✅ Raw response:", responseText);

    // Try to parse as JSON
    let data: WebhookResponse | GenericResponse;
    try {
      data = JSON.parse(responseText);
      console.log("✅ Parsed response:", data);
    } catch {
      console.log("⚠️ Response is not JSON, using as plain text");
      return responseText || "I've processed your payment query.";
    }

    const aiResponse =
      (data as WebhookResponse).response ||
      (data as GenericResponse).output ||
      (data as GenericResponse).message ||
      responseText ||
      "I've processed your payment query.";

    // Clean up the response text
    return String(aiResponse)
      .replace(/^"(.*)"$/, "$1")
      .trim();
  } catch (error) {
    console.error("❌ Error calling payment webhook:", error);
    if (error instanceof Error) {
      console.error("❌ Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }

    // Fallback response for AI queries
    return "I'm experiencing some technical difficulties accessing the AI systems. Please try again in a moment, or contact support if the issue persists.";
  }
};

/**
 * Update persona traits via webhook
 *
 * Sends persona traits update to the n8n webhook endpoint.
 * This function is typically called by workspace admins to update
 * persona traits based on AI analysis.
 *
 * @param traitsUpdate - The persona traits update data
 * @param authToken - JWT authentication token
 * @returns Promise that resolves to the update result
 * @throws Error if webhook request fails
 */
/**
 * Update persona traits via external n8n webhook
 *
 * Sends persona traits update to the n8n webhook endpoint.
 * This function is typically called by workspace admins to update
 * persona traits based on AI analysis.
 *
 * @param traitsUpdate - The persona traits update data
 * @param authToken - JWT authentication token
 * @returns Promise that resolves to the update result
 * @throws Error if webhook request fails
 */
export const updatePersonaTraitsViaN8n = async (
  traitsUpdate: PersonaTraitsUpdate,
  authToken: string
): Promise<any> => {
  try {
    console.log(
      "🔄 Updating persona traits via n8n webhook:",
      traitsUpdate.personaName
    );
    console.log("📦 Payload:", JSON.stringify(traitsUpdate, null, 2));

    const response = await fetch(TRAITS_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(traitsUpdate),
    });

    console.log("📡 Traits update response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Traits update webhook error:", errorText);
      throw new Error(
        `Traits update failed: ${response.status} - ${errorText}`
      );
    }

    const result = await response.json();
    console.log("✅ Traits update successful:", result);

    return result;
  } catch (error) {
    console.error("❌ Error updating persona traits:", error);
    throw error;
  }
};

/**
 * Update persona traits via backend API
 *
 * Calls POST /api/webhooks/traits to update persona traits in the database.
 * This is the primary method for updating persona traits.
 */
export const updatePersonaTraitsViaBackend = async (
  traitsUpdate: PersonaTraitsUpdate,
  authToken: string
): Promise<any> => {
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  console.log("🌐 Backend URL:", backendUrl);
  console.log(
    "🚀 Making fetch request to:",
    `${backendUrl}/api/webhooks/traits`
  );

  const response = await fetchWithAuth(`${backendUrl}/api/webhooks/traits`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(traitsUpdate),
  });

  console.log("📡 Backend API response status:", response.status);
  console.log(
    "📡 Backend API response headers:",
    Object.fromEntries(Array.from(response.headers.entries()))
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Backend API error:", errorText);
    throw new Error(
      `Backend API update failed: ${response.status} - ${errorText}`
    );
  }

  const result = await response.json();
  console.log("✅ Backend API update successful:", result);

  return result;
};

/**
 * Forward persona traits to n8n via backend and persist returned metadata
 *
 * Calls POST /api/webhooks/traits/forward. Backend will:
 * - Resolve the n8n webhook URL (env or persona.webhookUrl)
 * - POST the payload to n8n
 * - Expect { metadata } back
 * - Update the persona in DB and return updated record
 */
export const forwardPersonaTraitsViaBackend = async (
  traitsUpdate: PersonaTraitsUpdate,
  authToken: string
): Promise<any> => {
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  const res = await fetchWithAuth(`${backendUrl}/api/webhooks/traits/forward`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(traitsUpdate),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Forward failed: ${res.status} - ${text}`);
  }

  return res.json();
};

export const isWebhookPersona = (personaId: string): boolean => {
  // Ethan Carter (Head of Payment) & David Lee (Product Manager)
  return false;
};

// Test function to check if webhook is active
export const testWebhookConnection = async (
  personaId: string
): Promise<boolean> => {
  try {
    // Get or create session ID
    const sessionId = getSessionId(personaId);

    const response = await fetchWithAuth(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        test: "connection_check",
        session_id: sessionId,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Webhook connection test failed:", error);
    return false;
  }
};

/**
 * Test traits update webhook connection
 *
 * Tests the connection to our backend webhook API endpoint.
 *
 * @param authToken - JWT authentication token
 * @returns Promise that resolves to connection status
 */
export const testTraitsWebhookConnection = async (
  authToken: string
): Promise<boolean> => {
  try {
    // Get backend URL from environment or use default
    const backendUrl =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

    const response = await fetch(`${backendUrl}/api/webhooks/health`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error("Backend webhook API connection test failed:", error);
    return false;
  }
};
