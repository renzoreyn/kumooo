import { renderMarkdown, siteSettingsSchema, type SiteSettings } from "@kumooo/core";
import {
  categories,
  content,
  contentCategories,
  contentTags,
  domains,
  sites,
  tags,
  users,
  type Db,
} from "@kumooo/db";
import type { PostListItem, RenderedContent } from "@kumooo/theme-kit";
import { and, desc, eq, sql } from "drizzle-orm";

export interface ResolvedSite {
  id: string;
  name: string;
  slug: string;
  theme: string;
  settings: SiteSettings;
  origin: string;
}

export async function resolveSite(
  db: Db,
  host: string,
  siteSuffix: string,
): Promise<ResolvedSite | null> {
  const hostname = host.split(":")[0]!.toLowerCase();
  const suffix = siteSuffix.toLowerCase();

  if (hostname === suffix || hostname.endsWith(`.${suffix}`)) {
    const slug = hostname === suffix ? "www" : hostname.slice(0, -(suffix.length + 1));
    const row = (await db.select().from(sites).where(eq(sites.slug, slug)))[0];
    if (row) return toResolved(row, `https://${hostname}`);
  }

  const dom = (
    await db
      .select()
      .from(domains)
      .where(and(eq(domains.hostname, hostname), eq(domains.status, "active")))
  )[0];
  if (dom) {
    const row = (await db.select().from(sites).where(eq(sites.id, dom.siteId)))[0];
    if (row) return toResolved(row, `https://${hostname}`);
  }
  return null;
}

export async function resolveFirstSite(db: Db, origin: string): Promise<ResolvedSite | null> {
  const row = (await db.select().from(sites).limit(1))[0];
  return row ? toResolved(row, origin) : null;
}

function toResolved(row: typeof sites.$inferSelect, origin: string): ResolvedSite {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    theme: row.theme,
    settings: siteSettingsSchema.parse(safeJson(row.settings)),
    origin,
  };
}

function safeJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

export async function listNavPages(db: Db, siteId: string) {
  return db
    .select({ title: content.title, slug: content.slug })
    .from(content)
    .where(and(eq(content.siteId, siteId), eq(content.type, "page"), eq(content.status, "published")))
    .orderBy(content.title);
}

export async function listPublishedPosts(db: Db, siteId: string, page: number, perPage: number) {
  const where = and(eq(content.siteId, siteId), eq(content.type, "post"), eq(content.status, "published"));
  const rows = await db
    .select()
    .from(content)
    .where(where)
    .orderBy(desc(content.publishedAt))
    .limit(perPage)
    .offset((page - 1) * perPage);
  const totalRow = await db.select({ count: sql<number>`count(*)` }).from(content).where(where);
  const total = Number(totalRow[0]?.count ?? 0);
  const posts: PostListItem[] = rows.map((r) => ({
    title: r.title,
    slug: r.slug,
    excerpt: r.excerpt,
    publishedAt: r.publishedAt,
    authorName: null,
    featuredImage: r.featuredImage,
    tags: [],
    url: `/${r.slug}`,
  }));
  return { posts, total };
}

export async function getPublishedContent(
  db: Db,
  site: ResolvedSite,
  slug: string,
  type?: string,
): Promise<RenderedContent | null> {
  const conditions = [
    eq(content.siteId, site.id),
    eq(content.slug, slug),
    eq(content.status, "published"),
  ];
  if (type) conditions.push(eq(content.type, type));
  const row = (await db.select().from(content).where(and(...conditions)))[0];
  if (!row) return null;

  const author = (await db.select().from(users).where(eq(users.id, row.authorId)))[0];
  const tagRows = await db
    .select({ name: tags.name, slug: tags.slug })
    .from(contentTags)
    .innerJoin(tags, eq(tags.id, contentTags.tagId))
    .where(eq(contentTags.contentId, row.id));
  const catRows = await db
    .select({ name: categories.name, slug: categories.slug })
    .from(contentCategories)
    .innerJoin(categories, eq(categories.id, contentCategories.categoryId))
    .where(eq(contentCategories.contentId, row.id));

  const html = renderMarkdown(row.bodyMarkdown, {
    allowRawHtml: site.settings.allowRawHtml,
  }).value;

  return {
    title: row.title,
    slug: row.slug,
    type: row.type,
    excerpt: row.excerpt,
    html,
    markdown: row.bodyMarkdown,
    publishedAt: row.publishedAt,
    updatedAt: row.updatedAt,
    authorName: author?.name ?? null,
    featuredImage: row.featuredImage,
    tags: tagRows,
    categories: catRows,
    seo: safeJson(row.seo) as Record<string, unknown>,
    customFields: safeJson(row.customFields) as Record<string, unknown>,
    url: `/${row.slug}`,
  };
}

export async function listByTaxonomy(
  db: Db,
  siteId: string,
  kind: "tag" | "category",
  slug: string,
  page: number,
  perPage: number,
) {
  if (kind === "tag") {
    const tag = (
      await db.select().from(tags).where(and(eq(tags.siteId, siteId), eq(tags.slug, slug)))
    )[0];
    if (!tag) return null;
    const rows = await db
      .select({ content })
      .from(contentTags)
      .innerJoin(content, eq(content.id, contentTags.contentId))
      .where(
        and(
          eq(contentTags.tagId, tag.id),
          eq(content.status, "published"),
          eq(content.type, "post"),
        ),
      )
      .orderBy(desc(content.publishedAt))
      .limit(perPage)
      .offset((page - 1) * perPage);
    return {
      name: tag.name,
      total: rows.length,
      posts: rows.map(({ content: r }) => ({
        title: r.title,
        slug: r.slug,
        excerpt: r.excerpt,
        publishedAt: r.publishedAt,
        authorName: null,
        featuredImage: r.featuredImage,
        tags: [],
        url: `/${r.slug}`,
      })) satisfies PostListItem[],
    };
  }
  const cat = (
    await db
      .select()
      .from(categories)
      .where(and(eq(categories.siteId, siteId), eq(categories.slug, slug)))
  )[0];
  if (!cat) return null;
  const rows = await db
    .select({ content })
    .from(contentCategories)
    .innerJoin(content, eq(content.id, contentCategories.contentId))
    .where(
      and(
        eq(contentCategories.categoryId, cat.id),
        eq(content.status, "published"),
        eq(content.type, "post"),
      ),
    )
    .orderBy(desc(content.publishedAt))
    .limit(perPage)
    .offset((page - 1) * perPage);
  return {
    name: cat.name,
    total: rows.length,
    posts: rows.map(({ content: r }) => ({
      title: r.title,
      slug: r.slug,
      excerpt: r.excerpt,
      publishedAt: r.publishedAt,
      authorName: null,
      featuredImage: r.featuredImage,
      tags: [],
      url: `/${r.slug}`,
    })) satisfies PostListItem[],
  };
}

export async function listFeedPosts(db: Db, site: ResolvedSite) {
  const rows = await db
    .select()
    .from(content)
    .where(and(eq(content.siteId, site.id), eq(content.type, "post"), eq(content.status, "published")))
    .orderBy(desc(content.publishedAt))
    .limit(50);
  return rows.map((r) => ({
    title: r.title,
    slug: r.slug,
    excerpt: r.excerpt,
    publishedAt: r.publishedAt,
    authorName: null as string | null,
    html: renderMarkdown(r.bodyMarkdown, { allowRawHtml: site.settings.allowRawHtml }).value,
    tags: [] as { name: string }[],
  }));
}

export async function listAllPublished(db: Db, siteId: string) {
  return db
    .select({
      type: content.type,
      slug: content.slug,
      updatedAt: content.updatedAt,
    })
    .from(content)
    .where(and(eq(content.siteId, siteId), eq(content.status, "published")));
}

export async function listTaxonomySlugs(db: Db, siteId: string) {
  const t = await db.select({ slug: tags.slug }).from(tags).where(eq(tags.siteId, siteId));
  const c = await db
    .select({ slug: categories.slug })
    .from(categories)
    .where(eq(categories.siteId, siteId));
  return { tags: t.map((x) => x.slug), categories: c.map((x) => x.slug) };
}
