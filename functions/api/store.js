import { jsonResponse, newId } from '../utils.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const rawBody = await request.text();
    if (rawBody.length > 50000) return jsonResponse({ error: "payload_too_large" }, 400);
    const body = JSON.parse(rawBody);

    const text = typeof body.text === "string" ? body.text : "";
    const payload = typeof body.payload === "string" ? body.payload : "";
    const memberId = typeof body.memberId === "string" ? body.memberId : "";
    const mode = typeof body.mode === "string" ? body.mode : "free";

    if (!text && !payload) return jsonResponse({ error: "empty" }, 400);

    const rid = newId();
    const now = new Date().toISOString();

    await env.DB.prepare(
      "INSERT INTO refs (id, text, payload, member_id, mode, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    )
      .bind(rid, text, payload, memberId, mode, now)
      .run();

    return jsonResponse({ id: rid });
  } catch (err) {
    return jsonResponse({ error: "server_error", detail: err.message }, 500);
  }
}
