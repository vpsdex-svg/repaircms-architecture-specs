const BASE = "/api/v1";

export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  error?: { code: string; message: string; details?: unknown };
};

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  let payload: ApiEnvelope<T> | null = null;
  try {
    payload = (await response.json()) as ApiEnvelope<T>;
  } catch {
    /* non-JSON response */
  }

  if (!response.ok || !payload?.success) {
    const message = payload?.error?.message ?? `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload.data;
}
