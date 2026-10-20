/**
 * CLIENT-SIDE API HELPER — typed access to the frozen API envelope
 * (PLAN.md / INTERFACE-TYPES.md): success `{ data }`, error `{ error, fields? }`.
 * Used by interactive client components (auth form, CRUD managers, heartbeat,
 * roster import). Server components use data.ts instead.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly fields?: Record<string, string>;
  constructor(message: string, status: number, fields?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      ...init,
      headers: init?.body instanceof FormData
        ? init?.headers
        : { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError("Cannot reach the server. Check your connection and try again.", 0);
  }
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    // non-JSON (e.g., proxy error page) — fall through to generic error
  }
  if (!res.ok) {
    const err = (body ?? {}) as { error?: string; fields?: Record<string, string> };
    throw new ApiError(err.error ?? `Request failed (${res.status}).`, res.status, err.fields);
  }
  return (body as { data: T }).data;
}
