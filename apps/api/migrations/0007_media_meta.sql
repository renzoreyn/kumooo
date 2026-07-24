-- Media metadata for dashboard library UI
ALTER TABLE media_objects ADD COLUMN content_type TEXT NOT NULL DEFAULT 'application/octet-stream';
ALTER TABLE media_objects ADD COLUMN filename TEXT;

CREATE INDEX IF NOT EXISTS media_site ON media_objects (site_id);
