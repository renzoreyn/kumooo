import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type DragEvent } from "react";
import { useParams } from "react-router-dom";
import { Copy, LayoutGrid, List, Trash2, Upload } from "lucide-react";
import { Button, EmptyState, Input, PageHeader } from "../../components/ui";
import { ConfirmDialog } from "../../components/ui/Dialog";
import { useToast } from "../../components/ui/Toast";
import { sitesApi } from "../../lib/api/sites";
import {
  absoluteMediaUrl,
  formatBytes,
  mediaApi,
  type MediaItem,
} from "../../lib/api/media";

function mimeKind(mime: string): "image" | "video" | "audio" | "pdf" | "other" {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (mime === "application/pdf") return "pdf";
  return "other";
}

export function MediaPage() {
  const { siteId = "" } = useParams();
  const toast = useToast();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [siteUrl, setSiteUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [editingAlt, setEditingAlt] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const [mediaRes, siteRes] = await Promise.all([mediaApi.list(siteId), sitesApi.get(siteId)]);
    setItems(mediaRes.media);
    setSiteUrl(siteRes.site.url ?? `https://${siteRes.site.slug}.kumooo.dev`);
    setEditingAlt(Object.fromEntries(mediaRes.media.map((m) => [m.id, m.alt ?? ""])));
  }, [siteId]);

  useEffect(() => {
    void load().catch((err) => setError(err instanceof Error ? err.message : "Could not load media."));
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((m) => {
      if (type && mimeKind(m.mime) !== type) return false;
      if (!q) return true;
      return m.filename.toLowerCase().includes(q) || (m.alt ?? "").toLowerCase().includes(q);
    });
  }, [items, search, type]);

  async function uploadFiles(files: FileList | File[]) {
    const list = [...files];
    if (!list.length) return;
    setBusy(true);
    setError(null);
    try {
      for (const file of list) {
        await mediaApi.upload(siteId, file);
      }
      toast.push(list.length === 1 ? "Uploaded" : `Uploaded ${list.length} files`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  function onFileInput(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) void uploadFiles(e.target.files);
    e.target.value = "";
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) void uploadFiles(e.dataTransfer.files);
  }

  async function copyUrl(item: MediaItem) {
    const url = absoluteMediaUrl(siteUrl, item.url);
    await navigator.clipboard.writeText(url);
    toast.push("URL copied");
  }

  async function saveAlt(item: MediaItem) {
    const alt = editingAlt[item.id] ?? "";
    if (alt === (item.alt ?? "")) return;
    setBusy(true);
    try {
      await mediaApi.update(siteId, item.id, { alt });
      toast.push("Alt text saved");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save alt.");
    } finally {
      setBusy(false);
    }
  }

  async function hardDelete() {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await mediaApi.remove(siteId, deleteTarget.id);
      toast.push(`Deleted ${deleteTarget.filename}`);
      setDeleteTarget(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Media"
        description={`${items.length} file${items.length === 1 ? "" : "s"}`}
        actions={
          <>
            <Button type="button" aria-pressed={view === "grid"} onClick={() => setView("grid")}>
              <LayoutGrid size={16} /> Grid
            </Button>
            <Button type="button" aria-pressed={view === "list"} onClick={() => setView("list")}>
              <List size={16} /> List
            </Button>
            <label className="btn primary" style={{ cursor: busy ? "wait" : "pointer" }}>
              <Upload size={16} /> Upload
              <input type="file" hidden multiple disabled={busy} onChange={onFileInput} />
            </label>
          </>
        }
      />
      <div
        className="card"
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{
          marginBottom: "1rem",
          borderStyle: "dashed",
          background: dragging ? "var(--sidebar)" : undefined,
        }}
      >
        <p className="muted" style={{ margin: 0 }}>
          Drag and drop files here, or use Upload. Max 25 MB. Images, video, audio, PDF.
        </p>
      </div>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <div className="field" style={{ flex: 1, minWidth: 180, marginBottom: 0 }}>
          <label className="label" htmlFor="media-search">
            Search
          </label>
          <Input
            id="media-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filename or alt"
          />
        </div>
        <div className="field" style={{ minWidth: 140, marginBottom: 0 }}>
          <label className="label" htmlFor="media-type">
            Type
          </label>
          <select
            className="select input"
            id="media-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">All</option>
            <option value="image">Images</option>
            <option value="video">Video</option>
            <option value="audio">Audio</option>
            <option value="pdf">PDF</option>
          </select>
        </div>
      </div>
      {error ? <div className="error">{error}</div> : null}
      {filtered.length === 0 ? (
        <EmptyState title="No media yet" body="Upload an image or drop files above." />
      ) : view === "grid" ? (
        <div
          style={{
            display: "grid",
            gap: "0.75rem",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          }}
        >
          {filtered.map((m) => {
            const url = absoluteMediaUrl(siteUrl, m.url);
            return (
              <div key={m.id} className="card" style={{ display: "grid", gap: "0.5rem" }}>
                <div
                  style={{
                    aspectRatio: "1",
                    background: "var(--sidebar)",
                    display: "grid",
                    placeItems: "center",
                    overflow: "hidden",
                  }}
                >
                  {mimeKind(m.mime) === "image" ? (
                    <img src={url} alt={m.alt || m.filename} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span className="muted">{m.mime}</span>
                  )}
                </div>
                <strong style={{ fontSize: "0.9rem", wordBreak: "break-word" }}>{m.filename}</strong>
                <span className="muted" style={{ fontSize: "0.8rem" }}>
                  {formatBytes(m.size)} · {m.mime}
                </span>
                <Input
                  aria-label={`Alt for ${m.filename}`}
                  value={editingAlt[m.id] ?? ""}
                  onChange={(e) => setEditingAlt((s) => ({ ...s, [m.id]: e.target.value }))}
                  onBlur={() => void saveAlt(m)}
                  placeholder="Alt text"
                />
                <div style={{ display: "flex", gap: "0.35rem" }}>
                  <Button type="button" onClick={() => void copyUrl(m)}>
                    <Copy size={14} /> Copy
                  </Button>
                  <Button type="button" variant="danger" onClick={() => setDeleteTarget(m)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.65rem" }}>
          {filtered.map((m) => {
            const url = absoluteMediaUrl(siteUrl, m.url);
            return (
              <div key={m.id} className="card" style={{ display: "grid", gap: "0.65rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                  <div>
                    <strong>{m.filename}</strong>
                    <div className="muted" style={{ fontSize: "0.88rem" }}>
                      {formatBytes(m.size)} · {m.mime}
                    </div>
                    <div className="muted" style={{ fontSize: "0.8rem", wordBreak: "break-all" }}>
                      {url}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.35rem" }}>
                    <Button type="button" onClick={() => void copyUrl(m)}>
                      <Copy size={16} /> Copy URL
                    </Button>
                    <Button type="button" variant="danger" onClick={() => setDeleteTarget(m)}>
                      <Trash2 size={16} /> Delete
                    </Button>
                  </div>
                </div>
                <Input
                  aria-label={`Alt for ${m.filename}`}
                  value={editingAlt[m.id] ?? ""}
                  onChange={(e) => setEditingAlt((s) => ({ ...s, [m.id]: e.target.value }))}
                  onBlur={() => void saveAlt(m)}
                  placeholder="Alt text"
                />
              </div>
            );
          })}
        </div>
      )}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete media?"
        body={deleteTarget ? `“${deleteTarget.filename}” will be removed from storage.` : ""}
        confirmLabel="Delete"
        danger
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void hardDelete()}
      />
    </>
  );
}
