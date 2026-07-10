import { jsonResponse } from '../../utils.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const adminPass = env.ADMIN_PASSWORD || "admin1234";
    const adminToken = env.ADMIN_TOKEN || "admin-secret-token-12345";

    if (body.username === "admin" && body.password === adminPass) {
      return jsonResponse({ token: adminToken });
    }
    return jsonResponse({ error: "invalid_credentials" }, 401);
  } catch (err) {
    return jsonResponse({ error: "server_error", detail: err.message }, 500);
  }
}
