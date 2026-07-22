/** Shared Kumooo brand mark (geometric k + mint dot). */

export const BRAND_MINT = "#6ee7b7";
export const BRAND_INK = "#0a0a0a";
export const BRAND_STEM = "#f5f5f5";

/** Tight content viewBox for the mark alone (no plate). */
export const MARK_VIEWBOX = "0 0 257 358";

/**
 * White stem + diagonal leg + mint circle, fitted to MARK_VIEWBOX.
 * Pass fill overrides for recoloring (badge, light surfaces, etc.).
 */
export function brandMarkInner(opts?: {
  stem?: string;
  dot?: string;
}): string {
  const stem = opts?.stem ?? BRAND_STEM;
  const dot = opts?.dot ?? BRAND_MINT;
  return [
    `<rect x="0" y="0" width="85" height="358" fill="${stem}"/>`,
    `<polygon points="85,252 133,185 134,185 147,204 161,223 174,242 187,261 201,280 214,299 228,318 241,337 255,356 256,357 156,357 155,356 142,337 129,318 116,299 103,280 90,261 90,252" fill="${stem}"/>`,
    `<circle cx="191.65" cy="155.3" r="42" fill="${dot}"/>`,
  ].join("");
}

/** Square app icon / favicon with black rounded plate. */
export function brandFaviconSvg(size = 32): string {
  const pad = size * 0.1;
  const avail = size - 2 * pad;
  const scale = Math.min(avail / 257, avail / 358);
  const mw = 257 * scale;
  const mh = 358 * scale;
  const ox = (size - mw) / 2;
  const oy = (size - mh) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" rx="${(size * 0.22).toFixed(2)}" fill="${BRAND_INK}"/><g transform="translate(${ox.toFixed(3)} ${oy.toFixed(3)}) scale(${scale.toFixed(6)})">${brandMarkInner()}</g></svg>`;
}

export function brandFaviconDataUri(): string {
  return "data:image/svg+xml," + encodeURIComponent(brandFaviconSvg(32));
}

/** Inline mark for the Made-with badge (same plate language as favicon). */
export function brandBadgeMarkSvg(): string {
  return brandFaviconSvg(32)
    .replace(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">',
      '<svg class="km-badge-mark-svg" viewBox="0 0 32 32" width="18" height="18" aria-hidden="true">',
    );
}

/** Mark-only SVG (transparent bg) for flexible embedding. */
export function brandMarkSvg(opts?: { stem?: string; dot?: string; className?: string }): string {
  const cls = opts?.className ? ` class="${opts.className}"` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${MARK_VIEWBOX}" fill="none"${cls}>${brandMarkInner(opts)}</svg>`;
}
