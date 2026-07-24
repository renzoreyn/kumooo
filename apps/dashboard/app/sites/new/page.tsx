"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SKIN_LABELS, SKINS, type SkinId } from "@kumooo/theme-packs";
import { Button, Input } from "@kumooo/ui";
import { Shell } from "@/components/shell";
import { client, type Me } from "@/lib/api";

function NewSiteForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [me, setMe] = React.useState<Me | null>(null);
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [skin, setSkin] = React.useState<SkinId>("kumooo");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    client
      .me()
      .then(setMe)
      .catch(() => router.replace("/login"));
  }, [router]);

  React.useEffect(() => {
    const q = params.get("slug");
    if (q && /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/.test(q)) {
      setSlug(q);
      if (!name) setName(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed once from URL
  }, [params]);

  function onName(value: string) {
    setName(value);
    setSlug(slugify(value));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const site = await client.createSite({ name, slug, skin });
      router.push(`/sites/${site.id}`);
    } catch (err) {
      const code = err instanceof Error ? err.message : "";
      setError(
        code === "site_limit"
          ? "Site limit for your plan."
          : code === "slug_taken"
            ? "Taken. Pick another."
            : code === "slug_reserved"
              ? "Reserved for demos (blank, blog, shop). Pick another."
              : code === "invalid_slug"
                ? "Lowercase letters, numbers, hyphens. Be boring."
                : "Could not create site.",
      );
      setBusy(false);
    }
  }

  if (!me) return <main className="grid min-h-screen place-items-center text-[var(--fog)]">Loading...</main>;

  return (
    <Shell email={me.email}>
      <h1 className="text-3xl font-semibold tracking-[-0.03em]">New site</h1>
      <p className="mt-2 text-sm text-[var(--fog)]">
        Reserves <span className="font-mono text-[var(--fg)]">{"{slug}.kumooo.site"}</span>. Deploy is a separate
        argument for later.
      </p>
      <form onSubmit={onSubmit} className="mt-8 max-w-md space-y-4">
        <div>
          <label className="mb-1.5 block text-sm text-[var(--fog)]" htmlFor="name">
            Name
          </label>
          <Input
            id="name"
            required
            value={name}
            onChange={(e) => onName(e.target.value)}
            className="border-[var(--line)] bg-[var(--bg-2)]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-[var(--fog)]" htmlFor="slug">
            Slug
          </label>
          <Input
            id="slug"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
            className="border-[var(--line)] bg-[var(--bg-2)] font-mono"
          />
          <p className="mt-1.5 font-mono text-xs text-[var(--fog)]">{slug || "slug"}.kumooo.site</p>
        </div>
        <div>
          <p className="mb-1.5 text-sm text-[var(--fog)]">Skin</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Site skin">
            {SKINS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setSkin(id)}
                aria-pressed={skin === id}
                className={`rounded-full border px-4 py-2 text-xs font-semibold tracking-wide transition ${
                  skin === id
                    ? "border-[var(--mint)] bg-[var(--mint)]/15 text-[var(--mint)]"
                    : "border-[var(--line)] text-[var(--fog)] hover:border-[var(--fog)] hover:text-[var(--fg)]"
                }`}
              >
                {SKIN_LABELS[id]}
              </button>
            ))}
          </div>
        </div>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <Button
          type="submit"
          disabled={busy}
          className="rounded-full bg-[var(--fg)] text-[var(--bg)] hover:opacity-90"
        >
          {busy ? "Creating..." : "Create site"}
        </Button>
      </form>
    </Shell>
  );
}

export default function NewSitePage() {
  return (
    <React.Suspense fallback={<main className="grid min-h-screen place-items-center text-[var(--fog)]">Loading...</main>}>
      <NewSiteForm />
    </React.Suspense>
  );
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}
