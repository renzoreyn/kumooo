import { useEffect, useMemo, useState } from "react";
import {
  insertCallout,
  insertCodeFence,
  insertHeading,
  insertList,
  insertTable,
  type InsertResult,
  type TextSelection,
} from "@kumooo/core";

const COMMANDS = [
  { id: "h2", label: "Heading", run: (s: TextSelection) => insertHeading(s, 2) },
  { id: "ul", label: "Bullet list", run: (s: TextSelection) => insertList(s, false) },
  { id: "ol", label: "Numbered list", run: (s: TextSelection) => insertList(s, true) },
  { id: "code", label: "Code block", run: (s: TextSelection) => insertCodeFence(s, "") },
  { id: "table", label: "Table", run: insertTable },
  { id: "callout", label: "Callout", run: insertCallout },
] as const;

export function SlashMenu({
  open,
  query,
  onClose,
  onPick,
}: {
  open: boolean;
  query: string;
  onClose: () => void;
  onPick: (resultFactory: (selection: TextSelection) => InsertResult) => void;
}) {
  const [active, setActive] = useState(0);
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return COMMANDS.filter((c) => c.label.toLowerCase().includes(q) || c.id.includes(q));
  }, [query]);

  useEffect(() => setActive(0), [query, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => Math.min(filtered.length - 1, i + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const cmd = filtered[active];
        if (cmd) onPick(cmd.run);
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, filtered, active, onClose, onPick]);

  if (!open || filtered.length === 0) return null;

  return (
    <div
      className="card"
      role="listbox"
      style={{
        position: "absolute",
        zIndex: 15,
        width: 240,
        padding: "0.35rem",
        marginTop: "0.35rem",
      }}
    >
      {filtered.map((cmd, i) => (
        <button
          key={cmd.id}
          type="button"
          className="btn ghost"
          role="option"
          aria-selected={i === active}
          style={{
            width: "100%",
            justifyContent: "flex-start",
            background: i === active ? "var(--sidebar)" : "transparent",
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            onPick(cmd.run);
          }}
        >
          {cmd.label}
        </button>
      ))}
    </div>
  );
}
