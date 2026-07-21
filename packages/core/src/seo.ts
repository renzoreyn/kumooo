import { escapeHtml, html, joinHtml, raw, type Html } from "./html.js";

export interface PageMeta {
  title: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  siteName?: string;
  titleTemplate?: string;
  language?: string;
  twitterHandle?: string;
  publishedAt?: Date | string | null;
  modifiedAt?: Date | string | null;
  authorName?: string;
  noindex?: boolean;
  searchConsoleToken?: string;
}

function iso(value?: Date | string | null): string | undefined {
  if (!value) return undefined;
  return typeof value === "string" ? value : value.toISOString();
}

export function renderMeta(meta: PageMeta): Html {
  const title =
    meta.titleTemplate && meta.siteName && meta.title !== meta.siteName
      ? meta.titleTemplate.replace("%s", meta.title)
      : meta.title;

  const parts: Html[] = [
    html`<title>${title}</title>`,
    html`<meta name="viewport" content="width=device-width, initial-scale=1">`,
    raw(`<meta property="og:title" content="${escapeHtml(title)}">`),
  ];

  if (meta.description) {
    parts.push(html`<meta name="description" content="${meta.description}">`);
    parts.push(raw(`<meta property="og:description" content="${escapeHtml(meta.description)}">`));
  }
  if (meta.canonicalUrl) {
    parts.push(html`<link rel="canonical" href="${meta.canonicalUrl}">`);
    parts.push(raw(`<meta property="og:url" content="${escapeHtml(meta.canonicalUrl)}">`));
  }
  if (meta.ogImage) parts.push(raw(`<meta property="og:image" content="${escapeHtml(meta.ogImage)}">`));
  if (meta.siteName) parts.push(raw(`<meta property="og:site_name" content="${escapeHtml(meta.siteName)}">`));
  parts.push(raw(`<meta property="og:type" content="${escapeHtml(meta.ogType ?? "website")}">`));
  if (meta.twitterHandle) {
    parts.push(raw(`<meta name="twitter:card" content="summary_large_image">`));
    parts.push(raw(`<meta name="twitter:site" content="${escapeHtml(meta.twitterHandle)}">`));
  }
  if (meta.noindex) parts.push(raw(`<meta name="robots" content="noindex,nofollow">`));
  if (meta.searchConsoleToken) {
    parts.push(
      raw(`<meta name="google-site-verification" content="${escapeHtml(meta.searchConsoleToken)}">`),
    );
  }
  const pub = iso(meta.publishedAt);
  const mod = iso(meta.modifiedAt);
  if (pub) parts.push(raw(`<meta property="article:published_time" content="${escapeHtml(pub)}">`));
  if (mod) parts.push(raw(`<meta property="article:modified_time" content="${escapeHtml(mod)}">`));
  if (meta.authorName) parts.push(raw(`<meta name="author" content="${escapeHtml(meta.authorName)}">`));

  return joinHtml(parts, "\n");
}

export function websiteJsonLd(input: {
  siteName: string;
  url: string;
  description?: string;
}): Html {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: input.siteName,
    url: input.url,
    description: input.description,
  };
  return raw(`<script type="application/ld+json">${JSON.stringify(data)}</script>`);
}

export function articleJsonLd(input: {
  title: string;
  url: string;
  description?: string;
  image?: string;
  publishedAt?: Date | string | null;
  modifiedAt?: Date | string | null;
  authorName?: string;
  siteName: string;
}): Html {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    url: input.url,
    description: input.description,
    image: input.image,
    datePublished: iso(input.publishedAt),
    dateModified: iso(input.modifiedAt),
    author: input.authorName ? { "@type": "Person", name: input.authorName } : undefined,
    publisher: { "@type": "Organization", name: input.siteName },
  };
  return raw(`<script type="application/ld+json">${JSON.stringify(data)}</script>`);
}
