"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { SKIN_LABELS, SKINS, isSkinId, type SkinId } from "@kumooo/theme-packs";
import { Button, Input } from "@kumooo/ui";
import { Shell } from "@/components/shell";
import { SiteMedia } from "@/components/site-media";
import { SitePosts } from "@/components/site-posts";
import { client, type Me, type SiteItem } from "@/lib/api";

export default function SiteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [me, setMe] = React.useState<Me | null>(null);
  const [siteRow, setSiteRow] = React.useState<(SiteItem & { deployHint?: string }) | null>(null);
  const [skinBusy, setSkinBusy] = React.useState(false);
  const [skinMsg, setSkinMsg] = React.useState<string | null>(null);
  const [nameDraft, setNameDraft] = React.useState("");
  const [nameBusy, setNameBusy] = React.useState(false);
  const [nameMsg, setNameMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user = await client.me();
        if (cancelled) return;
        setMe(user);
        const s = await client.getSite(id);
        if (!cancelled) {
          setSiteRow(s);
          setNameDraft(s.name);
        }
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

  async function setSkin(next: SkinId) {
    if (!siteRow || siteRow.skin === next) return;
    setSkinBusy(true);
    setSkinMsg(null);
    try {
      const updated = await client.updateSite(id, { skin: next });
      setSiteRow((prev) => (prev ? { ...prev, ...updated } : updated));
      setSkinMsg("Skin saved. Deployed starters pick this up via /public/sites/" + updated.slug);
    } catch (e) {
      setSkinMsg(e instanceof Error ? e.message : "failed");
    } finally {
      setSkinBusy(false);
    }
  }

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    if (!siteRow) return;
    const next = nameDraft.trim().slice(0, 80);
    if (!next || next === siteRow.name) return;
    setNameBusy(true);
    setNameMsg(null);
    try {
      const updated = await client.updateSite(id, { name: next });
      setSiteRow((prev) => (prev ? { ...prev, ...updated } : updated));
      setNameDraft(updated.name);
      setNameMsg("Renamed.");
    } catch (err) {
      setNameMsg(err instanceof Error ? err.message : "failed");
    } finally {
      setNameBusy(false);
    }
  }

  if (!me || !siteRow) {
    return <main className="grid min-h-screen place-items-center text-[var(--fog)]">Loading…</main>;
  }

  const activeSkin = isSkinId(siteRow.skin) ? siteRow.skin : "kumooo";

  return (
    <Shell email={me.email}>
      <Link href="/" className="text-sm text-[var(--fog)] hover:text-[var(--fg)]">
        ← Sites
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">{siteRow.name}</h1>
      <p className="mt-2 font-mono text-sm text-[var(--mint)]">{siteRow.url}</p>

      <form onSubmit={saveName} className="mt-8 flex max-w-lg flex-wrap items-end gap-3">
        <div className="min-w-[12rem] flex-1">
          <label className="mb-1.5 block text-sm text-[var(--fog)]" htmlFor="site-name">
            Name
          </label>
          <Input
            id="site-name"
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            className="border-[var(--line)] bg-[var(--bg-2)]"
            maxLength={80}
            required
          />
        </div>
        <Button
          type="submit"
          disabled={nameBusy || nameDraft.trim() === siteRow.name}
          variant="outline"
          className="rounded-full border-[var(--line)] text-[var(--fg)] hover:bg-white/5"
        >
          {nameBusy ? "Saving..." : "Rename"}
        </Button>
        {nameMsg ? <p className="w-full text-xs text-[var(--fog)]">{nameMsg}</p> : null}
      </form>

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

      <section className="mt-10 max-w-lg">
        <h2 className="text-sm font-semibold tracking-wide text-[var(--fg)]">Visual skin</h2>
        <p className="mt-1 text-sm text-[var(--fog)]">
          Blog and shop starters read this. Demos still let strangers poke all three. Chaos, contained.
        </p>
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Site skin">
          {SKINS.map((id) => (
            <button
              key={id}
              type="button"
              disabled={skinBusy}
              onClick={() => setSkin(id)}
              aria-pressed={activeSkin === id}
              className={`rounded-full border px-4 py-2 text-xs font-semibold tracking-wide transition ${
                activeSkin === id
                  ? "border-[var(--mint)] bg-[var(--mint)]/15 text-[var(--mint)]"
                  : "border-[var(--line)] text-[var(--fog)] hover:border-[var(--fog)] hover:text-[var(--fg)]"
              }`}
            >
              {SKIN_LABELS[id]}
            </button>
          ))}
        </div>
        {skinMsg ? <p className="mt-3 text-xs text-[var(--fog)]">{skinMsg}</p> : null}
      </section>

      <SiteMedia siteId={siteRow.id} />

      <SitePosts siteId={siteRow.id} />

      <p className="mt-8 max-w-lg text-sm leading-relaxed text-[var(--fog)]">
        {siteRow.deployHint ??
          "Set your visual skin here. Deployed blog/shop starters read it from the public site API."}
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
