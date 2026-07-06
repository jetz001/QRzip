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
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        parsed = urlparse(self.path)

        if parsed.path == "/api/store":
            return self.handle_store()
        if parsed.path == "/api/member/signup":
            return self.handle_member_signup()

        return super().do_POST()

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

    def do_GET(self):
        parsed = urlparse(self.path)

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


def main():
    host = os.environ.get("QRZIP_HOST", "127.0.0.1")
    port = int(os.environ.get("QRZIP_PORT", "8000"))
    httpd = ThreadingHTTPServer((host, port), Handler)
    print(f"Serving on http://{host}:{port}/  (press Ctrl+C to stop)")
    httpd.serve_forever()


if __name__ == "__main__":
    main()
