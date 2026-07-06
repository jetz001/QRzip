export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders()
      });
    }

    try {
      if (path === "/api/member/signup" && request.method === "POST") {
        const body = await request.json();
        const id = "MBR-" + crypto.randomUUID().slice(0, 10);
        await env.DB.prepare(
          "INSERT INTO members (id, name, email, plan, created_at) VALUES (?, ?, ?, ?, datetime('now'))"
        ).bind(id, body.name ?? "", body.email ?? "", body.plan ?? "member").run();
        const member = await env.DB.prepare("SELECT * FROM members WHERE id = ?").bind(id).first();
        return json({ member });
      }

      if (path === "/api/store" && request.method === "POST") {
        const body = await request.json();
        const id = crypto.randomUUID().slice(0, 12);
        const text = body.text ?? "";
        const payload = body.payload ?? "";
        const memberId = body.memberId ?? "";
        const mode = body.mode ?? "free";

        let payloadKey = null;
        if (payload && payload.length > 4096 && env.BUCKET) {
          payloadKey = `payloads/${id}.txt`;
          await env.BUCKET.put(payloadKey, payload);
        }

        await env.DB.prepare(
          "INSERT INTO refs (id, text, payload, payload_key, member_id, mode, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))"
        ).bind(id, text, payloadKey ? "" : payload, payloadKey, memberId, mode).run();

        return json({ id });
      }

      if (path.startsWith("/api/get/") && request.method === "GET") {
        const id = path.replace("/api/get/", "");
        const row = await env.DB.prepare("SELECT * FROM refs WHERE id = ?").bind(id).first();
        if (!row) return json({ error: "not_found" }, 404);
        let payload = row.payload ?? "";
        if (!payload && row.payload_key && env.BUCKET) {
          payload = (await env.BUCKET.get(row.payload_key))?.text ? await (await env.BUCKET.get(row.payload_key)).text() : "";
        }
        return json({
          id: row.id,
          text: row.text,
          payload,
          mode: row.mode,
          memberId: row.member_id,
          createdAt: row.created_at
        });
      }

      if (path === "/api/admin/overview" && request.method === "GET") {
        const refs = await env.DB.prepare("SELECT COUNT(*) AS count FROM refs").first();
        const members = await env.DB.prepare("SELECT COUNT(*) AS count FROM members").first();
        const memberRefs = await env.DB.prepare("SELECT COUNT(*) AS count FROM refs WHERE mode = 'member'").first();
        const freeRefs = await env.DB.prepare("SELECT COUNT(*) AS count FROM refs WHERE mode != 'member'").first();
        return json({
          ok: true,
          totals: {
            refs: refs?.count ?? 0,
            members: members?.count ?? 0,
            memberRefs: memberRefs?.count ?? 0,
            freeRefs: freeRefs?.count ?? 0
          }
        });
      }

      if (path === "/api/admin/refs" && request.method === "GET") {
        const rows = await env.DB.prepare("SELECT id, text, member_id AS memberId, mode, created_at AS createdAt FROM refs ORDER BY created_at DESC LIMIT 100").all();
        return json({ items: rows.results ?? [] });
      }

      if (path === "/api/admin/members" && request.method === "GET") {
        const rows = await env.DB.prepare("SELECT id, name, email, plan, created_at AS createdAt FROM members ORDER BY created_at DESC LIMIT 100").all();
        return json({ items: rows.results ?? [] });
      }

      return new Response("Not Found", { status: 404, headers: corsHeaders() });
    } catch (error) {
      return json({ error: "server_error", detail: String(error) }, 500);
    }
  }
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders()
    }
  });
}
