"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@kumooo/ui";
import { Shell } from "@/components/shell";
import { client, type Me, type SiteItem } from "@/lib/api";

export default function SiteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [me, setMe] = React.useState<Me | null>(null);
  const [siteRow, setSiteRow] = React.useState<(SiteItem & { deployHint?: string }) | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user = await client.me();
        if (cancelled) return;
        setMe(user);
        const s = await client.getSite(id);
        if (!cancelled) setSiteRow(s);
      } catch {
        if (!cancelled) router.replace("/login");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, router]);

  async function remove() {
    if (!confirm("Delete this site reservation?")) return;
    await client.deleteSite(id);
    router.replace("/");
  }

  if (!me || !siteRow) {
    return <main className="grid min-h-screen place-items-center text-[var(--fog)]">Loading…</main>;
  }

  return (
    <Shell email={me.email}>
      <Link href="/" className="text-sm text-[var(--fog)] hover:text-[var(--fg)]">
        ← Sites
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">{siteRow.name}</h1>
      <p className="mt-2 font-mono text-sm text-[var(--mint)]">{siteRow.url}</p>
      <dl className="mt-8 space-y-3 text-sm">
        <div className="flex gap-3">
          <dt className="w-28 text-[var(--fog)]">Status</dt>
          <dd className="text-[var(--fg)]">{siteRow.status}</dd>
        </div>
        <div className="flex gap-3">
          <dt className="w-28 text-[var(--fog)]">Last deploy</dt>
          <dd className="text-[var(--fg)]">{siteRow.lastDeployAt ?? "Not yet"}</dd>
        </div>
      </dl>
      <p className="mt-8 max-w-lg text-sm leading-relaxed text-[var(--fog)]">
        {siteRow.deployHint ??
          "Deploy uploads land next. Your slug is reserved on Free."}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild className="rounded-full bg-[var(--fg)] text-[var(--bg)] hover:opacity-90">
          <a href={siteRow.url} rel="noreferrer" target="_blank">
            Open site
          </a>
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-full border-[var(--line)] text-[var(--fog)] hover:bg-white/5"
          onClick={remove}
        >
          Delete
        </Button>
      </div>
    </Shell>
  );
}
