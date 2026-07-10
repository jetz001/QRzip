import { jsonResponse, newId, checkAuth } from '../../utils.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    let { name, email, plan } = body;
    name = (name || "").trim();
    email = (email || "").trim();
    plan = (plan || "member").trim();

    if (!name || !email) return jsonResponse({ error: "missing_fields" }, 400);
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) return jsonResponse({ error: "invalid_email" }, 400);

    const isAuth = checkAuth(request, env);
    if (plan !== "member" && !isAuth) {
      plan = "member";
    }

    const memberId = "MBR-" + newId(10);
    const now = new Date().toISOString();

    await env.DB.prepare(
      "INSERT INTO members (id, name, email, plan, created_at) VALUES (?, ?, ?, ?, ?)"
    )
      .bind(memberId, name, email, plan, now)
      .run();

    const { results } = await env.DB.prepare("SELECT * FROM members WHERE id = ?").bind(memberId).all();
    return jsonResponse({ member: results[0] });
  } catch (err) {
    return jsonResponse({ error: "server_error", detail: err.message }, 500);
  }
}
