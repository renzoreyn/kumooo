export function newId(prefix: string): string {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${prefix}_${hex}`;
}

export function randomToken(bytes = 32): string {
  const buf = crypto.getRandomValues(new Uint8Array(bytes));
  return [...buf].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/.test(slug);
}

export function siteUrl(slug: string): string {
  return `https://${slug}.kumooo.site`;
}

export function cookieHeader(
  name: string,
  value: string,
  maxAgeSec: number,
  domain?: string,
  sameSite: "Lax" | "None" = "Lax",
): string {
  const parts = [
    `${name}=${value}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    `SameSite=${sameSite}`,
    `Max-Age=${maxAgeSec}`,
  ];
  if (domain) parts.push(`Domain=${domain}`);
  return parts.join("; ");
}

export function clearCookieHeader(
  name: string,
  domain?: string,
  sameSite: "Lax" | "None" = "Lax",
): string {
  const parts = [`${name}=`, "Path=/", "HttpOnly", "Secure", `SameSite=${sameSite}`, "Max-Age=0"];
  if (domain) parts.push(`Domain=${domain}`);
  return parts.join("; ");
}

export const SESSION_COOKIE = "kumooo_session";
export const OTP_TTL_MS = 10 * 60 * 1000;
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const SESSION_SHORT_TTL_MS = 12 * 60 * 60 * 1000;
export const OTP_REQUEST_LIMIT = 5;
export const OTP_MAX_ATTEMPTS = 5;

/** Six-digit numeric OTP, zero-padded. */
export function generateOtpCode(): string {
  const buf = crypto.getRandomValues(new Uint8Array(4));
  const n = new DataView(buf.buffer).getUint32(0, false) % 1_000_000;
  return String(n).padStart(6, "0");
}

export function isValidOtpCode(code: string): boolean {
  return /^\d{6}$/.test(code);
}

const PBKDF2_ITERATIONS = 100_000;
const MIN_PASSWORD_LEN = 8;
const MAX_PASSWORD_LEN = 128;

export function isValidPassword(password: string): boolean {
  return password.length >= MIN_PASSWORD_LEN && password.length <= MAX_PASSWORD_LEN;
}

function bytesToHex(buf: ArrayBuffer | Uint8Array): string {
  const arr = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return [...arr].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

/** Format: pbkdf2$iterations$saltHex$hashHex */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt.buffer as ArrayBuffer, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    256,
  );
  return `pbkdf2$${PBKDF2_ITERATIONS}$${bytesToHex(salt)}$${bytesToHex(bits)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = Number(parts[1]);
  if (!Number.isFinite(iterations) || iterations < 10_000) return false;
  const saltHex = parts[2];
  const expected = parts[3];
  if (!saltHex || !expected) return false;
  const salt = hexToBytes(saltHex);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt.buffer as ArrayBuffer, iterations, hash: "SHA-256" },
    keyMaterial,
    256,
  );
  const got = bytesToHex(bits);
  if (got.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < got.length; i++) diff |= got.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}
