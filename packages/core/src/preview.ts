export type PreviewTokenPayload = {
  siteId: string;
  contentId?: string;
  theme?: string;
  /** Unix seconds */
  exp: number;
};

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(padded);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

function textToBytes(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function asBufferSource(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    asBufferSource(textToBytes(secret)),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function sign(data: string, secret: string): Promise<string> {
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, asBufferSource(textToBytes(data)));
  return bytesToBase64Url(new Uint8Array(sig));
}

async function verifySig(data: string, signature: string, secret: string): Promise<boolean> {
  const key = await hmacKey(secret);
  return crypto.subtle.verify(
    "HMAC",
    key,
    asBufferSource(base64UrlToBytes(signature)),
    asBufferSource(textToBytes(data)),
  );
}

/** Sign a short-lived draft preview token (HMAC-SHA256). */
export async function signPreviewToken(payload: PreviewTokenPayload, secret: string): Promise<string> {
  if (!secret || secret.length < 16) throw new Error("Preview signing secret is too short.");
  const body = bytesToBase64Url(textToBytes(JSON.stringify(payload)));
  const signature = await sign(body, secret);
  return `${body}.${signature}`;
}

/** Verify a preview token and reject expired payloads. */
export async function verifyPreviewToken(token: string, secret: string): Promise<PreviewTokenPayload> {
  const [body, signature] = token.split(".");
  if (!body || !signature) throw new Error("Invalid preview token.");
  const ok = await verifySig(body, signature, secret);
  if (!ok) throw new Error("Invalid preview token signature.");

  const json = new TextDecoder().decode(base64UrlToBytes(body));
  const payload = JSON.parse(json) as PreviewTokenPayload;
  if (!payload.siteId || typeof payload.exp !== "number") {
    throw new Error("Invalid preview token payload.");
  }
  if (payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Preview token expired.");
  }
  return payload;
}
