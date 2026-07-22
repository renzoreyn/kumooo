import { brandFaviconDataUri } from "@kumooo/theme-kit";

/** Default brand mark when a site has no uploaded favicon. */
export const DEFAULT_FAVICON_HREF = brandFaviconDataUri();

export function faviconLinkTag(href: string = DEFAULT_FAVICON_HREF): string {
  return `<link rel="icon" href="${href}" type="image/svg+xml">`;
}
