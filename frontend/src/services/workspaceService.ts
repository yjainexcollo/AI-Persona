import { fetchWithAuth } from "../utils/session";
import { env } from "../lib/config/env";

const backendUrl = env.BACKEND_URL;

export interface WorkspaceData {
  id: string;
  name: string;
  timezone: string;
  locale: string;
  domain: string;
  isActive: boolean;
  maxMembers: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceUpdateData {
  name?: string;
  timezone?: string;
  locale?: string;
}

/**
 * Get workspace details for the current user
 * @returns Promise<WorkspaceData>
 */
export const getWorkspaceDetails = async (): Promise<WorkspaceData> => {
  // First get user profile to get workspace ID
  const userRes = await fetchWithAuth(`${backendUrl}/api/users/me`);
  if (!userRes.ok) {
    throw new Error("Failed to fetch user profile");
  }

  const userData = await userRes.json();
  const workspaceId = userData.data.user.workspaceId;

  if (!workspaceId) {
    throw new Error("User is not assigned to any workspace");
  }

  // Get workspace details
  const workspaceRes = await fetchWithAuth(
    `${backendUrl}/api/workspaces/${workspaceId}`
  );
  if (!workspaceRes.ok) {
    const errorData = await workspaceRes.json();
    throw new Error(errorData.message || "Failed to fetch workspace details");
  }

  const workspaceData = await workspaceRes.json();
  return workspaceData.data.workspace;
};

/**
 * Update workspace settings
 * @param workspaceId - The workspace ID
 * @param updateData - The data to update
 * @returns Promise<WorkspaceData>
 */
export const updateWorkspace = async (
  workspaceId: string,
  updateData: WorkspaceUpdateData
): Promise<WorkspaceData> => {
  const res = await fetchWithAuth(
    `${backendUrl}/api/workspaces/${workspaceId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to update workspace");
  }

  const result = await res.json();
  return result.data.workspace;
};

export interface WorkspaceMember {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  lastLoginAt: string;
  createdAt: string;
}

export interface WorkspaceMembersResponse {
  status: string;
  data: WorkspaceMember[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

/**
 * Get workspace members (Admin only)
 * @param workspaceId - The workspace ID
 * @param options - Query options for filtering and pagination
 * @returns Promise<WorkspaceMembersResponse>
 */
export const getWorkspaceMembers = async (
  workspaceId: string,
  options: {
    search?: string;
    status?: string;
    role?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<WorkspaceMembersResponse> => {
  const queryParams = new URLSearchParams();

  if (options.search) queryParams.append("search", options.search);
  if (options.status) {
    const normalizedStatus = options.status.toUpperCase();
    queryParams.append("status", normalizedStatus);
  }
  if (options.role) {
    const roleRaw = options.role.toUpperCase();
    const normalizedRole = roleRaw === "MEMBERS" ? "MEMBER" : roleRaw; // tolerate alias
    queryParams.append("role", normalizedRole);
  }
  if (options.page) queryParams.append("page", options.page.toString());
  if (options.limit) queryParams.append("limit", options.limit.toString());

  const res = await fetchWithAuth(
    `${backendUrl}/api/workspaces/${workspaceId}/members?${queryParams.toString()}`
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to fetch workspace members");
  }

  return await res.json();
};

/**
 * Change member status (Admin only)
 * @param workspaceId - The workspace ID
 * @param memberId - The member ID
 * @param status - The new status
 * @returns Promise<{ status: string; message: string; data?: any }>
 */
export const changeMemberStatus = async (
  workspaceId: string,
  memberId: string,
  status: string
): Promise<{ status: string; message: string; data?: any }> => {
  const res = await fetchWithAuth(
    `${backendUrl}/api/workspaces/${workspaceId}/members/${memberId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    }
  );

  if (!res.ok) {
    let errorMessage = "Failed to change member status";

    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorMessage;
    } catch (parseError) {
      // If JSON parsing fails, use the status text
      errorMessage = res.statusText || errorMessage;
    }

    // Handle specific backend errors for admin deactivation
    if (
      res.status === 500 &&
      errorMessage.includes("Cannot deactivate the only admin")
    ) {
      throw new Error(
        "Cannot deactivate the only admin in the workspace. At least one admin must remain active."
      );
    }

    if (
      res.status === 500 &&
      errorMessage.includes("Cannot deactivate admin")
    ) {
      throw new Error(
        "Cannot deactivate an admin. Please change their role to Member first."
      );
    }

    throw new Error(errorMessage);
  }

  return await res.json();
};

/**
 * Change member role (Admin only)
 * @param workspaceId - The workspace ID
 * @param memberId - The member ID
 * @param role - The new role
 * @returns Promise<{ status: string; message: string; data?: any }>
 */
export const changeMemberRole = async (
  workspaceId: string,
  memberId: string,
  role: string
): Promise<{ status: string; message: string; data?: any }> => {
  const res = await fetchWithAuth(
    `${backendUrl}/api/workspaces/${workspaceId}/members/${memberId}/role`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role }),
    }
  );

  if (!res.ok) {
    let errorMessage = "Failed to change member role";

    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorMessage;
    } catch (parseError) {
      // If JSON parsing fails, use the status text
      errorMessage = res.statusText || errorMessage;
    }

    // Handle specific backend error for last admin demotion
    if (
      res.status === 500 &&
      errorMessage.includes("Cannot demote the only admin")
    ) {
      throw new Error(
        "Cannot demote the only admin in the workspace. At least one admin must remain."
      );
    }

    throw new Error(errorMessage);
  }

  return await res.json();
};

/**
 * Remove member from workspace (Admin only)
 * @param workspaceId - The workspace ID
 * @param memberId - The member ID
 * @returns Promise<{ status: string; message: string }>
 */
export const removeMember = async (
  workspaceId: string,
  memberId: string
): Promise<{ status: string; message: string }> => {
  const res = await fetchWithAuth(
    `${backendUrl}/api/workspaces/${workspaceId}/members/${memberId}`,
    {
      method: "DELETE",
    }
  );

  if (!res.ok) {
    let errorMessage = "Failed to remove member";

    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorMessage;
    } catch (parseError) {
      // If JSON parsing fails, use the status text
      errorMessage = res.statusText || errorMessage;
    }

    // Handle specific backend errors for member removal
    if (
      res.status === 400 &&
      errorMessage.includes("Cannot remove the only admin")
    ) {
      throw new Error(
        "Cannot remove the only admin from the workspace. At least one admin must remain."
      );
    }

    if (res.status === 400 && errorMessage.includes("Cannot remove yourself")) {
      throw new Error(
        "You cannot remove yourself from the workspace. Please have another admin remove you."
      );
    }

    throw new Error(errorMessage);
  }

  return await res.json();
};

/**
 * Permanently delete member from workspace (Admin only)
 * @param workspaceId - The workspace ID
 * @param memberId - The member ID
 * @returns Promise<{ status: string; message: string }>
 */
export const deleteMemberPermanent = async (
  workspaceId: string,
  memberId: string
): Promise<{ status: string; message: string }> => {
  const res = await fetchWithAuth(
    `${backendUrl}/api/workspaces/${workspaceId}/members/${memberId}/permanent`,
    {
      method: "DELETE",
    }
  );

  if (!res.ok) {
    let errorMessage = "Failed to permanently remove member";

    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorMessage;
    } catch (parseError) {
      errorMessage = res.statusText || errorMessage;
    }

    if (
      res.status === 400 &&
      errorMessage.includes("Cannot remove the only admin")
    ) {
      throw new Error(
        "Cannot remove the only admin from the workspace. At least one admin must remain."
      );
    }

    throw new Error(errorMessage);
  }

  return await res.json();
};

/**
 * Request workspace deletion (Admin only)
 * @param workspaceId - The workspace ID
 * @param reason - Optional reason for deletion
 * @returns Promise<{ status: string; message: string }>
 */
export const requestWorkspaceDeletion = async (
  workspaceId: string,
  reason?: string
): Promise<{ status: string; message: string }> => {
  const res = await fetchWithAuth(
    `${backendUrl}/api/workspaces/${workspaceId}/delete`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason }),
    }
  );

  if (!res.ok) {
    let errorMessage = "Failed to request workspace deletion";

    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorMessage;
    } catch (parseError) {
      // If JSON parsing fails, use the status text
      errorMessage = res.statusText || errorMessage;
    }

    // Handle specific backend errors for workspace deletion
    if (res.status === 400 && errorMessage.includes("already been requested")) {
      throw new Error(
        "Workspace deletion has already been requested. The workspace will be deleted in 30 days."
      );
    }

    if (res.status === 403 && errorMessage.includes("Only workspace admins")) {
      throw new Error("Only workspace admins can request workspace deletion.");
    }

    throw new Error(errorMessage);
  }

  return await res.json();
};
