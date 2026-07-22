import { useCallback, useEffect, useMemo, useState } from "react";
import { Upload } from "lucide-react";
import { Button, EmptyState, Input } from "../../components/ui";
import { Dialog } from "../../components/ui/Dialog";
import {
  absoluteMediaUrl,
  formatBytes,
  mediaApi,
  type MediaItem,
} from "../../lib/api/media";
import { sitesApi } from "../../lib/api/sites";

export function MediaPickerDialog({
  open,
  siteId,
  onClose,
  onPick,
}: {
  open: boolean;
  siteId: string;
  onClose: () => void;
  onPick: (item: MediaItem, absoluteUrl: string) => void;
}) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [siteUrl, setSiteUrl] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [mediaRes, siteRes] = await Promise.all([mediaApi.list(siteId), sitesApi.get(siteId)]);
    setItems(mediaRes.media.filter((m) => m.mime.startsWith("image/")));
    setSiteUrl(siteRes.site.url ?? `https://${siteRes.site.slug}.kumooo.dev`);
  }, [siteId]);

  useEffect(() => {
    if (!open) return;
    void load().catch((err) => setError(err instanceof Error ? err.message : "Could not load."));
  }, [open, load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (m) => m.filename.toLowerCase().includes(q) || (m.alt ?? "").toLowerCase().includes(q),
    );
  }, [items, search]);

  async function onUpload(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const { media } = await mediaApi.upload(siteId, file);
      const url = absoluteMediaUrl(siteUrl || undefined, media.url);
      onPick(media, url);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} title="Insert image" onClose={onClose}>
      <div style={{ display: "grid", gap: "0.75rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <div className="field" style={{ flex: 1, marginBottom: 0 }}>
            <label className="label" htmlFor="picker-search">
              Search
            </label>
            <Input
              id="picker-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filename"
            />
          </div>
          <label className="btn primary" style={{ alignSelf: "end", cursor: busy ? "wait" : "pointer" }}>
            <Upload size={16} /> Upload
            <input
              type="file"
              accept="image/*"
              hidden
              disabled={busy}
              onChange={(e) => void onUpload(e.target.files?.[0])}
            />
          </label>
        </div>
        {error ? <div className="error">{error}</div> : null}
        {filtered.length === 0 ? (
          <EmptyState title="No images" body="Upload one to insert it into the post." />
        ) : (
          <div
            style={{
              display: "grid",
              gap: "0.5rem",
              gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
              maxHeight: "50vh",
              overflow: "auto",
            }}
          >
            {filtered.map((m) => {
              const url = absoluteMediaUrl(siteUrl, m.url);
              return (
                <button
                  key={m.id}
                  type="button"
                  className="card"
                  style={{ padding: 0, overflow: "hidden", cursor: "pointer", textAlign: "left" }}
                  onClick={() => {
                    onPick(m, url);
                    onClose();
                  }}
                >
                  <img src={url} alt={m.alt || m.filename} style={{ width: "100%", aspectRatio: "1", objectFit: "cover" }} />
                  <div style={{ padding: "0.4rem" }}>
                    <div style={{ fontSize: "0.75rem", wordBreak: "break-word" }}>{m.filename}</div>
                    <div className="muted" style={{ fontSize: "0.7rem" }}>
                      {formatBytes(m.size)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button type="button" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
