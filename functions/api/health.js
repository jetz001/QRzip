import { jsonResponse } from '../utils.js';

export async function onRequestGet(context) {
  const { env } = context;
  try {
    const refsCount = await env.DB.prepare("SELECT COUNT(*) as c FROM refs").first("c");
    const membersCount = await env.DB.prepare("SELECT COUNT(*) as c FROM members").first("c");
    return jsonResponse({ ok: true, count: refsCount, members: membersCount });
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}
