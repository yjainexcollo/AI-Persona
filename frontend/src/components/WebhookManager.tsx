import React, { useState } from "react";
import {
  testTraitsWebhookConnection,
  forwardPersonaTraitsViaBackend,
} from "../services/webhookService";
import type { PersonaTraitsUpdate } from "../services/webhookService";
import { useAuth } from "../hooks/useAuth";

interface WebhookManagerProps {
  personaName: string;
  onTraitsUpdated?: () => void;
}

const WebhookManager: React.FC<WebhookManagerProps> = ({
  personaName,
  onTraitsUpdated,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(
    null
  );

  // You'll need to implement this hook or use your existing auth context
  const { getAuthToken } = useAuth();

  const testConnection = async () => {
    try {
      setIsLoading(true);
      setError("");
      setStatus("Testing connection...");

      const token = await getAuthToken();
      const isConnected = await testTraitsWebhookConnection(token);

      setConnectionStatus(isConnected);
      setStatus(isConnected ? "Connection successful!" : "Connection failed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection test failed");
      setConnectionStatus(false);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerTraitsUpdate = async () => {
    try {
      setIsLoading(true);
      setError("");
      setStatus("Triggering traits update...");

      console.log("🔍 Starting traits update process...");

      const token = await getAuthToken();
      console.log("🔑 Got auth token:", token ? "Token exists" : "No token");

      // This is a sample payload - in real usage, you might get this from n8n
      const sampleTraitsUpdate: PersonaTraitsUpdate = {
        personaName: personaName,
        metadata: {
          about: "Updated persona description based on AI analysis",
          coreExpertise: [
            "Updated expertise area 1",
            "Updated expertise area 2",
            "Updated expertise area 3",
          ],
          communicationStyle: "Updated communication style description",
          traits: ["Updated trait 1", "Updated trait 2", "Updated trait 3"],
          painPoints: ["Updated pain point 1", "Updated pain point 2"],
          keyResponsibilities: [
            "Updated responsibility 1",
            "Updated responsibility 2",
          ],
        },
      };

      console.log("📦 Sample traits update payload:", sampleTraitsUpdate);
      console.log("🚀 Calling forwardPersonaTraitsViaBackend function...");
      // Always use the forward endpoint so backend hits n8n and persists data
      const result = await forwardPersonaTraitsViaBackend(
        sampleTraitsUpdate,
        token
      );

      console.log("✅ Traits update result:", result);
      setStatus("Traits update triggered successfully!");
      setError("");

      // Notify parent component that traits were updated
      if (onTraitsUpdated) {
        onTraitsUpdated();
      }
    } catch (err) {
      console.error("❌ Error in triggerTraitsUpdate:", err);
      setError(err instanceof Error ? err.message : "Traits update failed");
      setStatus("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mb-6">
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Status</span>
            {connectionStatus === true && (
              <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                <span className="mr-1 block h-1.5 w-1.5 rounded-full bg-green-600" />
                Connected
              </span>
            )}
            {connectionStatus === false && (
              <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                <span className="mr-1 block h-1.5 w-1.5 rounded-full bg-red-600" />
                Unreachable
              </span>
            )}
            {connectionStatus === null && (
              <span className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-600/10">
                <span className="mr-1 block h-1.5 w-1.5 rounded-full bg-gray-400" />
                Not tested
              </span>
            )}
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={triggerTraitsUpdate}
              disabled={isLoading || !personaName || connectionStatus === false}
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0a12 12 0 100 24v-4a8 8 0 01-8-8z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              )}
              Update persona traits
            </button>
          </div>

          {/* Alerts */}
          <div className="mt-4 space-y-2" aria-live="polite">
            {status && (
              <div className="flex items-start rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
                <span className="mr-2 mt-0.5 block h-2 w-2 rounded-full bg-blue-500" />
                <span>{status}</span>
              </div>
            )}
            {error && (
              <div className="flex items-start rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                <span className="mr-2 mt-0.5 block h-2 w-2 rounded-full bg-red-500" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WebhookManager;
