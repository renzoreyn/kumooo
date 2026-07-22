import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, PageHeader } from "../../components/ui";
import { useToast } from "../../components/ui/Toast";
import {
  absoluteMediaUrl,
  mediaApi,
  type MediaItem,
} from "../../lib/api/media";
import { sitesApi } from "../../lib/api/sites";

export function BrandingPage() {
  const { siteId = "" } = useParams();
  const toast = useToast();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [siteUrl, setSiteUrl] = useState("");
  const [logoMediaId, setLogoMediaId] = useState<string>("");
  const [faviconMediaId, setFaviconMediaId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const [mediaRes, siteRes] = await Promise.all([mediaApi.list(siteId), sitesApi.get(siteId)]);
    setItems(mediaRes.media.filter((m) => m.mime.startsWith("image/")));
    setSiteUrl(siteRes.site.url ?? "");
    setLogoMediaId(typeof siteRes.site.settings.logoMediaId === "string" ? siteRes.site.settings.logoMediaId : "");
    setFaviconMediaId(
      typeof siteRes.site.settings.faviconMediaId === "string" ? siteRes.site.settings.faviconMediaId : "",
    );
  }

  useEffect(() => {
    void load().catch((err) => setError(err instanceof Error ? err.message : "Could not load."));
  }, [siteId]);

  const options = useMemo(
    () =>
      items.map((m) => ({
        id: m.id,
        label: m.filename,
        url: absoluteMediaUrl(siteUrl, m.url),
      })),
    [items, siteUrl],
  );

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await sitesApi.update(siteId, {
        settings: {
          logoMediaId: logoMediaId || "",
          faviconMediaId: faviconMediaId || "",
        },
      });
      toast.push("Branding saved");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  async function uploadAndSelect(kind: "logo" | "favicon", file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const { media } = await mediaApi.upload(siteId, file);
      if (kind === "logo") setLogoMediaId(media.id);
      else setFaviconMediaId(media.id);
      await load();
      toast.push(`${kind === "logo" ? "Logo" : "Favicon"} uploaded`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Branding"
        description="Logo and favicon for your public site. Upload images under Media (150 MB per site)."
        actions={
          <Button type="button" variant="primary" disabled={busy} onClick={() => void save()}>
            Save branding
          </Button>
        }
      />
      {error ? <div className="error">{error}</div> : null}
      <div className="card" style={{ display: "grid", gap: "1rem", maxWidth: 560 }}>
        <div className="field" style={{ marginBottom: 0 }}>
          <label className="label" htmlFor="brand-logo">
            Logo
          </label>
          <select
            id="brand-logo"
            className="input"
            value={logoMediaId}
            onChange={(e) => setLogoMediaId(e.target.value)}
          >
            <option value="">Site title text</option>
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
          <label className="btn" style={{ marginTop: "0.5rem", width: "fit-content", cursor: "pointer" }}>
            Upload logo
            <input
              type="file"
              accept="image/*"
              hidden
              disabled={busy}
              onChange={(e) => void uploadAndSelect("logo", e.target.files?.[0])}
            />
          </label>
          {logoMediaId ? (
            <img
              src={options.find((o) => o.id === logoMediaId)?.url}
              alt=""
              style={{ marginTop: "0.75rem", maxHeight: 48, width: "auto" }}
            />
          ) : null}
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label className="label" htmlFor="brand-favicon">
            Favicon
          </label>
          <select
            id="brand-favicon"
            className="input"
            value={faviconMediaId}
            onChange={(e) => setFaviconMediaId(e.target.value)}
          >
            <option value="">None</option>
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
          <label className="btn" style={{ marginTop: "0.5rem", width: "fit-content", cursor: "pointer" }}>
            Upload favicon
            <input
              type="file"
              accept="image/*"
              hidden
              disabled={busy}
              onChange={(e) => void uploadAndSelect("favicon", e.target.files?.[0])}
            />
          </label>
        </div>
        <p className="muted" style={{ margin: 0 }}>
          Official Kumooo surfaces use the <strong>k.</strong> mark. Your site can replace both logo and favicon here.
        </p>
      </div>
    </>
  );
}
