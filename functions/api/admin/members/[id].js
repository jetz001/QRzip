import { jsonResponse, checkAuth } from '../../../utils.js';

export async function onRequestPut(context) {
  const { request, env, params } = context;
  if (!checkAuth(request, env)) return jsonResponse({ error: "unauthorized" }, 401);
  const memberId = params.id;
  try {
    const body = await request.json();
    let updates = [];
    let sqlParams = [];
    if (body.name !== undefined) { updates.push("name = ?"); sqlParams.push(body.name.trim()); }
    if (body.email !== undefined) { updates.push("email = ?"); sqlParams.push(body.email.trim()); }
    if (body.plan !== undefined) { updates.push("plan = ?"); sqlParams.push(body.plan.trim()); }

    if (updates.length > 0) {
      sqlParams.push(memberId);
      await env.DB.prepare(`UPDATE members SET ${updates.join(', ')} WHERE id = ?`)
        .bind(...sqlParams)
        .run();
    }
    const { results } = await env.DB.prepare("SELECT * FROM members WHERE id = ?").bind(memberId).all();
    if (results.length === 0) return jsonResponse({ error: "not_found" }, 404);
    return jsonResponse({ ok: true, member: results[0] });
  } catch (err) {
    return jsonResponse({ error: "server_error", detail: err.message }, 500);
  }
}

export async function onRequestDelete(context) {
  const { request, env, params } = context;
  if (!checkAuth(request, env)) return jsonResponse({ error: "unauthorized" }, 401);
  const memberId = params.id;
  await env.DB.prepare("DELETE FROM members WHERE id = ?").bind(memberId).run();
  return jsonResponse({ ok: true });
}
