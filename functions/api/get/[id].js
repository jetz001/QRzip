import { jsonResponse } from '../../utils.js';

export async function onRequestGet(context) {
  const { env, params } = context;
  const rid = params.id;
  
  if (!rid) return jsonResponse({ error: "missing_id" }, 400);

  const { results } = await env.DB.prepare("SELECT * FROM refs WHERE id = ?").bind(rid).all();
  const row = results[0];

  if (!row) return jsonResponse({ error: "not_found" }, 404);

  return jsonResponse({
    id: row.id,
    text: row.text,
    payload: row.payload,
    mode: row.mode,
    memberId: row.member_id,
    createdAt: row.created_at,
  });
}
