const DEV_BASE_URL = "http://127.0.0.1:8000/";
const BASE_URL = import.meta.env.DEV
  ? (import.meta.env.VITE_API_BASE_URL || DEV_BASE_URL)
  : "/";
const TOKEN_KEY = "access_token";
const USER_KEY = "user";

export class ApiClient {
  baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/+$/, "") + "/";
  }

  private extractJsonObjects(input: string): { objects: string[]; remainder: string } {
    const objects: string[] = [];
    let start = -1;
    let depth = 0;
    let inString = false;
    let isEscaping = false;

    const s = input;
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];

      if (inString) {
        if (isEscaping) {
          isEscaping = false;
          continue;
        }
        if (ch === "\\") {
          isEscaping = true;
          continue;
        }
        if (ch === "\"") {
          inString = false;
        }
        continue;
      }

      if (ch === "\"") {
        inString = true;
        continue;
      }

      if (ch === "{") {
        if (depth === 0) start = i;
        depth++;
        continue;
      }

      if (ch === "}") {
        if (depth > 0) depth--;
        if (depth === 0 && start !== -1) {
          objects.push(s.slice(start, i + 1));
          start = -1;
        }
      }
    }

    if (start !== -1) {
      return { objects, remainder: s.slice(start) };
    }
    return { objects, remainder: "" };
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }
  cd
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  getUser(): ApiUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as ApiUser;
    } catch {
      return null;
    }
  }

  setUser(user: ApiUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  clearUser(): void {
    localStorage.removeItem(USER_KEY);
  }

  async fetch(path: string, options: RequestInit = {}): Promise<Response> {
    const url = this.baseUrl + path.replace(/^\/+/, "");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> | undefined),
    };
    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const resp = await fetch(url, { ...options, headers });
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(text || `HTTP ${resp.status}`);
    }
    return resp;
  }

  async login(email: string, password: string): Promise<{ access_token: string; token_type: string; user?: ApiUser }> {
    const resp = await this.fetch("api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const data = await resp.json();
    if (data && data.access_token) {
      this.setToken(data.access_token);
    }
    if (data && data.user) {
      this.setUser(data.user);
    }
    return data;
  }

  async forgotPassword(email: string): Promise<Response> {
    return this.fetch("api/v1/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(payload: { email: string; otp: string; new_password: string }): Promise<Response> {
    return this.fetch("api/v1/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async streamChat(
    payload: ChatStreamPayload | FormData,
    onDelta: (chunk: StreamDelta) => void
  ): Promise<void> {
    const url = this.baseUrl + "api/v1/conversations/chat/stream";
    const headers: Record<string, string> = {};
    const token = this.getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const body = payload instanceof FormData ? payload : JSON.stringify(payload);
    if (!(payload instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    const resp = await fetch(url, { method: "POST", headers, body });
    if (!resp.body) return;
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const normalized = buffer
        .split("\n")
        .map((l) => (l.startsWith("data:") ? l.slice(5).trim() : l))
        .join("");

      const { objects, remainder } = this.extractJsonObjects(normalized);
      buffer = remainder;

      for (const raw of objects) {
        if (!raw.trim()) continue;
        try {
          const obj = JSON.parse(raw);
          onDelta(obj);
        } catch (e) {
          void e;
        }
      }
    }
    const finalNormalized = buffer
      .split("\n")
      .map((l) => (l.startsWith("data:") ? l.slice(5).trim() : l))
      .join("");
    const { objects } = this.extractJsonObjects(finalNormalized);
    for (const raw of objects) {
      if (!raw.trim()) continue;
      try {
        const obj = JSON.parse(raw);
        onDelta(obj);
      } catch (e) {
        void e;
      }
    }
  }

  async uploadDocument(
    file: File,
    opts: { title?: string; description?: string; scope?: string; category?: string; tags?: string }
  ): Promise<Response> {
    const url = this.baseUrl + "api/v1/documents/upload";
    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", opts.title ?? "");
    fd.append("description", opts.description ?? "");
    fd.append("scope", opts.scope ?? "");
    fd.append("category", opts.category ?? "");
    fd.append("tags", opts.tags ?? "");

    const headers: Record<string, string> = {};
    const token = this.getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const resp = await fetch(url, { method: "POST", headers, body: fd });
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(text || `HTTP ${resp.status}`);
    }
    return resp;
  }

  async getDashboard(): Promise<DashboardResponse> {
    const resp = await this.fetch("api/v1/dashboard/");
    return resp.json();
  }
}

export const api = new ApiClient(BASE_URL);
export { TOKEN_KEY };

export type ApiUser = {
  id: string;
  email: string;
  full_name: string;
  org_id: string;
  role_id: string;
  status: string;
  avatar_url: string | null;
};

export type ChatStreamPayload = {
  query: string;
  project_id: string;
  framework: string;
  model: string;
  agent: string;
  attachment?: string;
};

export type StreamDelta = {
  response?: string;
  tool_calls?: unknown[];
  citations?: unknown[];
};

export type DashboardResponse = {
  org_name: string;
  plan_type: string;
  subscription_status: string;
  subscription_ends_at: string | null;
  quotas: Record<string, {
    used: number;
    max: number;
    unit: string;
    percentage: number;
  }>;
  stats: {
    total_conversations: number;
    total_messages: number;
    total_cost_usd: string;
    avg_response_time_ms: number | null;
    avg_satisfaction: number | null;
  };
  recent_activity: Array<{
    id: string;
    name: string;
    type: 'conversation' | 'project';
    updated_at: string;
    status: string;
  }>;
  metadata: Record<string, unknown>;
};
