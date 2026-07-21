export async function bumpCacheVersion(kv: KVNamespace, siteId: string): Promise<number> {
  const key = `cachever:${siteId}`;
  const current = Number((await kv.get(key)) ?? "0");
  const next = current + 1;
  await kv.put(key, String(next));
  return next;
}
