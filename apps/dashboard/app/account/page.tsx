"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Shell } from "@/components/shell";
import { client, type Me, type Quota } from "@/lib/api";
import { site } from "@/lib/site";

export default function AccountPage() {
  const router = useRouter();
  const [me, setMe] = React.useState<Me | null>(null);
  const [quota, setQuota] = React.useState<Quota | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user = await client.me();
        if (cancelled) return;
        setMe(user);
        const data = await client.listSites();
        if (!cancelled) setQuota(data.quota);
      } catch {
        if (!cancelled) router.replace("/login");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!me || !quota) {
    return <main className="grid min-h-screen place-items-center text-[var(--fog)]">Loading…</main>;
  }

  return (
    <Shell email={me.email}>
      <h1 className="text-3xl font-semibold tracking-[-0.03em]">Account</h1>
      <dl className="mt-8 space-y-4 text-sm">
        <div>
          <dt className="text-[var(--fog)]">Email</dt>
          <dd className="mt-1 text-[var(--fg)]">{me.email}</dd>
        </div>
        <div>
          <dt className="text-[var(--fog)]">Plan</dt>
          <dd className="mt-1 text-[var(--fg)]">
            {quota.planName} · {quota.sitesUsed}
            {quota.sitesLimit != null ? ` / ${quota.sitesLimit}` : ""} sites · {quota.mediaUsedLabel} /{" "}
            {quota.mediaLimitLabel}
          </dd>
        </div>
      </dl>
      <p className="mt-8 max-w-md text-sm leading-relaxed text-[var(--fog)]">
        Pro and Team billing come next. See{" "}
        <a href={`${site.marketing}/pricing`} className="text-[var(--mint)] underline-offset-2 hover:underline">
          pricing
        </a>
        .
      </p>
    </Shell>
  );
}
