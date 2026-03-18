export async function api<T>(url: string, options: RequestInit = {}, adminKey?: string | null): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (adminKey) headers["x-admin-key"] = adminKey;
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || "Request failed");
  }
  return res.json();
}
