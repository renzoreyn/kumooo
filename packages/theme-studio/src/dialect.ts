import { escapeHtml } from "@kumooo/core";
import { TRUSTED_TRIPLE_KEYS } from "./limits.js";

export type TemplateContext = Record<string, unknown>;

const TAG_RE = /\{\{\{?\s*([/#]?)([\w.]+)\s*\}?\}\}/g;
const ILLEGAL_EXPR = /[()=`]|javascript:/i;

function lookup(ctx: TemplateContext, path: string): unknown {
  const parts = path.split(".");
  let cur: unknown = ctx;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

function asString(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

/**
 * Validate mustache-style tags. Rejects JS-like expressions and untrusted triple-stash.
 */
export function validateTemplate(source: string): { ok: true } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  if (ILLEGAL_EXPR.test(source.replace(/\{\{\{?[\s\S]*?\}?\}\}/g, ""))) {
    // Only flag illegal chars outside of simple tags by scanning tag interiors below.
  }

  const stack: string[] = [];
  const re = /\{\{\{\s*([\w.]+)\s*\}\}\}|\{\{\s*([/#]?)([\w.]+)\s*\}\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source))) {
    if (m[1]) {
      const key = m[1];
      if (!TRUSTED_TRIPLE_KEYS.has(key)) {
        errors.push(`Untrusted triple-stash {{{${key}}}}. Allowed: ${[...TRUSTED_TRIPLE_KEYS].join(", ")}.`);
      }
      continue;
    }
    const sigil = m[2] ?? "";
    const name = m[3] ?? "";
    if (!name || ILLEGAL_EXPR.test(name)) {
      errors.push(`Illegal tag near {{${sigil}${name}}}.`);
      continue;
    }
    if (sigil === "#") stack.push(name);
    else if (sigil === "/") {
      const open = stack.pop();
      if (open !== name) {
        errors.push(`Mismatched section close {{/${name}}} (open: ${open ?? "none"}).`);
      }
    }
  }
  if (stack.length) errors.push(`Unclosed section(s): ${stack.join(", ")}.`);

  // Ban any leftover complex mustache we did not parse as simple tags.
  const stripped = source
    .replace(/\{\{\{\s*[\w.]+\s*\}\}\}/g, "")
    .replace(/\{\{\s*[/#]?[\w.]+\s*\}\}/g, "");
  if (stripped.includes("{{") || stripped.includes("}}")) {
    errors.push("Unsupported template syntax. Use {{path}}, {{{bodyHtml|head}}}, or {{#name}}…{{/name}}.");
  }

  return errors.length ? { ok: false, errors } : { ok: true };
}

type Segment =
  | { type: "text"; value: string }
  | { type: "var"; path: string; raw: boolean }
  | { type: "section"; name: string; children: Segment[] };

function parse(source: string): Segment[] {
  const root: Segment[] = [];
  const stack: { name: string; children: Segment[] }[] = [{ name: "", children: root }];
  const re = /\{\{\{\s*([\w.]+)\s*\}\}\}|\{\{\s*([/#]?)([\w.]+)\s*\}\}/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source))) {
    const cur = stack[stack.length - 1]!;
    if (m.index > last) cur.children.push({ type: "text", value: source.slice(last, m.index) });
    if (m[1]) {
      cur.children.push({ type: "var", path: m[1], raw: true });
    } else if (m[2] === "#") {
      const sec = { name: m[3]!, children: [] as Segment[] };
      cur.children.push({ type: "section", name: sec.name, children: sec.children });
      stack.push(sec);
    } else if (m[2] === "/") {
      stack.pop();
    } else {
      cur.children.push({ type: "var", path: m[3]!, raw: false });
    }
    last = m.index + m[0].length;
  }
  if (last < source.length) root.push({ type: "text", value: source.slice(last) });
  return root;
}

function renderSegments(segments: Segment[], ctx: TemplateContext): string {
  let out = "";
  for (const seg of segments) {
    if (seg.type === "text") {
      out += seg.value;
      continue;
    }
    if (seg.type === "var") {
      const v = lookup(ctx, seg.path);
      out += seg.raw ? asString(v) : escapeHtml(asString(v));
      continue;
    }
    const value = lookup(ctx, seg.name);
    if (Array.isArray(value)) {
      for (const item of value) {
        const childCtx: TemplateContext =
          item && typeof item === "object"
            ? { ...ctx, ...(item as TemplateContext) }
            : { ...ctx, ".": item };
        out += renderSegments(seg.children, childCtx);
      }
    } else if (value) {
      const childCtx =
        value && typeof value === "object"
          ? { ...ctx, ...(value as TemplateContext) }
          : ctx;
      out += renderSegments(seg.children, childCtx);
    }
  }
  return out;
}

export function renderTemplate(source: string, ctx: TemplateContext): string {
  const check = validateTemplate(source);
  if (!check.ok) {
    throw new Error(check.errors.join(" "));
  }
  return renderSegments(parse(source), ctx);
}

// Silence unused if tree-shaken differently
void TAG_RE;
