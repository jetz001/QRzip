import json
import os
import secrets
import threading
import sqlite3
from datetime import datetime
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "qrzip.db")
SCHEMA_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "schema.sql")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    if os.path.exists(SCHEMA_PATH):
        with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
            conn.executescript(f.read())
    conn.close()

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def new_id(length: int = 12) -> str:
    alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    return "".join(alphabet[secrets.randbelow(len(alphabet))] for _ in range(length))

def now_iso() -> str:
    return datetime.utcnow().isoformat(timespec="seconds") + "Z"

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        super().__init__(*args, directory=base_dir, **kwargs)

    def _send_json(self, data: dict, status: int = 200):
        payload = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()
        self.wfile.write(payload)

    def _read_json(self):
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length) if length > 0 else b"{}"
        return json.loads(raw.decode("utf-8"))

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_POST(self):
        parsed = urlparse(self.path)

        if parsed.path == "/api/store":
            return self.handle_store()
        if parsed.path == "/api/member/signup":
            return self.handle_member_signup()
        if parsed.path == "/api/admin/login":
            return self.handle_admin_login()
        if parsed.path.startswith("/api/admin/members/") and parsed.path.endswith("/ban"):
            return self.handle_admin_member_ban(parsed.path)

        return super().do_POST()

    def do_PUT(self):
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/admin/members/"):
            return self.handle_admin_member_edit(parsed.path)
        return self._send_json({"error": "not_found"}, status=404)

    def do_DELETE(self):
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/admin/members/"):
            return self.handle_admin_member_delete(parsed.path)
        return self._send_json({"error": "not_found"}, status=404)

    def handle_store(self):
        try:
            body = self._read_json()
            text = body.get("text", "")
            payload = body.get("payload", "")
            member_id = body.get("memberId", "")
            mode = body.get("mode", "free")
            if not isinstance(text, str) or not isinstance(payload, str):
                return self._send_json({"error": "invalid_request"}, status=400)
            if not text and not payload:
                return self._send_json({"error": "empty"}, status=400)

            rid = new_id()
            conn = get_db()
            conn.execute(
                "INSERT INTO refs (id, text, payload, member_id, mode, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                (rid, text, payload, member_id if isinstance(member_id, str) else "", mode if isinstance(mode, str) else "free", now_iso())
            )
            conn.commit()
            conn.close()
            return self._send_json({"id": rid})
        except Exception as exc:
            return self._send_json({"error": "server_error", "detail": str(exc)}, status=500)

    def handle_member_signup(self):
        try:
            body = self._read_json()
            name = body.get("name", "").strip()
            email = body.get("email", "").strip()
            plan = body.get("plan", "member").strip()
            if not name or not email:
                return self._send_json({"error": "missing_fields"}, status=400)

            member_id = "MBR-" + new_id(10)
            conn = get_db()
            conn.execute(
                "INSERT INTO members (id, name, email, plan, created_at) VALUES (?, ?, ?, ?, ?)",
                (member_id, name, email, plan or "member", now_iso())
            )
            conn.commit()
            
            # Fetch the inserted member to return
            cur = conn.execute("SELECT * FROM members WHERE id = ?", (member_id,))
            row = cur.fetchone()
            conn.close()
            
            return self._send_json({"member": dict(row)})
        except Exception as exc:
            return self._send_json({"error": "server_error", "detail": str(exc)}, status=500)

    def handle_admin_member_ban(self, path):
        # We don't have a 'banned' column in schema.sql yet, but let's implement gracefully
        return self._send_json({"error": "not_implemented"}, status=501)

    def handle_admin_member_edit(self, path):
        auth = self.headers.get("Authorization")
        if not auth or auth != "Bearer admin-secret-token":
            return self._send_json({"error": "unauthorized"}, status=401)
            
        member_id = path.split("/")[-1]
        try:
            body = self._read_json()
            conn = get_db()
            cur = conn.execute("SELECT * FROM members WHERE id = ?", (member_id,))
            if not cur.fetchone():
                conn.close()
                return self._send_json({"error": "not_found"}, status=404)
            
            updates = []
            params = []
            if "name" in body:
                updates.append("name = ?")
                params.append(body["name"].strip())
            if "email" in body:
                updates.append("email = ?")
                params.append(body["email"].strip())
            if "plan" in body:
                updates.append("plan = ?")
                params.append(body["plan"].strip())
                
            if updates:
                params.append(member_id)
                conn.execute(f"UPDATE members SET {', '.join(updates)} WHERE id = ?", params)
                conn.commit()
                
            cur = conn.execute("SELECT * FROM members WHERE id = ?", (member_id,))
            row = cur.fetchone()
            conn.close()
            return self._send_json({"ok": True, "member": dict(row)})
        except Exception as exc:
            return self._send_json({"error": "server_error", "detail": str(exc)}, status=500)

    def handle_admin_member_delete(self, path):
        auth = self.headers.get("Authorization")
        if not auth or auth != "Bearer admin-secret-token":
            return self._send_json({"error": "unauthorized"}, status=401)
            
        member_id = path.split("/")[-1]
        conn = get_db()
        cur = conn.execute("SELECT * FROM members WHERE id = ?", (member_id,))
        if not cur.fetchone():
            conn.close()
            return self._send_json({"error": "not_found"}, status=404)
            
        conn.execute("DELETE FROM members WHERE id = ?", (member_id,))
        conn.commit()
        conn.close()
        return self._send_json({"ok": True})

    def handle_admin_login(self):
        try:
            body = self._read_json()
            if body.get("username") == "admin" and body.get("password") == "admin1234":
                return self._send_json({"token": "admin-secret-token"})
            return self._send_json({"error": "invalid_credentials"}, status=401)
        except Exception as exc:
            return self._send_json({"error": "server_error", "detail": str(exc)}, status=500)

    def do_GET(self):
        parsed = urlparse(self.path)
        
        if parsed.path.startswith("/api/admin/") or parsed.path == "/api/member/list":
            auth = self.headers.get("Authorization")
            if not auth or auth != "Bearer admin-secret-token":
                return self._send_json({"error": "unauthorized"}, status=401)

        if parsed.path.startswith("/api/get/"):
            rid = parsed.path.split("/api/get/", 1)[1].strip()
            if not rid:
                return self._send_json({"error": "missing_id"}, status=400)
            
            conn = get_db()
            cur = conn.execute("SELECT * FROM refs WHERE id = ?", (rid,))
            row = cur.fetchone()
            conn.close()
            
            if not row:
                return self._send_json({"error": "not_found"}, status=404)
            
            return self._send_json(
                {
                    "id": row["id"],
                    "text": row["text"],
                    "payload": row["payload"],
                    "mode": row["mode"],
                    "memberId": row["member_id"],
                    "createdAt": row["created_at"],
                }
            )

        if parsed.path == "/api/member/history":
            qs = parse_qs(parsed.query)
            member_id = qs.get("memberId", [""])[0]
            if not member_id:
                return self._send_json({"error": "missing_memberId"}, status=400)
            conn = get_db()
            cur = conn.execute("SELECT * FROM refs WHERE member_id = ? ORDER BY created_at DESC", (member_id,))
            refs = [dict(row) for row in cur.fetchall()]
            conn.close()
            return self._send_json({"items": refs})

        if parsed.path == "/api/member/list":
            conn = get_db()
            cur = conn.execute("SELECT * FROM members ORDER BY created_at DESC LIMIT 100")
            members = [dict(row) for row in cur.fetchall()]
            conn.close()
            return self._send_json({"items": members})

        if parsed.path == "/api/admin/refs":
            conn = get_db()
            cur = conn.execute("SELECT * FROM refs ORDER BY created_at DESC LIMIT 100")
            refs = [dict(row) for row in cur.fetchall()]
            conn.close()
            return self._send_json({"items": refs})

        if parsed.path == "/api/admin/members":
            conn = get_db()
            cur = conn.execute("SELECT * FROM members ORDER BY created_at DESC LIMIT 100")
            members = [dict(row) for row in cur.fetchall()]
            conn.close()
            return self._send_json({"items": members})

        if parsed.path == "/api/admin/overview":
            conn = get_db()
            cur = conn.execute("SELECT COUNT(*) as c FROM refs")
            total_refs = cur.fetchone()["c"]
            
            cur = conn.execute("SELECT COUNT(*) as c FROM members")
            total_members = cur.fetchone()["c"]
            
            cur = conn.execute("SELECT COUNT(*) as c FROM refs WHERE mode = 'member'")
            member_refs = cur.fetchone()["c"]
            
            free_refs = total_refs - member_refs
            conn.close()
            
            return self._send_json(
                {
                    "ok": True,
                    "totals": {
                        "refs": total_refs,
                        "members": total_members,
                        "memberRefs": member_refs,
                        "freeRefs": free_refs,
                    }
                }
            )

        if parsed.path == "/api/health":
            conn = get_db()
            cur = conn.execute("SELECT COUNT(*) as c FROM refs")
            refs_count = cur.fetchone()["c"]
            cur = conn.execute("SELECT COUNT(*) as c FROM members")
            members_count = cur.fetchone()["c"]
            conn.close()
            return self._send_json({"ok": True, "count": refs_count, "members": members_count})

        return super().do_GET()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def main():
    init_db()
    host = os.environ.get("QRZIP_HOST", "0.0.0.0")
    port = int(os.environ.get("QRZIP_PORT", "8000"))
    httpd = ThreadingHTTPServer((host, port), Handler)
    print(f"Serving on http://{host}:{port}/  (press Ctrl+C to stop)")
    httpd.serve_forever()

if __name__ == "__main__":
    main()
