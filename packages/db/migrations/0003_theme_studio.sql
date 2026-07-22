-- Theme Studio: published custom theme versions per site.

CREATE TABLE site_themes (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  status TEXT NOT NULL,
  label TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  published_at INTEGER
);
CREATE UNIQUE INDEX site_themes_site_version ON site_themes (site_id, version);
CREATE INDEX site_themes_site_status ON site_themes (site_id, status);
