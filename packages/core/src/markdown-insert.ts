export type TextSelection = {
  value: string;
  selectionStart: number;
  selectionEnd: number;
};

export type InsertResult = {
  value: string;
  selectionStart: number;
  selectionEnd: number;
};

/** Insert or wrap text at the current selection. */
export function insertAtSelection(
  input: TextSelection,
  before: string,
  after = "",
  placeholder = "",
): InsertResult {
  const { value, selectionStart, selectionEnd } = input;
  const selected = value.slice(selectionStart, selectionEnd);
  const body = selected.length > 0 ? selected : placeholder;
  const next = value.slice(0, selectionStart) + before + body + after + value.slice(selectionEnd);
  const start = selectionStart + before.length;
  return {
    value: next,
    selectionStart: start,
    selectionEnd: start + body.length,
  };
}

/** Insert a block on its own line(s), preserving surrounding newlines. */
export function insertBlock(input: TextSelection, block: string): InsertResult {
  const { value, selectionStart, selectionEnd } = input;
  const beforeChar = selectionStart > 0 ? value[selectionStart - 1] : "\n";
  const afterChar = selectionEnd < value.length ? value[selectionEnd] : "\n";
  const prefix = beforeChar === "\n" || selectionStart === 0 ? "" : "\n\n";
  const suffix = afterChar === "\n" || selectionEnd === value.length ? "" : "\n\n";
  const chunk = `${prefix}${block}${suffix}`;
  const next = value.slice(0, selectionStart) + chunk + value.slice(selectionEnd);
  const cursor = selectionStart + chunk.length;
  return { value: next, selectionStart: cursor, selectionEnd: cursor };
}

export function wrapInline(input: TextSelection, marker: string, placeholder: string): InsertResult {
  return insertAtSelection(input, marker, marker, placeholder);
}

export function insertHeading(input: TextSelection, level: 1 | 2 | 3): InsertResult {
  const hashes = "#".repeat(level);
  return insertBlock(input, `${hashes} Heading`);
}

export function insertLink(input: TextSelection): InsertResult {
  return insertAtSelection(input, "[", "](https://)", "link text");
}

export function insertImage(input: TextSelection, url: string, alt = "image"): InsertResult {
  return insertBlock(input, `![${alt}](${url})`);
}

export function insertCodeFence(input: TextSelection, lang = ""): InsertResult {
  return insertBlock(input, "```" + lang + "\ncode\n```");
}

export function insertTable(input: TextSelection): InsertResult {
  return insertBlock(input, "| Column | Column |\n| --- | --- |\n| Cell | Cell |");
}

export function insertCallout(input: TextSelection): InsertResult {
  return insertBlock(input, "> **Note**\n> Something worth calling out.");
}

export function insertList(input: TextSelection, ordered = false): InsertResult {
  return insertBlock(input, ordered ? "1. Item" : "- Item");
}
