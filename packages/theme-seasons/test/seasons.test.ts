import { describe, expect, it } from "vitest";
import { haruTheme, seasonThemes } from "../src/index.js";

const site = {
  title: "Test",
  description: "A site",
  language: "en",
  origin: "https://test.kumooo.dev",
  head: { __html: true as const, value: "<title>Test</title>" },
  nav: [{ title: "Home", url: "/" }],
};

describe("season themes", () => {
  it("exports four unique season ids", () => {
    expect(seasonThemes.map((t) => t.name).sort()).toEqual(["aki", "fuyu", "haru", "natsu"]);
  });

  it("haru renders a home document", () => {
    expect(haruTheme.name).toBe("haru");
    const doc = haruTheme.home(site, { posts: [], page: 1, totalPages: 1, basePath: "/" });
    expect(doc.value).toContain("<!doctype html>");
    expect(doc.value).toContain("Test");
    expect(doc.value).toContain("theme-haru");
    expect(doc.value).toContain("Made with Kumooo");
    expect(doc.value).toContain("data-km-scheme");
  });

  it("each theme is structurally distinct and hides the season id label", () => {
    const post = {
      title: "Hello",
      slug: "hello",
      type: "post",
      excerpt: null,
      html: "<p>Hi</p>",
      markdown: "Hi",
      publishedAt: null,
      updatedAt: new Date(),
      authorName: null,
      featuredImage: null,
      tags: [],
      categories: [],
      seo: {},
      customFields: {},
      url: "/hello",
    };
    const markers = {
      haru: "haru-hero",
      natsu: "natsu-hero",
      aki: "aki-hero",
      fuyu: "fuyu-hero",
    } as const;
    for (const theme of seasonThemes) {
      const home = theme.home(site, { posts: [], page: 1, totalPages: 1, basePath: "/" });
      const rendered = theme.post(site, { post });
      expect(home.value).not.toMatch(new RegExp(`class="eyebrow"[^>]*>\\s*${theme.name}`, "i"));
      expect(home.value).toContain(`theme-${theme.name}`);
      expect(home.value).toContain(markers[theme.name as keyof typeof markers]);
      expect(home.value).toContain("km-badge");
      expect(rendered.value).toContain("Hello");
    }
  });
});
