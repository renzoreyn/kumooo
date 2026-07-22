import { describe, expect, it } from "vitest";
import { resolveThemeId } from "../src/theme-id.js";

describe("resolveThemeId", () => {
  it("maps default and empty to haru", () => {
    expect(resolveThemeId("default")).toBe("haru");
    expect(resolveThemeId("")).toBe("haru");
    expect(resolveThemeId(null)).toBe("haru");
  });

  it("passes through season ids", () => {
    expect(resolveThemeId("natsu")).toBe("natsu");
    expect(resolveThemeId("aki")).toBe("aki");
    expect(resolveThemeId("fuyu")).toBe("fuyu");
  });
});
