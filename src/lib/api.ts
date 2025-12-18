const BASE_URL = "http://127.0.0.1:8001/";
const TOKEN_KEY = "access_token";
const USER_KEY = "user";

export class ApiClient {
  baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/+$/, "") + "/";
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

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

  async streamChat(
    payload: ChatStreamPayload,
    onDelta: (chunk: StreamDelta) => void
  ): Promise<void> {
    const url = this.baseUrl + "api/v1/conversations/chat/stream";
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const token = this.getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const resp = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload) });
    if (!resp.body) return;
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const obj = JSON.parse(line);
          onDelta(obj);
        } catch (e) {
          void e;
        }
      }
    }
    if (buffer.trim()) {
      try {
        const obj = JSON.parse(buffer);
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
    if (opts?.title !== undefined) fd.append("title", opts.title ?? "");
    if (opts?.description !== undefined) fd.append("description", opts.description ?? "");
    if (opts?.scope !== undefined) fd.append("scope", opts.scope ?? "");
    if (opts?.category !== undefined) fd.append("category", opts.category ?? "");
    if (opts?.tags !== undefined) fd.append("tags", opts.tags ?? "");

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
