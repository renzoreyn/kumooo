export function cacheKeyFor(siteId: string, version: number, url: URL): Request {
  return new Request(`https://cache.kumooo.internal/v${version}/${siteId}${url.pathname}${url.search}`);
}

export async function getSiteVersion(env: { KV: KVNamespace }, siteId: string): Promise<number> {
  return Number((await env.KV.get(`cachever:${siteId}`)) ?? "0");
}

export async function cachedResponse(cacheKey: Request): Promise<Response | null> {
  const cache = (caches as unknown as { default: Cache }).default;
  const hit = await cache.match(cacheKey);
  if (!hit) return null;
  const res = new Response(hit.body, hit);
  res.headers.set("X-Kumooo-Cache", "hit");
  return res;
}

export function storeInCache(ctx: ExecutionContext, cacheKey: Request, response: Response): Response {
  const cache = (caches as unknown as { default: Cache }).default;
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "public, max-age=3600");
  headers.set("X-Kumooo-Cache", "miss");
  const toStore = new Response(response.body, { status: response.status, headers });
  const out = toStore.clone();
  ctx.waitUntil(cache.put(cacheKey, toStore));
  return out;
}
