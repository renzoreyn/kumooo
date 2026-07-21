-- Kumooo initial schema. Additive only from here on.

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL
);

CREATE TABLE org_members (
  org_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (org_id, user_id)
);
CREATE INDEX org_members_user ON org_members (user_id);

CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  ip TEXT,
  user_agent TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX sessions_user ON sessions (user_id);

CREATE TABLE sites (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  theme TEXT NOT NULL DEFAULT 'default',
  settings TEXT NOT NULL DEFAULT '{}',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX sites_org ON sites (org_id);

CREATE TABLE domains (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  hostname TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  cf_hostname_id TEXT,
  verified_at INTEGER,
  created_at INTEGER NOT NULL
);
CREATE INDEX domains_site ON domains (site_id);

CREATE TABLE content (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'post',
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  body_markdown TEXT NOT NULL DEFAULT '',
  custom_fields TEXT NOT NULL DEFAULT '{}',
  seo TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  published_at INTEGER,
  scheduled_at INTEGER,
  author_id TEXT NOT NULL,
  featured_image TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE UNIQUE INDEX content_site_type_slug ON content (site_id, type, slug);
CREATE INDEX content_site_status_published ON content (site_id, status, published_at);

CREATE TABLE revisions (
  id TEXT PRIMARY KEY,
  content_id TEXT NOT NULL,
  snapshot TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX revisions_content ON revisions (content_id, created_at);

CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT
);
CREATE UNIQUE INDEX tags_site_slug ON tags (site_id, slug);

CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT
);
CREATE UNIQUE INDEX categories_site_slug ON categories (site_id, slug);

CREATE TABLE content_tags (
  content_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (content_id, tag_id)
);

CREATE TABLE content_categories (
  content_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  PRIMARY KEY (content_id, category_id)
);

CREATE TABLE media (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  r2_key TEXT NOT NULL UNIQUE,
  filename TEXT NOT NULL,
  mime TEXT NOT NULL,
  size INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  alt TEXT NOT NULL DEFAULT '',
  created_by TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX media_site ON media (site_id, created_at);
