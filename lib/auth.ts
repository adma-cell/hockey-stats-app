// Simple numeric gate: must send 18 in x-admin-key to allow mutations.
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "18";

export function isAdmin(request: Request): boolean {
  const header = request.headers.get("x-admin-key") || "";
  return header === ADMIN_PASSWORD;
}

export function requireAdmin(request: Request) {
  if (!isAdmin(request)) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
}
