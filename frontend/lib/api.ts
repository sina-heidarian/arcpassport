export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function apiUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? API_BASE_URL;
  return `${baseUrl}${path}`;
}

export function serverApiUrl(path: string) {
  const baseUrl =
    process.env.INTERNAL_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:8000";

  return `${baseUrl}${path}`;
}

export async function apiGet<T>(path: string): Promise<T> {
  const url = apiUrl(path);
  const response = await fetch(url);

  if (!response.ok) {
    const body = await response.text();
    console.error("API GET failed", { url, status: response.status, body });
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const url = apiUrl(path);
  const response = await fetch(url, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const responseBody = await response.text();
    console.error("API POST failed", {
      url,
      status: response.status,
      body: responseBody,
    });
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const url = apiUrl(path);
  const response = await fetch(url, {
    method: "PATCH",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const responseBody = await response.text();
    console.error("API PATCH failed", {
      url,
      status: response.status,
      body: responseBody,
    });
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
