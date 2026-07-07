import json
import os
import secrets
import threading
from datetime import datetime
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse


STORE_LOCK = threading.Lock()
STORE: dict[str, dict] = {}
MEMBERS: dict[str, dict] = {}


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
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(payload)

    def _read_json(self):
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length) if length > 0 else b"{}"
        return json.loads(raw.decode("utf-8"))

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
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

            with STORE_LOCK:
                rid = new_id()
                STORE[rid] = {
                    "id": rid,
                    "text": text,
                    "payload": payload,
                    "memberId": member_id if isinstance(member_id, str) else "",
                    "mode": mode if isinstance(mode, str) else "free",
                    "createdAt": now_iso(),
                }
            return self._send_json({"id": rid})
        except Exception as exc:  # noqa: BLE001
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
            with STORE_LOCK:
                MEMBERS[member_id] = {
                    "id": member_id,
                    "name": name,
                    "email": email,
                    "plan": plan or "member",
                    "createdAt": now_iso(),
                }
            return self._send_json({"member": MEMBERS[member_id]})
        except Exception as exc:  # noqa: BLE001
            return self._send_json({"error": "server_error", "detail": str(exc)}, status=500)

    def handle_admin_member_ban(self, path):
        auth = self.headers.get("Authorization")
        if not auth or auth != "Bearer admin-secret-token":
            return self._send_json({"error": "unauthorized"}, status=401)
        
        parts = path.split("/")
        if len(parts) < 6:
            return self._send_json({"error": "invalid_path"}, status=400)
        
        member_id = parts[4]
        with STORE_LOCK:
            if member_id not in MEMBERS:
                return self._send_json({"error": "not_found"}, status=404)
            
            body = self._read_json()
            is_banned = bool(body.get("banned", False))
            MEMBERS[member_id]["banned"] = is_banned
            return self._send_json({"ok": True, "member": MEMBERS[member_id]})

    def handle_admin_member_edit(self, path):
        auth = self.headers.get("Authorization")
        if not auth or auth != "Bearer admin-secret-token":
            return self._send_json({"error": "unauthorized"}, status=401)
            
        member_id = path.split("/")[-1]
        with STORE_LOCK:
            if member_id not in MEMBERS:
                return self._send_json({"error": "not_found"}, status=404)
            
            body = self._read_json()
            if "name" in body:
                MEMBERS[member_id]["name"] = body["name"].strip()
            if "email" in body:
                MEMBERS[member_id]["email"] = body["email"].strip()
            if "plan" in body:
                MEMBERS[member_id]["plan"] = body["plan"].strip()
                
            return self._send_json({"ok": True, "member": MEMBERS[member_id]})

    def handle_admin_member_delete(self, path):
        auth = self.headers.get("Authorization")
        if not auth or auth != "Bearer admin-secret-token":
            return self._send_json({"error": "unauthorized"}, status=401)
            
        member_id = path.split("/")[-1]
        with STORE_LOCK:
            if member_id not in MEMBERS:
                return self._send_json({"error": "not_found"}, status=404)
            
            del MEMBERS[member_id]
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
            with STORE_LOCK:
                item = STORE.get(rid)
            if not item:
                return self._send_json({"error": "not_found"}, status=404)
            return self._send_json(
                {
                    "id": rid,
                    "text": item.get("text", ""),
                    "payload": item.get("payload", ""),
                    "mode": item.get("mode", "free"),
                    "memberId": item.get("memberId", ""),
                    "createdAt": item.get("createdAt", ""),
                }
            )

        if parsed.path == "/api/member/list":
            with STORE_LOCK:
                members = list(MEMBERS.values())[-100:]
            return self._send_json({"items": members})

        if parsed.path == "/api/admin/refs":
            with STORE_LOCK:
                refs = list(STORE.values())[-100:]
            refs.reverse()
            return self._send_json({"items": refs})

        if parsed.path == "/api/admin/members":
            with STORE_LOCK:
                members = list(MEMBERS.values())[-100:]
            members.reverse()
            return self._send_json({"items": members})

        if parsed.path == "/api/admin/overview":
            with STORE_LOCK:
                total_refs = len(STORE)
                total_members = len(MEMBERS)
                member_refs = sum(1 for item in STORE.values() if item.get("mode") == "member")
                free_refs = sum(1 for item in STORE.values() if item.get("mode") != "member")
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
            return self._send_json({"ok": True, "count": len(STORE), "members": len(MEMBERS)})

        return super().do_GET()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()


def main():
    host = os.environ.get("QRZIP_HOST", "127.0.0.1")
    port = int(os.environ.get("QRZIP_PORT", "8000"))
    httpd = ThreadingHTTPServer((host, port), Handler)
    print(f"Serving on http://{host}:{port}/  (press Ctrl+C to stop)")
    httpd.serve_forever()


if __name__ == "__main__":
    main()
