import { describe, expect, it } from "vitest";
import { newId } from "../src/ids.js";
import { slugify, uniqueSlug } from "../src/slug.js";
import { escapeHtml, html } from "../src/html.js";
import { renderMarkdown } from "../src/markdown.js";
import { hashPassword, verifyPassword } from "../src/crypto.js";

describe("ids", () => {
  it("prefixes and looks random", () => {
    const id = newId("site");
    expect(id.startsWith("site_")).toBe(true);
    expect(id.length).toBeGreaterThan(10);
  });
});

describe("slug", () => {
  it("slugifies titles", () => {
    expect(slugify("Hello, Cloud!")).toBe("hello-cloud");
  });
  it("dedupes", () => {
    expect(uniqueSlug("hello", new Set(["hello"]))).toBe("hello-2");
  });
});

describe("html", () => {
  it("escapes by default", () => {
    expect(html`<p>${"<script>"}</p>`.value).toContain("&lt;script&gt;");
    expect(escapeHtml(`a&b`)).toBe("a&amp;b");
  });
});

describe("markdown", () => {
  it("renders headings and bold", () => {
    const out = renderMarkdown("# Hi\n\n**bold**").value;
    expect(out).toContain("<h1");
    expect(out).toContain("<strong>bold</strong>");
  });

  it("renders GFM tables", () => {
    const md = `| Method | Path |
|---|---|
| POST | /v1/auth/login |
| GET | /v1/auth/me |`;
    const out = renderMarkdown(md).value;
    expect(out).toContain("<table>");
    expect(out).toContain("<th>Method</th>");
    expect(out).toContain("<td>POST</td>");
    expect(out).toContain("/v1/auth/login");
    expect(out).toContain("table-wrap");
    expect(out).not.toContain("|---|");
  });
});

describe("crypto", () => {
  it("hashes and verifies passwords", async () => {
    const hash = await hashPassword("correct horse battery");
    expect(await verifyPassword("correct horse battery", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });
});
