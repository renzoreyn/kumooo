const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

/** Stripe-style prefixed IDs: `site_…`, `cnt_…`. Readable in logs, unguessable. */
export function newId(prefix: string, bytes = 12): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  let out = "";
  for (const b of arr) out += ALPHABET[b! % ALPHABET.length];
  return `${prefix}_${out}`;
}
