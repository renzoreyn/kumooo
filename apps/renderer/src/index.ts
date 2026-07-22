import {
  articleJsonLd,
  html,
  joinHtml,
  raw,
  renderMeta,
  renderRobots,
  renderRss,
  renderSitemap,
  verifyPreviewToken,
  websiteJsonLd,
  type Html,
  type PageMeta,
} from "@kumooo/core";
import { createDb, media, type Db } from "@kumooo/db";
import { docsTheme } from "@kumooo/theme-docs";
import { marketingTheme } from "@kumooo/theme-marketing";
import { akiTheme, fuyuTheme, haruTheme, natsuTheme } from "@kumooo/theme-seasons";
import type { ThemeSiteContext } from "@kumooo/theme-kit";
import { and, eq } from "drizzle-orm";
import { cachedResponse, cacheKeyFor, getSiteVersion, storeInCache } from "./cache.js";
import {
  getContentById,
  getPublishedContent,
  listAllPublished,
  listByTaxonomy,
  listFeedPosts,
  listNavPages,
  listPublishedPosts,
  listTaxonomySlugs,
  mediaPublicUrl,
  resolveFirstSite,
  resolveSite,
  type ResolvedSite,
} from "./data.js";
import type { Env } from "./env.js";
import { getTheme, registerTheme } from "./theme.js";
import { resolveRenderableTheme } from "./custom-theme.js";
import { DEFAULT_FAVICON_HREF } from "./favicon.js";
import { unknownSitePage } from "./unknown-site.js";

const DASHBOARD_PAGES_ORIGIN = "https://kumooo-dashboard.pages.dev";

function hostnameOf(request: Request, url: URL): string {
  return (request.headers.get("Host") ?? url.hostname).split(":")[0]!.toLowerCase();
}

function isDashboardHost(host: string, suffix: string): boolean {
  return host === `dash.${suffix}` || host === "dash.kumooo.dev";
}

function isApiHost(host: string, suffix: string): boolean {
  return host === `api.${suffix}` || host === "api.kumooo.dev";
}

/** Wildcard Worker route owns *.kumooo.dev, so Pages cannot serve dash directly. Proxy instead. */
async function proxyDashboard(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const target = new URL(url.pathname + url.search, DASHBOARD_PAGES_ORIGIN);
  const headers = new Headers(request.headers);
  headers.delete("host");
  const upstream = await fetch(target, {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
    redirect: "manual",
  });
  const out = new Headers(upstream.headers);
  const location = out.get("Location");
  if (location?.startsWith(DASHBOARD_PAGES_ORIGIN)) {
    out.set("Location", `${url.origin}${location.slice(DASHBOARD_PAGES_ORIGIN.length)}`);
  }
  return new Response(upstream.body, { status: upstream.status, headers: out });
}

/**
 * Renderer owns *.kumooo.dev. Forward api.* to the API Worker via service binding
 * so session cookies are set for api.kumooo.dev (same site as dash.kumooo.dev).
 */
async function proxyApi(request: Request, env: Env): Promise<Response> {
  return env.API.fetch(request);
}

registerTheme(haruTheme);
registerTheme(natsuTheme);
registerTheme(akiTheme);
registerTheme(fuyuTheme);
registerTheme(marketingTheme);
registerTheme(docsTheme);

const SITE_LOOKUP_TTL_S = 60;

async function resolveSiteCached(
  env: Env,
  ctx: ExecutionContext,
  db: Db,
  host: string,
): Promise<ResolvedSite | null> {
  const kvKey = `sitehost:${host.toLowerCase()}`;
  const cached = await env.KV.get<ResolvedSite>(kvKey, "json");
  if (cached) return cached;

  let site = await resolveSite(db, host, env.PUBLIC_SITE_SUFFIX);
  // workers.dev has no customer hostname yet; serve the first site so deploys are testable.
  if (!site && (env.ENVIRONMENT === "development" || host.includes("workers.dev"))) {
    site = await resolveFirstSite(db, `https://${host}`);
  }
  if (site) {
    ctx.waitUntil(env.KV.put(kvKey, JSON.stringify(site), { expirationTtl: SITE_LOOKUP_TTL_S }));
  }
  return site;
}

function buildHead(
  site: ResolvedSite,
  input: {
    meta: Omit<PageMeta, "siteName" | "titleTemplate" | "language" | "twitterHandle">;
    jsonLd?: Html;
    bareTitle?: boolean;
  },
): Html {
  const s = site.settings;
  const parts: Html[] = [
    renderMeta({
      ...input.meta,
      siteName: s.title,
      titleTemplate: input.bareTitle ? undefined : (s.seo.titleTemplate ?? `%s · ${s.title}`),
      twitterHandle: s.seo.twitterHandle,
      noindex: input.meta.noindex || s.seo.noindex,
    }),
    html`<link rel="alternate" type="application/rss+xml" title="${s.title}" href="${site.origin}/rss.xml">`,
    raw('<meta name="generator" content="Kumooo">'),
  ];
  if (input.jsonLd) parts.push(input.jsonLd);
  return joinHtml(parts, "\n");
}

async function themeContext(db: Db, site: ResolvedSite, head: Html): Promise<ThemeSiteContext> {
  const nav =
    site.settings.nav.length > 0
      ? site.settings.nav
      : (await listNavPages(db, site.id)).map((p) => ({ title: p.title, url: `/${p.slug}` }));
  const [logoUrl, faviconUrl] = await Promise.all([
    mediaPublicUrl(db, site, site.settings.logoMediaId),
    mediaPublicUrl(db, site, site.settings.faviconMediaId),
  ]);
  const iconHref = faviconUrl || DEFAULT_FAVICON_HREF;
  const headWithIcon = joinHtml(
    [head, html`<link rel="icon" href="${iconHref}" type="image/svg+xml">`],
    "\n",
  );
  return {
    title: site.settings.title || site.name,
    description: site.settings.description,
    language: site.settings.language,
    origin: site.origin,
    head: headWithIcon,
    nav,
    logoUrl,
    faviconUrl,
  };
}

const htmlResponse = (body: Html, status = 200, opts?: { customTheme?: boolean }): Response => {
  const headers: Record<string, string> = {
    "Content-Type": "text/html; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  };
  if (opts?.customTheme) {
    headers["Content-Security-Policy"] =
      "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self'";
  }
  return new Response(body.value, { status, headers });
};

async function themeFor(env: Env, site: ResolvedSite, themeName?: string) {
  return resolveRenderableTheme(themeName ?? site.theme, env, site.id, getTheme);
}

async function renderHome(db: Db, env: Env, site: ResolvedSite, url: URL): Promise<Response> {
  const perPage = site.settings.postsPerPage;
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const { posts, total } = await listPublishedPosts(db, site.id, page, perPage);
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  if (page > totalPages && total > 0) return renderNotFound(db, env, site);

  const head = buildHead(site, {
    bareTitle: true,
    meta: {
      title: site.settings.title || site.name,
      description: site.settings.description || undefined,
      canonicalUrl: page === 1 ? `${site.origin}/` : `${site.origin}/?page=${page}`,
      ogType: "website",
    },
    jsonLd: websiteJsonLd({
      siteName: site.settings.title || site.name,
      url: site.origin,
      description: site.settings.description || undefined,
    }),
  });
  const ctx = await themeContext(db, site, head);
  const { theme, custom } = await themeFor(env, site);
  return htmlResponse(theme.home(ctx, { posts, page, totalPages, basePath: "/" }), 200, {
    customTheme: custom,
  });
}

async function renderContent(
  db: Db,
  env: Env,
  site: ResolvedSite,
  slug: string,
): Promise<Response | null> {
  const item = await getPublishedContent(db, site, slug);
  if (!item) return null;
  const seo = item.seo as {
    title?: string;
    description?: string;
    ogImage?: string;
    canonicalUrl?: string;
    noindex?: boolean;
  };
  const canonical = seo.canonicalUrl ?? `${site.origin}${item.url}`;
  const head = buildHead(site, {
    meta: {
      title: seo.title ?? item.title,
      description: seo.description ?? item.excerpt ?? undefined,
      canonicalUrl: canonical,
      ogImage: seo.ogImage ?? item.featuredImage ?? site.settings.seo.defaultOgImage,
      ogType: "article",
      publishedAt: item.publishedAt,
      modifiedAt: item.updatedAt,
      authorName: item.authorName ?? undefined,
      noindex: seo.noindex,
    },
    jsonLd: articleJsonLd({
      title: item.title,
      url: canonical,
      description: seo.description ?? item.excerpt ?? undefined,
      image: seo.ogImage ?? item.featuredImage ?? undefined,
      publishedAt: item.publishedAt,
      modifiedAt: item.updatedAt,
      authorName: item.authorName ?? undefined,
      siteName: site.settings.title || site.name,
    }),
  });
  const ctx = await themeContext(db, site, head);
  const { theme, custom } = await themeFor(env, site);
  return htmlResponse(
    item.type === "page" ? theme.page(ctx, { page: item }) : theme.post(ctx, { post: item }),
    200,
    { customTheme: custom },
  );
}

async function renderNotFound(db: Db, env: Env, site: ResolvedSite): Promise<Response> {
  const head = buildHead(site, { meta: { title: "Not found", noindex: true } });
  const ctx = await themeContext(db, site, head);
  const { theme, custom } = await themeFor(env, site);
  return htmlResponse(theme.notFound(ctx), 404, { customTheme: custom });
}

async function serveMedia(
  env: Env,
  db: Db,
  site: ResolvedSite,
  mediaId: string,
  filename: string,
): Promise<Response> {
  const row = (
    await db
      .select()
      .from(media)
      .where(and(eq(media.id, mediaId), eq(media.siteId, site.id)))
  )[0];
  if (!row || row.filename !== filename) return new Response("Not found", { status: 404 });
  const object = await env.MEDIA.get(row.r2Key);
  if (!object) return new Response("Not found", { status: 404 });
  return new Response(object.body, {
    headers: {
      "Content-Type": row.mime,
      "Content-Length": String(row.size),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

async function renderPreview(
  db: Db,
  env: Env,
  site: ResolvedSite,
  contentId: string,
  themeOverride?: string,
): Promise<Response> {
  const item = await getContentById(db, site, contentId);
  if (!item) return new Response("Preview content not found.", { status: 404 });
  const seo = item.seo as {
    title?: string;
    description?: string;
    ogImage?: string;
    canonicalUrl?: string;
    noindex?: boolean;
  };
  const head = buildHead(site, {
    meta: {
      title: seo.title ?? item.title,
      description: seo.description ?? item.excerpt ?? undefined,
      canonicalUrl: seo.canonicalUrl ?? `${site.origin}${item.url}`,
      ogImage: seo.ogImage ?? item.featuredImage ?? site.settings.seo.defaultOgImage,
      ogType: "article",
      publishedAt: item.publishedAt,
      modifiedAt: item.updatedAt,
      authorName: item.authorName ?? undefined,
      noindex: true,
    },
  });
  const ctx = await themeContext(db, site, head);
  const { theme, custom } = await themeFor(env, site, themeOverride || site.theme);
  const body =
    item.type === "page" ? theme.page(ctx, { page: item }) : theme.post(ctx, { post: item });
  const res = htmlResponse(body, 200, { customTheme: custom });
  const headers = new Headers(res.headers);
  headers.set("Cache-Control", "private, no-store");
  headers.set("X-Robots-Tag", "noindex");
  return new Response(res.body, { status: 200, headers });
}

async function handle(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  const host = hostnameOf(request, url);

  if (isDashboardHost(host, env.PUBLIC_SITE_SUFFIX)) {
    return proxyDashboard(request);
  }

  if (isApiHost(host, env.PUBLIC_SITE_SUFFIX)) {
    return proxyApi(request, env);
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method not allowed", { status: 405 });
  }

  const db = createDb(env.DB);
  const site = await resolveSiteCached(env, ctx, db, host);
  if (!site) {
    return new Response(unknownSitePage(host), {
      status: 404,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=60",
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex",
      },
    });
  }
  if (!site.origin) site.origin = url.origin;

  if (url.pathname === "/_preview") {
    const token = url.searchParams.get("token");
    if (!token || !env.PREVIEW_SIGNING_SECRET) {
      return new Response("Preview unavailable.", { status: 401 });
    }
    try {
      const payload = await verifyPreviewToken(token, env.PREVIEW_SIGNING_SECRET);
      if (payload.siteId !== site.id || !payload.contentId) {
        return new Response("Preview token does not match this site.", { status: 403 });
      }
      return await renderPreview(db, env, site, payload.contentId, payload.theme);
    } catch (err) {
      return new Response(err instanceof Error ? err.message : "Invalid preview token.", {
        status: 401,
      });
    }
  }

  const version = await getSiteVersion(env, site.id);
  const cacheKey = cacheKeyFor(site.id, version, url);
  const hit = await cachedResponse(cacheKey);
  if (hit) return hit;

  const segments = url.pathname.split("/").filter(Boolean);
  let response: Response | null = null;

  if (segments.length === 0) {
    response = await renderHome(db, env, site, url);
  } else if (url.pathname === "/robots.txt") {
    response = new Response(
      renderRobots({
        sitemapUrl: `${site.origin}/sitemap.xml`,
        disallowAll: site.settings.seo.noindex,
      }),
      { headers: { "Content-Type": "text/plain; charset=utf-8" } },
    );
  } else if (url.pathname === "/sitemap.xml") {
    const [items, taxonomies] = await Promise.all([
      listAllPublished(db, site.id),
      listTaxonomySlugs(db, site.id),
    ]);
    const urls = [
      { loc: `${site.origin}/`, changefreq: "daily" as const, priority: 1 },
      ...items.map((i) => ({
        loc: `${site.origin}/${i.slug}`,
        lastmod: i.updatedAt,
      })),
      ...taxonomies.tags.map((t) => ({ loc: `${site.origin}/tag/${t}` })),
      ...taxonomies.categories.map((c) => ({ loc: `${site.origin}/category/${c}` })),
    ];
    response = new Response(renderSitemap(urls), {
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    });
  } else if (url.pathname === "/rss.xml" || url.pathname === "/feed") {
    const posts = await listFeedPosts(db, site);
    response = new Response(
      renderRss({
        title: site.settings.title || site.name,
        description: site.settings.description,
        siteUrl: site.origin,
        feedUrl: `${site.origin}/rss.xml`,
        language: site.settings.language,
        items: posts.map((p) => ({
          title: p.title,
          url: `${site.origin}/${p.slug}`,
          contentHtml: p.html,
          excerpt: p.excerpt,
          publishedAt: p.publishedAt,
          authorName: p.authorName ?? undefined,
          tags: p.tags.map((t) => t.name),
        })),
      }),
      { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } },
    );
  } else if (segments[0] === "media" && segments.length === 3) {
    response = await serveMedia(env, db, site, segments[1]!, segments[2]!);
  } else if ((segments[0] === "tag" || segments[0] === "category") && segments.length === 2) {
    const result = await listByTaxonomy(
      db,
      site.id,
      segments[0] as "tag" | "category",
      segments[1]!,
      1,
      site.settings.postsPerPage,
    );
    if (result) {
      const head = buildHead(site, {
        meta: { title: result.name, canonicalUrl: `${site.origin}/${segments[0]}/${segments[1]}` },
      });
      const themeCtx = await themeContext(db, site, head);
      const { theme, custom } = await themeFor(env, site);
      response = htmlResponse(
        theme.archive(themeCtx, {
          title: result.name,
          posts: result.posts,
          page: 1,
          totalPages: 1,
          basePath: `/${segments[0]}/${segments[1]}`,
        }),
        200,
        { customTheme: custom },
      );
    }
  } else if (segments.length === 1) {
    response = await renderContent(db, env, site, segments[0]!);
  }

  response ??= await renderNotFound(db, env, site);
  if (response.ok || response.status === 404) {
    response = storeInCache(ctx, cacheKey, response);
  }
  return response;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      return await handle(request, env, ctx);
    } catch (err) {
      console.log(
        JSON.stringify({
          level: "error",
          worker: "renderer",
          url: request.url,
          message: err instanceof Error ? err.message : String(err),
        }),
      );
      return new Response("Something went wrong rendering this page. It's us, not you.", {
        status: 500,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
  },
};
