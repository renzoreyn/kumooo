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
  });

  it("each theme renders home and post", () => {
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
    for (const theme of seasonThemes) {
      const home = theme.home(site, { posts: [], page: 1, totalPages: 1, basePath: "/" });
      const rendered = theme.post(site, { post });
      expect(home.value).toContain(theme.name);
      expect(rendered.value).toContain("Hello");
    }
  });
});
