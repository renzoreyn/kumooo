"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@kumooo/ui";
import { Shell } from "@/components/shell";
import { client, type Me, type Quota } from "@/lib/api";
import { site } from "@/lib/site";

export default function AccountPage() {
  const router = useRouter();
  const [me, setMe] = React.useState<Me | null>(null);
  const [quota, setQuota] = React.useState<Quota | null>(null);
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

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

  async function onSetPassword(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await client.setPassword(password);
      setPassword("");
      setMe((m) => (m ? { ...m, hasPassword: true } : m));
      setMsg(me?.hasPassword ? "Password updated." : "Password set. You can sign in with it next time.");
    } catch (err) {
      const fail = err instanceof Error ? err.message : "failed";
      setMsg(fail === "invalid_password" ? "Need at least 8 characters." : fail);
    } finally {
      setBusy(false);
    }
  }

  if (!me || !quota) {
    return <main className="grid min-h-screen place-items-center text-[var(--fog)]">Loading…</main>;
  }

  return (
    <Shell email={me.email}>
      <h1 className="text-3xl font-semibold tracking-[-0.03em]">Account</h1>
      <p className="mt-2 text-sm text-[var(--fog)]">Boring on purpose.</p>
      <dl className="mt-8 space-y-4 text-sm">
        <div>
          <dt className="text-[var(--fog)]">Email</dt>
          <dd className="mt-1 text-[var(--fg)]">{me.email}</dd>
        </div>
        <div>
          <dt className="text-[var(--fog)]">plan</dt>
          <dd className="mt-1 text-[var(--fg)]">
            {quota.planName} · {quota.sitesUsed}
            {quota.sitesLimit != null ? ` / ${quota.sitesLimit}` : ""} sites · {quota.mediaUsedLabel} /{" "}
            {quota.mediaLimitLabel}
          </dd>
        </div>
      </dl>

      <section className="mt-10 max-w-md">
        <h2 className="text-sm font-semibold tracking-wide text-[var(--fg)]">
          {me.hasPassword ? "Change password" : "Set a password"}
        </h2>
        <p className="mt-1 text-sm text-[var(--fog)]">
          {me.hasPassword
            ? "Same email. New password. Try not to forget it."
            : "You signed in with a code. Add a password if you prefer typing secrets."}
        </p>
        <form onSubmit={onSetPassword} className="mt-4 space-y-3">
          <Input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="8+ characters"
            className="border-[var(--line)] bg-transparent text-[var(--fg)]"
          />
          <Button
            type="submit"
            disabled={busy}
            className="rounded-full bg-[var(--fg)] text-[var(--bg)] hover:opacity-90"
          >
            {busy ? "Saving…" : me.hasPassword ? "Update password" : "Set password"}
          </Button>
        </form>
        {msg ? <p className="mt-3 text-xs text-[var(--fog)]">{msg}</p> : null}
      </section>

      <p className="mt-10 max-w-md text-sm leading-relaxed text-[var(--fog)]">
        Paid plans are still vapor. Look at{" "}
        <a href={`${site.marketing}/pricing`} className="text-[var(--mint)] underline-offset-2 hover:underline">
          pricing
        </a>{" "}
        if you enjoy fiction.
      </p>
    </Shell>
  );
}
