const API_URL = import.meta.env.VITE_API_URL !== undefined 
  ? import.meta.env.VITE_API_URL 
  : (import.meta.env.PROD ? "" : "http://localhost:8000");

const TOKEN_KEY = "sprnt_auth_token";

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // ignore
  }
}

async function request(path, options = {}) {
  const token = getStoredToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = "Request failed";
    try {
      const json = await response.json();
      errorDetail = json.detail || json.message || errorDetail;
    } catch {
      const text = await response.text();
      if (text) errorDetail = text;
    }
    throw new Error(errorDetail);
  }

  return response.status === 204 ? null : response.json();
}

export const api = {
  // Auth
  async register(username, password) {
    const res = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    if (res?.token) {
      setStoredToken(res.token);
    }
    return res;
  },

  async login(username, password) {
    const res = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    if (res?.token) {
      setStoredToken(res.token);
    }
    return res;
  },

  async getMe() {
    return request("/auth/me");
  },

  async logout() {
    try {
      await request("/auth/logout", { method: "POST" });
    } finally {
      setStoredToken(null);
    }
  },

  // Sessions
  async createSession(title, description = "", planningMode = "ai", durationMinutes = 30, tasks = null) {
    const body = {
      title,
      description,
      planning_mode: planningMode,
      duration_minutes: durationMinutes,
    };
    if (tasks && tasks.length > 0) {
      body.tasks = tasks;
    }
    return request("/sessions", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async getSessions() {
    return request("/sessions");
  },

  async getSession(sessionId) {
    return request(`/sessions/${sessionId}`);
  },

  async deleteSession(sessionId) {
    return request(`/sessions/${sessionId}`, {
      method: "DELETE",
    });
  },

  // Tasks
  async completeTask(taskId, userResponse) {
    return request(`/tasks/${taskId}/complete`, {
      method: "POST",
      body: JSON.stringify({ user_response: userResponse }),
    });
  },

  async endSession(sessionId) {
    return request(`/sessions/${sessionId}/end`, {
      method: "POST",
      body: JSON.stringify({}),
    });
  },

  async getProgress(sessionId) {
    return request(`/sessions/${sessionId}/progress`);
  },
};
