import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Eye, RotateCcw, Save, Upload } from "lucide-react";
import { Button, PageHeader } from "../../components/ui";
import { useToast } from "../../components/ui/Toast";
import { contentApi } from "../../lib/api/content";
import { themeStudioApi, type ThemeStudioFiles } from "../../lib/api/theme-studio";

const FILE_ORDER: (keyof ThemeStudioFiles)[] = [
  "theme.json",
  "styles.css",
  "templates/home.html",
  "templates/post.html",
  "templates/page.html",
  "templates/archive.html",
  "templates/notFound.html",
  "client.js",
];

export function ThemeStudioPage() {
  const { siteId = "" } = useParams();
  const toast = useToast();
  const [files, setFiles] = useState<ThemeStudioFiles | null>(null);
  const [active, setActive] = useState<keyof ThemeStudioFiles>("styles.css");
  const [siteTheme, setSiteTheme] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const data = await themeStudioApi.get(siteId);
    setFiles(data.files);
    setSiteTheme(data.siteTheme);
  }

  useEffect(() => {
    void load().catch((err) => setError(err instanceof Error ? err.message : "Could not load."));
  }, [siteId]);

  async function save() {
    if (!files) return;
    setBusy(true);
    setError(null);
    try {
      const { files: next } = await themeStudioApi.save(siteId, files);
      setFiles(next);
      toast.push("Draft saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  async function reset() {
    setBusy(true);
    setError(null);
    try {
      const { files: next } = await themeStudioApi.reset(siteId);
      setFiles(next);
      toast.push("Draft reset to starter");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed.");
    } finally {
      setBusy(false);
    }
  }

  async function publish() {
    if (!files) return;
    setBusy(true);
    setError(null);
    try {
      await themeStudioApi.save(siteId, files);
      const res = await themeStudioApi.publish(siteId);
      setSiteTheme(res.theme);
      toast.push(`Published v${res.version}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed.");
    } finally {
      setBusy(false);
    }
  }

  async function preview() {
    try {
      await themeStudioApi.save(siteId, files ?? {});
      const list = await contentApi.list(siteId, "?perPage=1");
      const item = list.content[0];
      if (!item) {
        setError("Create a post or page first to preview.");
        return;
      }
      const theme = `custom-draft:${siteId}`;
      const { url } = await contentApi.previewToken(siteId, item.id, theme);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Preview failed.");
    }
  }

  if (!files) {
    return (
      <>
        <PageHeader title="Theme Studio" description="Loading draft…" />
        {error ? <div className="error">{error}</div> : null}
      </>
    );
  }

  const value = files[active] ?? "";

  return (
    <>
      <PageHeader
        title="Theme Studio"
        description={
          siteTheme.startsWith("custom:")
            ? `Live theme: ${siteTheme}`
            : "Edit HTML, CSS, and optional client JS. Publish to activate."
        }
        actions={
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <Button type="button" disabled={busy} onClick={() => void preview()}>
              <Eye size={16} /> Preview draft
            </Button>
            <Button type="button" disabled={busy} onClick={() => void save()}>
              <Save size={16} /> Save
            </Button>
            <Button type="button" variant="primary" disabled={busy} onClick={() => void publish()}>
              <Upload size={16} /> Publish
            </Button>
          </div>
        }
      />
      {error ? <div className="error">{error}</div> : null}
      <p className="muted" style={{ marginTop: 0 }}>
        First-party seasons stay under <Link to={`/sites/${siteId}/design/themes`}>Themes</Link>.
        Studio is for your own file tree.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(11rem, 14rem) 1fr",
          gap: "0.75rem",
          alignItems: "start",
        }}
      >
        <div className="card" style={{ padding: "0.5rem", display: "grid", gap: "0.25rem" }}>
          {FILE_ORDER.map((path) => (
            <button
              key={path}
              type="button"
              className={`btn${active === path ? " primary" : ""}`}
              style={{ justifyContent: "flex-start", borderRadius: 8 }}
              onClick={() => setActive(path)}
            >
              {path}
            </button>
          ))}
          <Button type="button" disabled={busy} onClick={() => void reset()} style={{ marginTop: "0.5rem" }}>
            <RotateCcw size={16} /> Reset draft
          </Button>
        </div>
        <div className="card" style={{ padding: "0.75rem" }}>
          <label className="label" htmlFor="studio-editor">
            {active}
          </label>
          <textarea
            id="studio-editor"
            className="input"
            style={{
              width: "100%",
              minHeight: "28rem",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
              fontSize: "0.85rem",
              lineHeight: 1.45,
              resize: "vertical",
            }}
            value={value}
            onChange={(e) => {
              const next = e.target.value;
              setFiles((prev) => {
                if (!prev) return prev;
                if (active === "client.js") return { ...prev, "client.js": next };
                return { ...prev, [active]: next };
              });
            }}
          />
        </div>
      </div>
    </>
  );
}
