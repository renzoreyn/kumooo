const encoder = new TextEncoder();

function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function sha256Hex(input: string | ArrayBuffer): Promise<string> {
  const data = typeof input === "string" ? encoder.encode(input) : input;
  return toHex(await crypto.subtle.digest("SHA-256", data));
}

/** Constant-time string compare. Length mismatch returns false without leaking which chars differ beyond length. */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i)! ^ b.charCodeAt(i)!;
  return diff === 0;
}

const PBKDF2_ITERATIONS = 100_000;

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: PBKDF2_ITERATIONS },
    key,
    256,
  );
  return `pbkdf2_sha256$${PBKDF2_ITERATIONS}$${toHex(salt.buffer)}$${toHex(bits)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, iterStr, saltHex, hashHex] = stored.split("$");
  if (algo !== "pbkdf2_sha256" || !iterStr || !saltHex || !hashHex) return false;
  const iterations = Number(iterStr);
  if (!Number.isFinite(iterations) || iterations < 100_000) return false;

  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map((h) => parseInt(h, 16)));
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    256,
  );
  return timingSafeEqual(toHex(bits), hashHex);
}

export function randomToken(bytes = 32): string {
  const arr = crypto.getRandomValues(new Uint8Array(bytes));
  return toHex(arr.buffer);
}
