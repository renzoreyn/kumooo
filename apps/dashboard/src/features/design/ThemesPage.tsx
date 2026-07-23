import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { resolveThemeId } from "@kumooo/core";
import { Check, Eye } from "lucide-react";
import { Badge, Button, PageHeader } from "../../components/ui";
import { ConfirmDialog } from "../../components/ui/Dialog";
import { useToast } from "../../components/ui/Toast";
import { contentApi } from "../../lib/api/content";
import { sitesApi, type Site } from "../../lib/api/sites";
import { TENANT_THEMES } from "../../lib/themes";

export function ThemesPage() {
  const { siteId = "" } = useParams();
  const toast = useToast();
  const [site, setSite] = useState<Site | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const { site: s } = await sitesApi.get(siteId);
    setSite(s);
  }

  useEffect(() => {
    void load().catch((err) => setError(err instanceof Error ? err.message : "Could not load."));
  }, [siteId]);

  const activeId = site ? resolveThemeId(site.theme) : null;

  async function applyTheme() {
    if (!pending) return;
    setBusy(true);
    setError(null);
    try {
      await sitesApi.update(siteId, { theme: pending });
      toast.push(`Theme set to ${pending}`);
      setPending(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not apply theme.");
    } finally {
      setBusy(false);
    }
  }

  async function previewTheme(theme: string) {
    try {
      const list = await contentApi.list(siteId, "?perPage=1");
      const item = list.content[0];
      if (!item) {
        setError("Create a post or page first to preview a theme.");
        return;
      }
      const { url } = await contentApi.previewToken(siteId, item.id, theme);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Preview failed.");
    }
  }

  return (
    <>
      <PageHeader
        title="Themes"
        description={
          site
            ? site.theme.startsWith("custom:")
              ? `Active: custom theme (edit in Theme Studio)`
              : `Active: ${resolveThemeId(site.theme)}`
            : undefined
        }
      />
      <p className="muted" style={{ marginTop: 0 }}>
        Season and showcase themes below. For HTML/CSS/JS of your own, use{" "}
        <Link to={`/sites/${siteId}/design/studio`}>Theme Studio</Link>.
      </p>
      {error ? <div className="error">{error}</div> : null}
      <div style={{ display: "grid", gap: "0.75rem" }}>
        {TENANT_THEMES.map((t) => {
          const active = !site?.theme.startsWith("custom:") && activeId === t.id;
          return (
            <div key={t.id} className="card" style={{ display: "grid", gap: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                <div>
                  <strong>{t.name}</strong>
                  <p className="muted" style={{ margin: "0.35rem 0 0" }}>
                    {t.description}
                  </p>
                </div>
                {active ? <Badge tone="ok">Active</Badge> : null}
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <Button type="button" onClick={() => void previewTheme(t.id)}>
                  <Eye size={16} /> Preview
                </Button>
                {!active ? (
                  <Button type="button" variant="primary" disabled={busy} onClick={() => setPending(t.id)}>
                    <Check size={16} /> Apply
                  </Button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      <ConfirmDialog
        open={Boolean(pending)}
        title="Apply theme?"
        body={pending ? `Switch this site to "${pending}". Live pages will use it after the next render.` : ""}
        confirmLabel="Apply"
        onClose={() => setPending(null)}
        onConfirm={() => void applyTheme()}
      />
    </>
  );
}
