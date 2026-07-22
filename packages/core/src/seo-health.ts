export type SeoCheck = {
  id: string;
  label: string;
  ok: boolean;
  detail?: string;
};

export type SeoHealthInput = {
  title?: string | null;
  description?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
  hasSitemap: boolean;
  hasRobots: boolean;
  hasJsonLd: boolean;
  hasViewport: boolean;
};

export type SeoHealthResult = {
  score: number;
  checks: SeoCheck[];
};

function present(value: string | null | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}

/** Deterministic SEO health score from actual platform fields/endpoints. */
export function scoreSeoHealth(input: SeoHealthInput): SeoHealthResult {
  const checks: SeoCheck[] = [
    {
      id: "title",
      label: "Title exists",
      ok: present(input.title),
      detail: present(input.title) ? undefined : "Add a site or page title.",
    },
    {
      id: "description",
      label: "Description exists",
      ok: present(input.description),
      detail: present(input.description) ? undefined : "Add a meta description.",
    },
    {
      id: "ogImage",
      label: "OpenGraph image exists",
      ok: present(input.ogImage),
      detail: present(input.ogImage) ? undefined : "Set a social sharing image.",
    },
    {
      id: "canonical",
      label: "Canonical URL exists",
      ok: present(input.canonicalUrl),
      detail: present(input.canonicalUrl) ? undefined : "Set a canonical URL.",
    },
    {
      id: "sitemap",
      label: "Sitemap generated",
      ok: input.hasSitemap,
      detail: input.hasSitemap ? undefined : "Sitemap endpoint is missing.",
    },
    {
      id: "robots",
      label: "Robots file generated",
      ok: input.hasRobots,
      detail: input.hasRobots ? undefined : "Robots endpoint is missing.",
    },
    {
      id: "jsonLd",
      label: "Structured data present",
      ok: input.hasJsonLd,
      detail: input.hasJsonLd ? undefined : "JSON-LD is missing.",
    },
    {
      id: "viewport",
      label: "Mobile viewport present",
      ok: input.hasViewport,
      detail: input.hasViewport ? undefined : "Viewport meta tag is missing.",
    },
  ];

  const passed = checks.filter((c) => c.ok).length;
  const score = Math.round((100 * passed) / checks.length);
  return { score, checks };
}
