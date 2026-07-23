const PROD_API = "https://api.kumooo.dev";

function resolveApiUrl(): string {
  // Production client bundles must never depend on OpenNext/.dev.vars env injection.
  if (process.env.NODE_ENV === "production") return PROD_API;

  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  return raw || "http://127.0.0.1:8787";
}

export const site = {
  name: "kumooo",
  marketing: "https://kumooo.dev",
  docs: "https://docs.kumooo.dev",
  /** Local override: `.env.development.local`. Production always uses api.kumooo.dev. */
  api: resolveApiUrl(),
} as const;
