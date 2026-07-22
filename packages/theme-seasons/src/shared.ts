import {
  html,
  joinHtml,
  raw,
  type Html,
  type PostListItem,
  type Theme,
  type ThemeSiteContext,
} from "@kumooo/theme-kit";
import { documentShell, schemeToggle, siteBrand, stickyHeader } from "./chrome.js";

export type SeasonParts = {
  name: string;
  label: string;
  css: string;
  fontHref: string;
  bodyClass: string;
  header: (site: ThemeSiteContext) => Html;
  homeMain: (
    site: ThemeSiteContext,
    data: { posts: Parameters<Theme["home"]>[1]["posts"]; page: number; totalPages: number },
  ) => Html;
  articleMain: (title: string, body: Html, excerpt?: string | null) => Html;
  archiveMain: (title: string, posts: Parameters<Theme["home"]>[1]["posts"]) => Html;
  notFoundMain: () => Html;
};

export function buildSeasonTheme(parts: SeasonParts): Theme {
  const shell = (site: ThemeSiteContext, main: Html) =>
    documentShell({
      site,
      css: parts.css,
      fontHref: parts.fontHref,
      bodyClass: parts.bodyClass,
      header: parts.header(site),
      main,
    });

  return {
    name: parts.name,
    label: parts.label,
    home(site, data) {
      return shell(site, parts.homeMain(site, data));
    },
    post(site, { post }) {
      return shell(site, parts.articleMain(post.title, raw(post.html), post.excerpt));
    },
    page(site, { page }) {
      return shell(site, parts.articleMain(page.title, raw(page.html), page.excerpt));
    },
    archive(site, { title, posts }) {
      return shell(site, parts.archiveMain(title, posts));
    },
    notFound(site) {
      return shell(site, parts.notFoundMain());
    },
  };
}

export function defaultNav(site: ThemeSiteContext): Html {
  return html`<nav class="site-nav">${joinHtml(
    site.nav.map((n) => html`<a href="${n.url}">${n.title}</a>`),
    "",
  )}${schemeToggle()}</nav>`;
}

/** Shared shadcn-adjacent sticky header: logo left, nav + scheme toggle right. */
export function seasonHeader(site: ThemeSiteContext, className?: string): Html {
  return stickyHeader(site, defaultNav(site), { className });
}

/** Format a publish date consistently across seasons, or "" when absent. */
export function formatDate(
  date: Date | null,
  opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" },
): string {
  return date ? date.toLocaleDateString(undefined, opts) : "";
}

/** Up to `max` tag chips for a post list item, rendered as pill badges. */
export function tagChips(post: PostListItem, max = 2): Html {
  const tags = post.tags ?? [];
  if (tags.length === 0) return raw("");
  return html`<span class="km-chips">${joinHtml(
    tags.slice(0, max).map((t) => html`<span class="km-chip">${t.name}</span>`),
    "",
  )}</span>`;
}

/** A small pill showing the post count, for hero areas. */
export function countChip(count: number, singular = "post", plural = `${singular}s`): Html {
  const label = count === 1 ? singular : plural;
  return html`<span class="km-chip km-chip-solid">${String(count)} ${label}</span>`;
}

/** Prev/next page indicator styled as a modern footer bar. */
export function pager(page: number, totalPages: number): Html {
  if (totalPages <= 1) return raw("");
  return html`<div class="km-pager"><span>Page ${String(page)} of ${String(totalPages)}</span></div>`;
}

export { siteBrand, schemeToggle, stickyHeader };
