import type { RefObject } from "react";
import {
  Bold,
  Code,
  Heading2,
  Image,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Table,
} from "lucide-react";
import {
  insertCallout,
  insertCodeFence,
  insertHeading,
  insertImage,
  insertLink,
  insertList,
  insertTable,
  wrapInline,
  type InsertResult,
} from "@kumooo/core";
import { Button } from "../../components/ui";

function readSelection(el: HTMLTextAreaElement) {
  return {
    value: el.value,
    selectionStart: el.selectionStart,
    selectionEnd: el.selectionEnd,
  };
}

function apply(el: HTMLTextAreaElement, result: InsertResult, onChange: (value: string) => void) {
  onChange(result.value);
  requestAnimationFrame(() => {
    el.focus();
    el.setSelectionRange(result.selectionStart, result.selectionEnd);
  });
}

export function MarkdownToolbar({
  textareaRef,
  value,
  onChange,
  onInsertImage,
}: {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
  onInsertImage?: () => void;
}) {
  function run(fn: (input: ReturnType<typeof readSelection>) => InsertResult) {
    const el = textareaRef.current;
    if (!el) return;
    apply(el, fn(readSelection(el)), onChange);
  }

  return (
    <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginBottom: "0.65rem" }}>
      <Button type="button" aria-label="Bold" onClick={() => run((s) => wrapInline(s, "**", "bold"))}>
        <Bold size={16} />
      </Button>
      <Button type="button" aria-label="Italic" onClick={() => run((s) => wrapInline(s, "*", "italic"))}>
        <Italic size={16} />
      </Button>
      <Button type="button" aria-label="Heading" onClick={() => run((s) => insertHeading(s, 2))}>
        <Heading2 size={16} />
      </Button>
      <Button type="button" aria-label="Link" onClick={() => run(insertLink)}>
        <Link2 size={16} />
      </Button>
      <Button
        type="button"
        aria-label="Image"
        onClick={() => {
          if (onInsertImage) onInsertImage();
          else {
            const url = window.prompt("Image URL");
            if (!url) return;
            run((s) => insertImage(s, url));
          }
        }}
      >
        <Image size={16} />
      </Button>
      <Button type="button" aria-label="Bullet list" onClick={() => run((s) => insertList(s, false))}>
        <List size={16} />
      </Button>
      <Button type="button" aria-label="Numbered list" onClick={() => run((s) => insertList(s, true))}>
        <ListOrdered size={16} />
      </Button>
      <Button type="button" aria-label="Code" onClick={() => run((s) => insertCodeFence(s, "ts"))}>
        <Code size={16} />
      </Button>
      <Button type="button" aria-label="Table" onClick={() => run(insertTable)}>
        <Table size={16} />
      </Button>
      <Button type="button" aria-label="Callout" onClick={() => run(insertCallout)}>
        <Quote size={16} />
      </Button>
      <span className="muted" style={{ alignSelf: "center", fontSize: "0.8rem" }}>
        Tip: type / for inserts
      </span>
      {/* keep value referenced for future selection sync */}
      <span hidden>{value.length}</span>
    </div>
  );
}
