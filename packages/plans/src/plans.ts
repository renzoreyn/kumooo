export type PlanId = "free" | "pro" | "team" | "scale";

export type PlanStatus = "live" | "coming_soon" | "sales";

export type BillingInterval = "monthly" | "annual";

export interface Plan {
  id: PlanId;
  name: string;
  /** USD charged per month when billed monthly. Null = custom / free label only. */
  priceMonthlyUsd: number | null;
  /** USD per month equivalent when billed annually. Null = same as monthly or N/A. */
  priceAnnualMonthlyUsd: number | null;
  blurb: string;
  status: PlanStatus;
  sites: number | null;
  mediaBytes: number | null;
  customDomains: number | null;
  buildsPerDay: number | null;
  seats: number | null;
  support: string;
  features: string[];
}

const MB = 1024 * 1024;
const GB = 1024 * MB;

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Nimbus",
    priceMonthlyUsd: 0,
    priceAnnualMonthlyUsd: 0,
    blurb: "Learn and ship two real sites on our edge.",
    status: "live",
    sites: 2,
    mediaBytes: 150 * MB,
    customDomains: 0,
    buildsPerDay: 20,
    seats: 1,
    support: "Docs",
    features: [
      "2 sites on {slug}.kumooo.site",
      "150 MB media storage",
      "20 builds per day",
      "Fair-use bandwidth",
      "Docs support",
    ],
  },
  pro: {
    id: "pro",
    name: "Cumulus",
    priceMonthlyUsd: 7,
    priceAnnualMonthlyUsd: 5,
    blurb: "For solo builders who need a custom domain and room to grow.",
    status: "coming_soon",
    sites: 10,
    mediaBytes: 5 * GB,
    customDomains: 1,
    buildsPerDay: 100,
    seats: 1,
    support: "Email",
    features: [
      "10 sites",
      "5 GB media",
      "1 custom domain",
      "100 builds per day",
      "Email support",
    ],
  },
  team: {
    id: "team",
    name: "Stratus",
    priceMonthlyUsd: 12,
    priceAnnualMonthlyUsd: 10,
    blurb: "Studios and small agencies shipping many sites together.",
    status: "coming_soon",
    sites: 50,
    mediaBytes: 50 * GB,
    customDomains: 10,
    buildsPerDay: 500,
    seats: 5,
    support: "Priority email",
    features: [
      "50 sites",
      "50 GB media",
      "10 custom domains",
      "5 seats",
      "500 builds per day",
      "Priority email",
    ],
  },
  scale: {
    id: "scale",
    name: "Cumulonimbus",
    priceMonthlyUsd: null,
    priceAnnualMonthlyUsd: null,
    blurb: "When hosting is part of your product, not a side project.",
    status: "sales",
    sites: null,
    mediaBytes: null,
    customDomains: null,
    buildsPerDay: null,
    seats: null,
    support: "Slack + SLA",
    features: [
      "Unlimited sites (contract)",
      "Custom media and bandwidth",
      "Unlimited custom domains",
      "Dedicated support + SLA",
    ],
  },
};

export const PLAN_ORDER: PlanId[] = ["free", "pro", "team", "scale"];

export function getPlan(id: PlanId): Plan {
  return PLANS[id];
}

export function listPlans(): Plan[] {
  return PLAN_ORDER.map((id) => PLANS[id]);
}

export function priceForInterval(plan: Plan, interval: BillingInterval): number | null {
  if (plan.priceMonthlyUsd === null) return null;
  if (interval === "annual") {
    return plan.priceAnnualMonthlyUsd ?? plan.priceMonthlyUsd;
  }
  return plan.priceMonthlyUsd;
}

export function formatPriceLabel(plan: Plan, interval: BillingInterval): string {
  const amount = priceForInterval(plan, interval);
  if (amount === null) return "Custom";
  if (amount === 0) return "$0";
  if (interval === "annual") return `$${amount}/mo`;
  return `$${amount}/mo`;
}

export function formatPriceHint(plan: Plan, interval: BillingInterval): string | null {
  const amount = priceForInterval(plan, interval);
  if (amount === null || amount === 0) return null;
  if (interval === "annual") return "billed yearly";
  return null;
}

/** Whether an account on `planId` may create another site given current count. */
export function canCreateSite(planId: PlanId, currentSiteCount: number): boolean {
  const limit = PLANS[planId].sites;
  if (limit === null) return true;
  return currentSiteCount < limit;
}

export function mediaLimitBytes(planId: PlanId): number | null {
  return PLANS[planId].mediaBytes;
}

export function formatBytes(bytes: number): string {
  if (bytes >= GB) return `${Math.round(bytes / GB)} GB`;
  if (bytes >= MB) return `${Math.round(bytes / MB)} MB`;
  return `${bytes} B`;
}
