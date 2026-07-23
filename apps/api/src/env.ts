export interface Env {
  DB: D1Database;
  RESEND_API_KEY?: string;
  APP_ORIGIN: string;
  API_ORIGIN: string;
  FROM_EMAIL: string;
  FROM_NAME: string;
  /** Optional reply-to, e.g. contact@kumooo.dev */
  REPLY_TO_EMAIL?: string;
  /** Set to "1" only for local wrangler dev */
  ALLOW_DEV_LINK?: string;
}

export type PlanId = "free" | "pro" | "team" | "scale";

export interface UserRow {
  id: string;
  email: string;
  plan_id: PlanId;
  created_at: string;
}

export interface SiteRow {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  status: string;
  last_deploy_at: string | null;
  created_at: string;
  updated_at: string;
}
