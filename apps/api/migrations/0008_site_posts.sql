-- Per-site blog posts (dashboard CMS). Demo tables stay separate.
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (site_id, slug)
);

CREATE INDEX IF NOT EXISTS posts_site ON posts (site_id);
CREATE INDEX IF NOT EXISTS posts_site_status ON posts (site_id, status);
