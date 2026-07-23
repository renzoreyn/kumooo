"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@kumooo/ui";
import { Shell } from "@/components/shell";
import { client, type Me } from "@/lib/api";

export default function NewSitePage() {
  const router = useRouter();
  const [me, setMe] = React.useState<Me | null>(null);
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    client
      .me()
      .then(setMe)
      .catch(() => router.replace("/login"));
  }, [router]);

  function onName(value: string) {
    setName(value);
    setSlug(slugify(value));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const site = await client.createSite({ name, slug });
      router.replace(`/sites/${site.id}`);
    } catch (err) {
      const code = err instanceof Error ? err.message : "failed";
      setError(
        code === "site_limit"
          ? "Free plan allows 2 sites. Delete one or wait for Pro."
          : code === "slug_taken"
            ? "That slug is taken."
            : code === "invalid_slug"
              ? "Use lowercase letters, numbers, and hyphens."
              : "Could not create site.",
      );
      setBusy(false);
    }
  }

  if (!me) return <main className="grid min-h-screen place-items-center text-[var(--fog)]">Loadingâ€?/main>;

  return (
    <Shell email={me.email}>
      <h1 className="text-3xl font-semibold tracking-[-0.03em]">New site</h1>
      <p className="mt-2 text-sm text-[var(--fog)]">
        Reserves <span className="font-mono text-[var(--fg)]">{"{slug}.kumooo.site"}</span> on Free.
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
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <Button
          type="submit"
          disabled={busy}
          className="rounded-full bg-[var(--fg)] text-[var(--bg)] hover:opacity-90"
        >
          {busy ? "Creatingâ€? : "Create site"}
        </Button>
      </form>
    </Shell>
  );
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}
