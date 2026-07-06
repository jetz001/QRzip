CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'member',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS refs (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL DEFAULT '',
  payload TEXT NOT NULL DEFAULT '',
  payload_key TEXT,
  member_id TEXT NOT NULL DEFAULT '',
  mode TEXT NOT NULL DEFAULT 'free',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_refs_created_at ON refs(created_at);
CREATE INDEX IF NOT EXISTS idx_refs_mode ON refs(mode);
CREATE INDEX IF NOT EXISTS idx_members_created_at ON members(created_at);
