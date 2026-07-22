import { describe, expect, it } from "vitest";
import { renderTemplate, validateTemplate } from "../src/dialect.js";

describe("dialect", () => {
  it("escapes double-stash user fields", () => {
    const html = renderTemplate("<h1>{{title}}</h1>", { title: "<script>alert(1)</script>" });
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
  });

  it("allows trusted triple-stash for bodyHtml only", () => {
    expect(validateTemplate("{{{bodyHtml}}}").ok).toBe(true);
    expect(validateTemplate("{{{title}}}").ok).toBe(false);
  });

  it("renders #posts loops", () => {
    const html = renderTemplate("{{#posts}}<li>{{title}}</li>{{/posts}}", {
      posts: [{ title: "A" }, { title: "B" }],
    });
    expect(html).toContain("<li>A</li>");
    expect(html).toContain("<li>B</li>");
  });

  it("rejects unclosed sections", () => {
    const v = validateTemplate("{{#posts}}hi");
    expect(v.ok).toBe(false);
  });
});
