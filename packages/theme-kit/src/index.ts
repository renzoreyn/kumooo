import type { Html } from "@kumooo/core";

export interface ThemeSiteContext {
  title: string;
  description: string;
  language: string;
  origin: string;
  head: Html;
  nav: { title: string; url: string }[];
  /** Public URL for site logo image, if set. */
  logoUrl?: string | null;
  /** Public URL for favicon image, if set. */
  faviconUrl?: string | null;
}

export interface PostListItem {
  title: string;
  slug: string;
  excerpt: string | null;
  publishedAt: Date | null;
  authorName: string | null;
  featuredImage: string | null;
  tags: { name: string; slug: string }[];
  url: string;
}

export interface RenderedContent {
  title: string;
  slug: string;
  type: string;
  excerpt: string | null;
  html: string;
  markdown: string;
  publishedAt: Date | null;
  updatedAt: Date;
  authorName: string | null;
  featuredImage: string | null;
  tags: { name: string; slug: string }[];
  categories: { name: string; slug: string }[];
  seo: Record<string, unknown>;
  customFields: Record<string, unknown>;
  url: string;
}

export interface Theme {
  name: string;
  label: string;
  /** SSR HTML themes. Interactive themes may also set clientBundle. */
  home: (
    site: ThemeSiteContext,
    data: { posts: PostListItem[]; page: number; totalPages: number; basePath: string },
  ) => Html;
  post: (site: ThemeSiteContext, data: { post: RenderedContent }) => Html;
  page: (site: ThemeSiteContext, data: { page: RenderedContent }) => Html;
  archive: (
    site: ThemeSiteContext,
    data: {
      title: string;
      posts: PostListItem[];
      page: number;
      totalPages: number;
      basePath: string;
    },
  ) => Html;
  notFound: (site: ThemeSiteContext) => Html;
  /** Optional path to a client JS bundle for interactive themes. */
  clientScript?: string;
}

export { html, raw, joinHtml, escapeHtml } from "@kumooo/core";
export type { Html } from "@kumooo/core";
export {
  BRAND_MINT,
  BRAND_INK,
  BRAND_STEM,
  MARK_VIEWBOX,
  brandMarkInner,
  brandMarkSvg,
  brandFaviconSvg,
  brandFaviconDataUri,
  brandBadgeMarkSvg,
} from "./brand-mark.js";
