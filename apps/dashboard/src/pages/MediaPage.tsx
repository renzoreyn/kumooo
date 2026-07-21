import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Upload } from "lucide-react";
import { api } from "../api";
import { Shell } from "../App";

export function MediaPage() {
  const { siteId = "" } = useParams();
  const [items, setItems] = useState<{ id: string; filename: string; url: string; mime: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const r = await api.media(siteId);
    setItems(r.media);
  }

  useEffect(() => {
    void load().catch((err) => setError(err instanceof Error ? err.message : "Could not load media."));
  }, [siteId]);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      await api.uploadMedia(siteId, file);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    }
  }

  return (
    <Shell title="Media">
      {error ? <div className="error">{error}</div> : null}
      <label className="btn primary" style={{ marginBottom: "1rem" }}>
        <Upload size={16} /> Upload
        <input type="file" hidden onChange={(e) => void onUpload(e)} />
      </label>
      {items.length === 0 ? (
        <div className="card">
          <p className="muted" style={{ margin: 0 }}>No files yet. Drop an image when you're ready.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.65rem" }}>
          {items.map((m) => (
            <div key={m.id} className="card" style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
              <div>
                <strong>{m.filename}</strong>
                <div className="muted" style={{ fontSize: "0.88rem" }}>{m.mime} · {m.url}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Shell>
  );
}
