const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export function resolveMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE_URL}${path}`;
}

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, body: unknown) {
    super(typeof body === "object" && body && "detail" in body ? String((body as { detail: unknown }).detail) : `So'rov xatosi (${status})`);
    this.status = status;
    this.body = body;
  }
}

async function refreshSession(): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/api/auth/refresh/`, {
    method: "POST",
    credentials: "include",
  });
  return res.ok;
}

/** Authenticated fetch: the JWT lives in an httpOnly cookie the browser sends
 * automatically. Retries once after a silent refresh on 401, and parses JSON. */
export async function apiFetch<T>(
  path: string,
  options: { method?: string; body?: BodyInit; isForm?: boolean; auth?: boolean } = {}
): Promise<T> {
  const { method = "GET", body, isForm = false, auth = true } = options;

  const doFetch = () => {
    const headers: Record<string, string> = {};
    if (!isForm && body) headers["Content-Type"] = "application/json";

    return fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body,
      credentials: auth ? "include" : "same-origin",
    });
  };

  let res = await doFetch();

  if (res.status === 401 && auth) {
    const refreshed = await refreshSession();
    if (refreshed) res = await doFetch();
  }

  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json") ? await res.json() : undefined;

  if (!res.ok) throw new ApiError(res.status, data);
  return data as T;
}
