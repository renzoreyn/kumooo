-- Dashboard launchable core: site lifecycle, activity, OG templates.

ALTER TABLE sites ADD COLUMN status TEXT NOT NULL DEFAULT 'active';

CREATE TABLE site_events (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  actor_id TEXT,
  type TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  metadata TEXT NOT NULL DEFAULT '{}',
  created_at INTEGER NOT NULL
);
CREATE INDEX site_events_site_created ON site_events (site_id, created_at);

CREATE TABLE og_templates (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  name TEXT NOT NULL,
  is_default INTEGER NOT NULL DEFAULT 0,
  config TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX og_templates_site ON og_templates (site_id);
