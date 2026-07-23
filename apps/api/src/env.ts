export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  MEDIA: R2Bucket;
  ENVIRONMENT: string;
  PUBLIC_SITE_SUFFIX: string;
  DASHBOARD_ORIGIN: string;
  /** Site cap per org. 0 or negative = unlimited (self-host). Default free = 2. */
  MAX_SITES_PER_ORG?: string;
  TURNSTILE_SECRET_KEY?: string;
  CF_API_TOKEN?: string;
  CF_ZONE_ID?: string;
  PREVIEW_SIGNING_SECRET?: string;
}

export type AppVariables = {
  requestId: string;
  db: import("@kumooo/db").Db;
  user: { id: string; email: string; name: string } | null;
  sessionToken: string | null;
};

export type AppEnv = { Bindings: Env; Variables: AppVariables };
