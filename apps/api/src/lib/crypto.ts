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

export function cookieHeader(name: string, value: string, maxAgeSec: number, domain?: string): string {
  const parts = [
    `${name}=${value}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Max-Age=${maxAgeSec}`,
  ];
  if (domain) parts.push(`Domain=${domain}`);
  return parts.join("; ");
}

export function clearCookieHeader(name: string, domain?: string): string {
  const parts = [`${name}=`, "Path=/", "HttpOnly", "Secure", "SameSite=Lax", "Max-Age=0"];
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
