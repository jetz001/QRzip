import { jsonResponse, checkAuth } from '../../../../utils.js';

export async function onRequestPost(context) {
  const { request, env, params } = context;
  if (!checkAuth(request, env)) return jsonResponse({ error: "unauthorized" }, 401);
  const memberId = params.id;
  const { results } = await env.DB.prepare("SELECT * FROM members WHERE id = ?").bind(memberId).all();
  if (results.length === 0) return jsonResponse({ error: "not_found" }, 404);
  
  const newBanStatus = results[0].banned ? 0 : 1;
  await env.DB.prepare("UPDATE members SET banned = ? WHERE id = ?").bind(newBanStatus, memberId).run();
  return jsonResponse({ ok: true, banned: newBanStatus });
}
