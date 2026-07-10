import { jsonResponse, checkAuth } from '../../utils.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!checkAuth(request, env)) return jsonResponse({ error: "unauthorized" }, 401);
  const { results } = await env.DB.prepare("SELECT * FROM members ORDER BY created_at DESC LIMIT 100").all();
  return jsonResponse({ items: results });
}
