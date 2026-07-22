import { draftKey, publishedKey } from "@kumooo/theme-studio";

export { draftKey, publishedKey };

export async function putThemeFile(
  bucket: R2Bucket,
  key: string,
  body: string,
  contentType: string,
): Promise<void> {
  await bucket.put(key, body, { httpMetadata: { contentType } });
}

export async function getThemeFile(bucket: R2Bucket, key: string): Promise<string | null> {
  const obj = await bucket.get(key);
  if (!obj) return null;
  return obj.text();
}

export function contentTypeForThemePath(path: string): string {
  if (path.endsWith(".css")) return "text/css; charset=utf-8";
  if (path.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (path.endsWith(".json")) return "application/json; charset=utf-8";
  return "text/html; charset=utf-8";
}
