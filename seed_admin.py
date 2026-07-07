import sqlite3
import datetime
conn = sqlite3.connect('qrzip.db')
cur = conn.cursor()
cur.execute("SELECT * FROM members WHERE id='admin'")
row = cur.fetchone()
if not row:
    conn.execute("INSERT INTO members (id, name, email, plan, created_at) VALUES ('admin', 'System Admin', 'admin@local', 'admin', ?)", (datetime.datetime.utcnow().isoformat() + 'Z',))
    conn.commit()
    print("Admin inserted")
else:
    print("Admin already exists")
conn.close()
