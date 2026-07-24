"use client";

import * as React from "react";
import Link from "next/link";
import { Dropzone } from "@kumooo/ui";
import { client, type MediaItem, type MediaList } from "@/lib/api";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SiteMedia({ siteId }: { siteId: string }) {
  const [data, setData] = React.useState<MediaList | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    const next = await client.listMedia(siteId);
    setData(next);
  }, [siteId]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const next = await client.listMedia(siteId);
        if (!cancelled) setData(next);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [siteId]);

  async function upload(files: FileList) {
    const file = files[0];
    if (!file || busy) return;
    setBusy(true);
    setError(null);
    try {
      await client.uploadMedia(siteId, file);
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "upload_failed";
      if (msg === "quota_exceeded") {
        setError("Storage quota full. Free space or upgrade on Account.");
      } else if (msg === "invalid_type") {
        setError("Use JPEG, PNG, WebP, or GIF.");
      } else if (msg === "invalid_size") {
        setError("Max 5 MB per image.");
      } else {
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  }

  async function remove(item: MediaItem) {
    if (!confirm("Delete this image?")) return;
    setError(null);
    try {
      await client.deleteMedia(siteId, item.id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "delete_failed");
    }
  }

  async function copyUrl(url: string, id: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setError("Could not copy URL");
    }
  }

  return (
    <section className="mt-10 max-w-2xl">
      <h2 className="text-sm font-semibold tracking-wide text-[var(--fg)]">Media</h2>
      <p className="mt-1 text-sm text-[var(--fog)]">
        Upload images. Copy the URL. Paste it somewhere. Edge-cached. Not art direction.
      </p>
      {data ? (
        <p className="mt-2 font-mono text-xs text-[var(--mint)]">
          {data.usedLabel} / {data.quotaLabel}
        </p>
      ) : null}

      <div className="mt-4">
        <Dropzone
          accept="image/jpeg,image/png,image/webp,image/gif"
          label={busy ? "Uploading…" : "Drop image or click (max 5MB)"}
          className="rounded-2xl border border-dashed border-[var(--line)] bg-white/[0.02] py-8 text-[var(--fog)]"
          onFiles={(files) => {
            void upload(files);
          }}
        />
      </div>
      {error ? (
        <p className="mt-2 text-xs text-red-400">
          {error}
          {error.includes("quota") ? (
            <>
              {" "}
              <Link href="/account" className="underline hover:text-[var(--fg)]">
                Account
              </Link>
            </>
          ) : null}
        </p>
      ) : null}

      {data && data.media.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--fog)]">No images yet.</p>
      ) : null}

      {data && data.media.length > 0 ? (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {data.media.map((item) => (
            <li
              key={item.id}
              className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white/[0.02]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt="" className="aspect-[4/3] w-full object-cover bg-black/20" />
              <div className="space-y-2 p-3">
                <p className="truncate text-xs text-[var(--fg)]">{item.filename || item.id}</p>
                <p className="font-mono text-[10px] text-[var(--fog)]">{formatSize(item.bytes)}</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-full border border-[var(--line)] px-3 py-1 text-[10px] font-semibold text-[var(--fog)] hover:border-[var(--fog)] hover:text-[var(--fg)]"
                    onClick={() => void copyUrl(item.url, item.id)}
                  >
                    {copied === item.id ? "Copied" : "Copy URL"}
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-[var(--line)] px-3 py-1 text-[10px] font-semibold text-red-400/90 hover:border-red-400/50"
                    onClick={() => void remove(item)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
