import { jsonResponse } from '../../utils.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const memberId = url.searchParams.get("memberId");
  if (!memberId) return jsonResponse({ error: "missing_memberId" }, 400);

  const { results } = await env.DB.prepare("SELECT * FROM refs WHERE member_id = ? ORDER BY created_at DESC").bind(memberId).all();
  return jsonResponse({ items: results });
}
