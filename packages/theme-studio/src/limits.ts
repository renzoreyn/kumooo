export const LIMITS = {
  cssBytes: 256 * 1024,
  templatesBytes: 256 * 1024,
  clientJsBytes: 128 * 1024,
} as const;

/** Triple-stash keys that may emit unescaped HTML from the platform or validated theme assets. */
export const TRUSTED_TRIPLE_KEYS = new Set(["bodyHtml", "head", "styles", "clientScript"]);

export const REQUIRED_THEME_PATHS = [
  "theme.json",
  "styles.css",
  "templates/home.html",
  "templates/post.html",
  "templates/page.html",
  "templates/archive.html",
  "templates/notFound.html",
] as const;

export const OPTIONAL_THEME_PATHS = ["client.js"] as const;

export const ALLOWED_THEME_PATHS = new Set<string>([
  ...REQUIRED_THEME_PATHS,
  ...OPTIONAL_THEME_PATHS,
]);
