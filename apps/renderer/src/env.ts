export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  MEDIA: R2Bucket;
  ENVIRONMENT: string;
  PUBLIC_SITE_SUFFIX: string;
  PREVIEW_SIGNING_SECRET?: string;
  /** Service binding to kumooo-api for api.kumooo.dev pass-through. */
  API: Fetcher;
}
