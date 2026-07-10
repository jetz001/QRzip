import { jsonResponse, checkAuth } from '../../utils.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!checkAuth(request, env)) return jsonResponse({ error: "unauthorized" }, 401);

  const total_refs = await env.DB.prepare("SELECT COUNT(*) as c FROM refs").first("c");
  const total_members = await env.DB.prepare("SELECT COUNT(*) as c FROM members").first("c");
  const member_refs = await env.DB.prepare("SELECT COUNT(*) as c FROM refs WHERE mode = 'member'").first("c");
  
  return jsonResponse({
    ok: true,
    totals: {
      refs: total_refs,
      members: total_members,
      memberRefs: member_refs,
      freeRefs: total_refs - member_refs,
    }
  });
}
