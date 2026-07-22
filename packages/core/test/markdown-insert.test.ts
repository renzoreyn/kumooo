import { describe, expect, it } from "vitest";
import {
  insertAtSelection,
  insertBlock,
  insertHeading,
  insertImage,
  insertLink,
  wrapInline,
} from "../src/markdown-insert.js";

describe("markdown insert", () => {
  it("wraps selection with markers", () => {
    const result = wrapInline(
      { value: "hello world", selectionStart: 6, selectionEnd: 11 },
      "**",
      "text",
    );
    expect(result.value).toBe("hello **world**");
    expect(result.selectionStart).toBe(8);
    expect(result.selectionEnd).toBe(13);
  });

  it("inserts placeholder when selection is empty", () => {
    const result = insertAtSelection(
      { value: "ab", selectionStart: 1, selectionEnd: 1 },
      "[",
      "](url)",
      "link",
    );
    expect(result.value).toBe("a[link](url)b");
  });

  it("inserts heading as a block", () => {
    const result = insertHeading({ value: "intro", selectionStart: 5, selectionEnd: 5 }, 2);
    expect(result.value).toContain("\n\n## Heading");
  });

  it("inserts link and image helpers", () => {
    const link = insertLink({ value: "", selectionStart: 0, selectionEnd: 0 });
    expect(link.value).toBe("[link text](https://)");
    const image = insertImage({ value: "", selectionStart: 0, selectionEnd: 0 }, "/media/x.png", "alt");
    expect(image.value).toBe("![alt](/media/x.png)");
  });

  it("insertBlock adds spacing between paragraphs", () => {
    const result = insertBlock(
      { value: "one\n\ntwo", selectionStart: 3, selectionEnd: 3 },
      "- Item",
    );
    expect(result.value).toBe("one\n\n- Item\n\ntwo");
  });
});
