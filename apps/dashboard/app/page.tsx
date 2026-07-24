"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, FadeIn } from "@kumooo/ui";
import { Shell } from "@/components/shell";
import { client, type Me, type Quota, type SiteItem } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();
  const [me, setMe] = React.useState<Me | null>(null);
  const [sites, setSites] = React.useState<SiteItem[]>([]);
  const [quota, setQuota] = React.useState<Quota | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user = await client.me();
        if (cancelled) return;
        setMe(user);
        const data = await client.listSites();
        if (cancelled) return;
        setSites(data.sites);
        setQuota(data.quota);
      } catch {
        if (!cancelled) router.replace("/login");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!me || !quota) {
    return <main className="grid min-h-screen place-items-center text-[var(--fog)]">Loading...</main>;
  }

  const sitesLabel =
    quota.sitesLimit == null ? `${quota.sitesUsed} sites` : `${quota.sitesUsed} / ${quota.sitesLimit} sites`;

  return (
    <Shell email={me.email}>
      <FadeIn>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.03em]">Sites</h1>
            <p className="mt-2 text-sm text-[var(--fog)]">
              <span className="rounded-full border border-[var(--line)] px-2.5 py-0.5 text-[var(--mint)]">
                {quota.planName}
              </span>{" "}
               |  {sitesLabel}  |  {quota.mediaUsedLabel} / {quota.mediaLimitLabel} media
            </p>
          </div>
          <Button asChild className="rounded-full bg-[var(--fg)] text-[var(--bg)] hover:opacity-90">
            <Link href="/sites/new">New site</Link>
          </Button>
        </div>

        {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}

        {sites.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-[var(--line)] px-6 py-14 text-center">
            <p className="text-lg font-medium tracking-[-0.02em]">No sites yet</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--fog)]">
              Nimbus includes two sites on {"{slug}"}.kumooo.site and 150 MB of media.
            </p>
            <Button asChild className="mt-6 rounded-full bg-[var(--fg)] text-[var(--bg)] hover:opacity-90">
              <Link href="/sites/new">Create your first site</Link>
            </Button>
          </div>
        ) : (
          <ul className="mt-10 space-y-3">
            {sites.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/sites/${s.id}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--line)] bg-[var(--bg-2)] px-5 py-4 no-underline transition-colors hover:border-[var(--mint)]/40"
                >
                  <div>
                    <p className="font-medium text-[var(--fg)]">{s.name}</p>
                    <p className="mt-0.5 font-mono text-xs text-[var(--fog)]">{s.url}</p>
                  </div>
                  <span className="text-xs uppercase tracking-wide text-[var(--fog)]">{s.status}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </FadeIn>
    </Shell>
  );
}
