/**
 * Local storage helpers with typed accessors
 */

export type StoredUser = {
  name?: string;
  role?: string;
  avatar?: string;
  [key: string]: unknown;
} | null;

const KEYS = {
  token: "token",
  refreshToken: "refreshToken",
  user: "user",
  workspaceId: "workspaceId",
  workspaceName: "workspaceName",
} as const;

function getString(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setString(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function remove(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

function getJson<T>(key: string): T | null {
  const raw = getString(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export const storage = {
  getToken(): string | null {
    return getString(KEYS.token);
  },
  setToken(token: string) {
    setString(KEYS.token, token);
  },
  removeToken() {
    remove(KEYS.token);
  },
  getRefreshToken(): string | null {
    return getString(KEYS.refreshToken);
  },
  setRefreshToken(token: string) {
    setString(KEYS.refreshToken, token);
  },
  removeRefreshToken() {
    remove(KEYS.refreshToken);
  },
  getUser(): StoredUser {
    return getJson(KEYS.user);
  },
  setUser(user: unknown) {
    setString(KEYS.user, JSON.stringify(user ?? {}));
  },
  removeUser() {
    remove(KEYS.user);
  },
  getWorkspaceId(): string | null {
    return getString(KEYS.workspaceId);
  },
  setWorkspaceId(id: string) {
    setString(KEYS.workspaceId, id);
  },
  getWorkspaceName(): string | null {
    return getString(KEYS.workspaceName);
  },
  setWorkspaceName(name: string) {
    setString(KEYS.workspaceName, name);
  },
  clearAll() {
    try {
      window.localStorage.clear();
    } catch {
      // ignore
    }
  },
};
