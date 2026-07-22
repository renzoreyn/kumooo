import {
  html,
  joinHtml,
  raw,
  type Html,
  type Theme,
  type ThemeSiteContext,
} from "@kumooo/theme-kit";
import { documentShell, schemeToggle, siteBrand } from "./chrome.js";

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

export { siteBrand, schemeToggle };
