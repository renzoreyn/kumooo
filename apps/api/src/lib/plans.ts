/** Managed free plan default. Self-host uses MAX_SITES_PER_ORG=0 (unlimited). */
export const FREE_MAX_SITES = 2;

export type SitePlanLimits = {
  plan: "free" | "selfhost";
  maxSites: number | null;
  usedSites: number;
  remainingSites: number | null;
};

/** `maxSites` null or 0 means unlimited (self-host / paid later). */
export function sitePlanLimits(activeSiteCount: number, maxSites?: number | null): SitePlanLimits {
  const used = Math.max(0, activeSiteCount);
  const capped =
    maxSites === undefined || maxSites === null
      ? FREE_MAX_SITES
      : maxSites <= 0
        ? null
        : maxSites;
  const unlimited = capped === null;
  return {
    plan: unlimited ? "selfhost" : "free",
    maxSites: capped,
    usedSites: used,
    remainingSites: unlimited ? null : Math.max(0, capped - used),
  };
}

export function parseMaxSitesEnv(raw: string | undefined): number {
  if (raw === undefined || raw === "") return FREE_MAX_SITES;
  const n = Number(raw);
  if (!Number.isFinite(n)) return FREE_MAX_SITES;
  return Math.floor(n);
}

export function siteLimitMessage(limits: SitePlanLimits): string {
  if (limits.maxSites === null) {
    return "No site cap on this deployment.";
  }
  return `Free plan includes ${limits.maxSites} sites (${limits.usedSites} in use). Archive or delete one, or wait for paid plans with more sites.`;
}

export function isAtSiteLimit(limits: SitePlanLimits): boolean {
  return limits.remainingSites !== null && limits.remainingSites <= 0;
}
