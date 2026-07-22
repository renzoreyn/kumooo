import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

/**
 * Conventions:
 * - Prefixed string IDs from @kumooo/core
 * - Timestamps as unix-ms Date via drizzle
 * - JSON text validated by zod at write boundaries
 * - No cross-org foreign keys (sharding escape hatch)
 */

const createdAt = () =>
  integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date());
const updatedAt = () =>
  integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date());

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const organizations = sqliteTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: createdAt(),
});

export const orgMembers = sqliteTable(
  "org_members",
  {
    orgId: text("org_id").notNull(),
    userId: text("user_id").notNull(),
    role: text("role", { enum: ["owner", "admin", "editor", "author", "viewer"] }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.orgId, t.userId] }), index("org_members_user").on(t.userId)],
);

export const sessions = sqliteTable(
  "sessions",
  {
    tokenHash: text("token_hash").primaryKey(),
    userId: text("user_id").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    ip: text("ip"),
    userAgent: text("user_agent"),
    createdAt: createdAt(),
  },
  (t) => [index("sessions_user").on(t.userId)],
);

export const sites = sqliteTable(
  "sites",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    theme: text("theme").notNull().default("haru"),
    status: text("status", { enum: ["active", "archived"] }).notNull().default("active"),
    settings: text("settings").notNull().default("{}"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("sites_org").on(t.orgId)],
);

export const siteEvents = sqliteTable(
  "site_events",
  {
    id: text("id").primaryKey(),
    siteId: text("site_id").notNull(),
    actorId: text("actor_id"),
    type: text("type").notNull(),
    resourceType: text("resource_type"),
    resourceId: text("resource_id"),
    metadata: text("metadata").notNull().default("{}"),
    createdAt: createdAt(),
  },
  (t) => [index("site_events_site_created").on(t.siteId, t.createdAt)],
);

export const ogTemplates = sqliteTable(
  "og_templates",
  {
    id: text("id").primaryKey(),
    siteId: text("site_id").notNull(),
    name: text("name").notNull(),
    isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
    config: text("config").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("og_templates_site").on(t.siteId)],
);

export const domains = sqliteTable(
  "domains",
  {
    id: text("id").primaryKey(),
    siteId: text("site_id").notNull(),
    hostname: text("hostname").notNull().unique(),
    status: text("status", { enum: ["pending", "active", "error"] })
      .notNull()
      .default("pending"),
    cfHostnameId: text("cf_hostname_id"),
    verifiedAt: integer("verified_at", { mode: "timestamp_ms" }),
    createdAt: createdAt(),
  },
  (t) => [index("domains_site").on(t.siteId)],
);

export const content = sqliteTable(
  "content",
  {
    id: text("id").primaryKey(),
    siteId: text("site_id").notNull(),
    type: text("type").notNull().default("post"),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt"),
    bodyMarkdown: text("body_markdown").notNull().default(""),
    customFields: text("custom_fields").notNull().default("{}"),
    seo: text("seo").notNull().default("{}"),
    status: text("status", { enum: ["draft", "scheduled", "published", "archived"] })
      .notNull()
      .default("draft"),
    publishedAt: integer("published_at", { mode: "timestamp_ms" }),
    scheduledAt: integer("scheduled_at", { mode: "timestamp_ms" }),
    authorId: text("author_id").notNull(),
    featuredImage: text("featured_image"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("content_site_type_slug").on(t.siteId, t.type, t.slug),
    index("content_site_status_published").on(t.siteId, t.status, t.publishedAt),
  ],
);

export const revisions = sqliteTable(
  "revisions",
  {
    id: text("id").primaryKey(),
    contentId: text("content_id").notNull(),
    snapshot: text("snapshot").notNull(),
    createdBy: text("created_by").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("revisions_content").on(t.contentId, t.createdAt)],
);

export const tags = sqliteTable(
  "tags",
  {
    id: text("id").primaryKey(),
    siteId: text("site_id").notNull(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description"),
  },
  (t) => [uniqueIndex("tags_site_slug").on(t.siteId, t.slug)],
);

export const categories = sqliteTable(
  "categories",
  {
    id: text("id").primaryKey(),
    siteId: text("site_id").notNull(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description"),
  },
  (t) => [uniqueIndex("categories_site_slug").on(t.siteId, t.slug)],
);

export const contentTags = sqliteTable(
  "content_tags",
  {
    contentId: text("content_id").notNull(),
    tagId: text("tag_id").notNull(),
  },
  (t) => [primaryKey({ columns: [t.contentId, t.tagId] })],
);

export const contentCategories = sqliteTable(
  "content_categories",
  {
    contentId: text("content_id").notNull(),
    categoryId: text("category_id").notNull(),
  },
  (t) => [primaryKey({ columns: [t.contentId, t.categoryId] })],
);

export const media = sqliteTable(
  "media",
  {
    id: text("id").primaryKey(),
    siteId: text("site_id").notNull(),
    r2Key: text("r2_key").notNull().unique(),
    filename: text("filename").notNull(),
    mime: text("mime").notNull(),
    size: integer("size").notNull(),
    width: integer("width"),
    height: integer("height"),
    alt: text("alt").notNull().default(""),
    createdBy: text("created_by").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("media_site").on(t.siteId, t.createdAt)],
);

export const siteThemes = sqliteTable(
  "site_themes",
  {
    id: text("id").primaryKey(),
    siteId: text("site_id").notNull(),
    version: integer("version").notNull(),
    status: text("status", { enum: ["draft", "published", "archived"] }).notNull(),
    label: text("label").notNull(),
    createdAt: createdAt(),
    publishedAt: integer("published_at", { mode: "timestamp_ms" }),
  },
  (t) => [
    uniqueIndex("site_themes_site_version").on(t.siteId, t.version),
    index("site_themes_site_status").on(t.siteId, t.status),
  ],
);
