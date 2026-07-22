import { html, raw, type Html } from "@kumooo/core";
import type { Theme, ThemeSiteContext } from "@kumooo/theme-kit";
import { renderTemplate, validateTemplate } from "./dialect.js";
import { LIMITS, REQUIRED_THEME_PATHS } from "./limits.js";
import { starterThemeFiles } from "./starter.js";
import type { ThemeFiles } from "./types.js";

export { starterThemeFiles };
export type { ThemeFiles };

function byteLength(s: string): number {
  return new TextEncoder().encode(s).length;
}

function parseThemeJson(rawJson: string): { name: string; label: string; version: number } {
  const data = JSON.parse(rawJson) as { name?: unknown; label?: unknown; version?: unknown };
  if (typeof data.name !== "string" || !data.name.trim()) throw new Error("theme.json needs a name string.");
  if (typeof data.label !== "string" || !data.label.trim()) throw new Error("theme.json needs a label string.");
  const version = typeof data.version === "number" ? data.version : 1;
  return { name: data.name.trim(), label: data.label.trim(), version };
}

export function validateThemeFiles(
  files: ThemeFiles,
): { ok: true; meta: { name: string; label: string; version: number } } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  for (const path of REQUIRED_THEME_PATHS) {
    if (!files[path as keyof ThemeFiles]?.length) errors.push(`Missing required file: ${path}`);
  }
  if (byteLength(files["styles.css"] ?? "") > LIMITS.cssBytes) {
    errors.push(`styles.css exceeds ${LIMITS.cssBytes} bytes.`);
  }
  const templateBytes = REQUIRED_THEME_PATHS.filter((p) => p.startsWith("templates/")).reduce(
    (n, p) => n + byteLength(files[p as keyof ThemeFiles] ?? ""),
    0,
  );
  if (templateBytes > LIMITS.templatesBytes) {
    errors.push(`templates exceed ${LIMITS.templatesBytes} bytes total.`);
  }
  if (files["client.js"] != null) {
    if (byteLength(files["client.js"]) > LIMITS.clientJsBytes) {
      errors.push(`client.js exceeds ${LIMITS.clientJsBytes} bytes.`);
    }
    if (/from\s+['"]https?:/i.test(files["client.js"]) || /import\s*\(\s*['"]https?:/i.test(files["client.js"])) {
      errors.push("client.js may not import remote modules.");
    }
  }

  let meta = { name: "custom", label: "Custom theme", version: 1 };
  try {
    meta = parseThemeJson(files["theme.json"] ?? "{}");
  } catch (err) {
    errors.push(err instanceof Error ? err.message : "Invalid theme.json");
  }

  for (const path of REQUIRED_THEME_PATHS.filter((p) => p.startsWith("templates/"))) {
    const src = files[path as keyof ThemeFiles] ?? "";
    const v = validateTemplate(src);
    if (!v.ok) errors.push(...v.errors.map((e) => `${path}: ${e}`));
  }

  return errors.length ? { ok: false, errors } : { ok: true, meta };
}

function siteCtx(site: ThemeSiteContext, styles: string, clientJs?: string) {
  return {
    site: {
      title: site.title,
      description: site.description,
      language: site.language,
      origin: site.origin,
    },
    nav: site.nav,
    head: site.head.value,
    styles,
    clientScript: clientJs
      ? `<script type="module">\n${clientJs}\n</script>`
      : "",
  };
}

function toHtml(value: string): Html {
  return html`${raw(value)}`;
}

export function compileTheme(files: ThemeFiles): Theme {
  const checked = validateThemeFiles(files);
  if (!checked.ok) throw new Error(checked.errors.join(" "));
  const { meta } = checked;
  const styles = files["styles.css"];
  const clientJs = files["client.js"];

  return {
    name: meta.name,
    label: meta.label,
    home(site, data) {
      const ctx = {
        ...siteCtx(site, styles, clientJs),
        posts: data.posts.map((p) => ({
          title: p.title,
          url: p.url,
          excerpt: p.excerpt ?? "",
          slug: p.slug,
        })),
        page: data.page,
        totalPages: data.totalPages,
      };
      return toHtml(renderTemplate(files["templates/home.html"], ctx));
    },
    post(site, data) {
      const p = data.post;
      const ctx = {
        ...siteCtx(site, styles, clientJs),
        title: p.title,
        excerpt: p.excerpt ?? "",
        bodyHtml: p.html,
        url: p.url,
        slug: p.slug,
      };
      return toHtml(renderTemplate(files["templates/post.html"], ctx));
    },
    page(site, data) {
      const p = data.page;
      const ctx = {
        ...siteCtx(site, styles, clientJs),
        title: p.title,
        excerpt: p.excerpt ?? "",
        bodyHtml: p.html,
        url: p.url,
        slug: p.slug,
      };
      return toHtml(renderTemplate(files["templates/page.html"], ctx));
    },
    archive(site, data) {
      const ctx = {
        ...siteCtx(site, styles, clientJs),
        title: data.title,
        posts: data.posts.map((p) => ({
          title: p.title,
          url: p.url,
          excerpt: p.excerpt ?? "",
          slug: p.slug,
        })),
      };
      return toHtml(renderTemplate(files["templates/archive.html"], ctx));
    },
    notFound(site) {
      return toHtml(renderTemplate(files["templates/notFound.html"], siteCtx(site, styles, clientJs)));
    },
  };
}
