export type Html = { readonly __html: true; readonly value: string };

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Mark a string as trusted HTML. Use sparingly. Platform-rendered bodies are fine. */
export function raw(value: string): Html {
  return { __html: true, value };
}

function interpolate(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "object" && value !== null && "__html" in value) {
    return (value as Html).value;
  }
  if (Array.isArray(value)) return value.map(interpolate).join("");
  return escapeHtml(String(value));
}

/** Escaping-by-default tagged template. */
export function html(strings: TemplateStringsArray, ...values: unknown[]): Html {
  let out = "";
  for (let i = 0; i < strings.length; i++) {
    out += strings[i];
    if (i < values.length) out += interpolate(values[i]);
  }
  return raw(out);
}

export function joinHtml(parts: Html[], sep = ""): Html {
  return raw(parts.map((p) => p.value).join(sep));
}
