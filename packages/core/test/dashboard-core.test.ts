import { describe, expect, it } from "vitest";
import { scoreSeoHealth } from "../src/seo-health.js";
import { ogTemplateSchema, renderOgPayload } from "../src/og-template.js";
import { signPreviewToken, verifyPreviewToken } from "../src/preview.js";

describe("seo health", () => {
  it("scores complete metadata", () => {
    const result = scoreSeoHealth({
      title: "Hello",
      description: "A real description",
      ogImage: "https://example.com/og.png",
      canonicalUrl: "https://example.com/",
      hasSitemap: true,
      hasRobots: true,
      hasJsonLd: true,
      hasViewport: true,
    });
    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.checks.every((c) => c.ok)).toBe(true);
  });
});

describe("og template", () => {
  it("binds title and site name", () => {
    const template = ogTemplateSchema.parse({
      layout: "left",
      background: { type: "color", value: "#101218" },
      title: { text: "{{title}}", color: "#f3f1ea", size: 64 },
      subtitle: { text: "{{siteName}}", color: "#9a968c", size: 28 },
    });
    const payload = renderOgPayload(template, {
      title: "Ship tonight",
      siteName: "Kumooo",
      excerpt: "",
      featuredImage: null,
      hostname: "demo.kumooo.dev",
    });
    expect(payload.title).toBe("Ship tonight");
    expect(payload.subtitle).toBe("Kumooo");
    expect(payload.width).toBe(1200);
    expect(payload.height).toBe(630);
  });
});

describe("preview tokens", () => {
  it("round-trips and rejects expiry", async () => {
    const secret = "test-secret-at-least-32-chars-long!!";
    const token = await signPreviewToken(
      { siteId: "site_1", contentId: "cnt_1", exp: Math.floor(Date.now() / 1000) + 60 },
      secret,
    );
    const payload = await verifyPreviewToken(token, secret);
    expect(payload.siteId).toBe("site_1");

    const expired = await signPreviewToken(
      { siteId: "site_1", contentId: "cnt_1", exp: Math.floor(Date.now() / 1000) - 10 },
      secret,
    );
    await expect(verifyPreviewToken(expired, secret)).rejects.toThrow(/expired/i);
  });
});
