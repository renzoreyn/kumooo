import { escapeHtml } from "./html.js";

export interface RssItem {
  title: string;
  url: string;
  contentHtml: string;
  excerpt?: string | null;
  publishedAt?: Date | string | null;
  authorName?: string;
  tags?: string[];
}

export function renderRss(input: {
  title: string;
  description: string;
  siteUrl: string;
  feedUrl: string;
  language?: string;
  items: RssItem[];
}): string {
  const items = input.items
    .map((item) => {
      const date =
        item.publishedAt instanceof Date
          ? item.publishedAt.toUTCString()
          : item.publishedAt
            ? new Date(item.publishedAt).toUTCString()
            : "";
      return `<item>
  <title>${escapeHtml(item.title)}</title>
  <link>${escapeHtml(item.url)}</link>
  <guid>${escapeHtml(item.url)}</guid>
  ${date ? `<pubDate>${date}</pubDate>` : ""}
  <description>${escapeHtml(item.excerpt ?? "")}</description>
  <content:encoded><![CDATA[${item.contentHtml}]]></content:encoded>
</item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
  <title>${escapeHtml(input.title)}</title>
  <link>${escapeHtml(input.siteUrl)}</link>
  <description>${escapeHtml(input.description)}</description>
  <language>${escapeHtml(input.language ?? "en")}</language>
  <atom:link href="${escapeHtml(input.feedUrl)}" rel="self" type="application/rss+xml" xmlns:atom="http://www.w3.org/2005/Atom"/>
  ${items}
</channel>
</rss>`;
}

export function renderSitemap(
  urls: { loc: string; lastmod?: Date | string | null; changefreq?: string; priority?: number }[],
): string {
  const body = urls
    .map((u) => {
      const last =
        u.lastmod instanceof Date
          ? u.lastmod.toISOString()
          : u.lastmod
            ? new Date(u.lastmod).toISOString()
            : undefined;
      return `<url>
  <loc>${escapeHtml(u.loc)}</loc>
  ${last ? `<lastmod>${last}</lastmod>` : ""}
  ${u.changefreq ? `<changefreq>${u.changefreq}</changefreq>` : ""}
  ${u.priority != null ? `<priority>${u.priority}</priority>` : ""}
</url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;
}

export function renderRobots(input: { sitemapUrl: string; disallowAll?: boolean }): string {
  if (input.disallowAll) return "User-agent: *\nDisallow: /\n";
  return `User-agent: *\nAllow: /\nSitemap: ${input.sitemapUrl}\n`;
}
