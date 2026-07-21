export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  MEDIA: R2Bucket;
  ENVIRONMENT: string;
  PUBLIC_SITE_SUFFIX: string;
}
