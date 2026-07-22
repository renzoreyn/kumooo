import { describe, expect, it } from "vitest";
import { compileTheme, starterThemeFiles, validateThemeFiles } from "../src/compile.js";

describe("compileTheme", () => {
  it("validates and renders starter home", () => {
    const files = starterThemeFiles("Demo");
    const check = validateThemeFiles(files);
    expect(check.ok).toBe(true);
    const theme = compileTheme(files);
    expect(theme.label).toBe("Demo");
    const site = {
      title: "Smoke Site",
      description: "Hello",
      language: "en",
      origin: "https://smoke.kumooo.dev",
      head: { __html: true as const, value: "<title>Smoke Site</title>" },
      nav: [{ title: "Home", url: "/" }],
    };
    const home = theme.home(site, { posts: [], page: 1, totalPages: 1, basePath: "/" });
    expect(home.value).toContain("Smoke Site");
    expect(home.value).toContain("--accent");
    expect(home.value).toContain("<!doctype html>");
  });

  it("escapes post titles from content", () => {
    const theme = compileTheme(starterThemeFiles());
    const site = {
      title: "S",
      description: "",
      language: "en",
      origin: "https://s.kumooo.dev",
      head: { __html: true as const, value: "<title>S</title>" },
      nav: [],
    };
    const post = theme.post(site, {
      post: {
        title: "<b>XSS</b>",
        slug: "x",
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
        url: "/x",
      },
    });
    expect(post.value).toContain("&lt;b&gt;XSS&lt;/b&gt;");
    expect(post.value).toContain("<p>Hi</p>");
  });
});
