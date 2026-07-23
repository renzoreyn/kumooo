import { describe, expect, it } from "vitest";
import { yukinoTheme } from "../src/index.js";
import { YUKINO_CATALOG, isYukinoProductSlug } from "../src/catalog.js";
import { ic } from "../src/icons.js";

const site = {
  title: "Yukino",
  description: "Glacial drops",
  language: "en",
  origin: "https://yukino.kumooo.dev",
  head: { __html: true as const, value: "<title>Yukino</title>" },
  nav: [
    { title: "Shop", url: "/shop" },
    { title: "About", url: "/about" },
  ],
};

const sampleContent = (slug: string, title: string, type: string) => ({
  title,
  slug,
  type,
  excerpt: null as string | null,
  html: `<p>${title} body.</p>`,
  markdown: `${title} body.`,
  publishedAt: null as Date | null,
  updatedAt: new Date(),
  authorName: null as string | null,
  featuredImage: null as string | null,
  tags: [] as { name: string; slug: string }[],
  categories: [] as { name: string; slug: string }[],
  seo: {},
  customFields: {},
  url: `/${slug}`,
});

describe("yukino catalog", () => {
  it("has three products with stable slugs", () => {
    expect(YUKINO_CATALOG.map((p) => p.slug)).toEqual([
      "drift-parka",
      "rime-shell",
      "glacier-knit",
    ]);
    expect(isYukinoProductSlug("drift-parka")).toBe(true);
    expect(isYukinoProductSlug("about")).toBe(false);
  });
});

describe("yukino icons", () => {
  it("exports required inline svgs", () => {
    for (const key of ["bag", "close", "chevron", "snow", "plus", "minus", "check"]) {
      expect(ic[key]).toContain("<svg");
      expect(ic[key]).toContain("currentColor");
    }
  });
});

describe("yukino theme", () => {
  it("registers as yukino and renders lookbook home", () => {
    expect(yukinoTheme.name).toBe("yukino");
    expect(yukinoTheme.label).toBe("Yukino");
    const doc = yukinoTheme.home(site, { posts: [], page: 1, totalPages: 1, basePath: "/" });
    expect(doc.value).toContain("<!doctype html>");
    expect(doc.value).toContain("theme-yukino");
    expect(doc.value).toContain("yukino-hero");
    expect(doc.value).toContain("YUKINO");
    expect(doc.value).toContain("Made with Kumooo");
    expect(doc.value).toContain("data-yukino-bag");
    expect(doc.value).toContain("Syne");
    expect(doc.value).toContain("Figtree");
  });

  it("embeds bag client island with gsap import and storage key", () => {
    const doc = yukinoTheme.home(site, { posts: [], page: 1, totalPages: 1, basePath: "/" });
    expect(doc.value).toContain("yukino-bag");
    expect(doc.value).toContain("cdn.jsdelivr.net/npm/gsap");
    expect(doc.value).toContain("prefers-reduced-motion");
  });

  it("uses product layout for catalog slugs", () => {
    const post = sampleContent("drift-parka", "Drift Parka", "post");
    const doc = yukinoTheme.post(site, { post });
    expect(doc.value).toContain("yukino-product");
    expect(doc.value).toContain("data-add-to-bag");
    expect(doc.value).toContain("Demo only");
  });

  it("renders shop page layout", () => {
    const page = sampleContent("shop", "Shop", "page");
    const doc = yukinoTheme.page(site, { page });
    expect(doc.value).toContain("yukino-shop");
    expect(doc.value).toContain("drift-parka");
  });

  it("renders article chrome for non-product pages", () => {
    const page = sampleContent("about", "About", "page");
    const doc = yukinoTheme.page(site, { page });
    expect(doc.value).toContain("yukino-article");
    expect(doc.value).toContain("About");
  });

  it("archive lists posts", () => {
    const doc = yukinoTheme.archive(site, {
      title: "Journal",
      posts: [
        {
          title: "Whiteout notes",
          slug: "whiteout-notes",
          excerpt: "Field notes",
          publishedAt: null,
          authorName: null,
          featuredImage: null,
          tags: [],
          url: "/whiteout-notes",
        },
      ],
      page: 1,
      totalPages: 1,
      basePath: "/journal",
    });
    expect(doc.value).toContain("yukino-archive");
    expect(doc.value).toContain("Whiteout notes");
  });
});
