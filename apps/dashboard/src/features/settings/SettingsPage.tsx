import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Input, PageHeader, Select, Textarea } from "../../components/ui";
import { ConfirmDialog, Dialog } from "../../components/ui/Dialog";
import { useToast } from "../../components/ui/Toast";
import { sitesApi } from "../../lib/api/sites";

export function SettingsPage() {
  const { siteId = "" } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState("active");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("UTC");
  const [theme, setTheme] = useState("default");
  const [postsPerPage, setPostsPerPage] = useState("10");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmSlug, setConfirmSlug] = useState("");

  async function load() {
    const { site } = await sitesApi.get(siteId);
    setName(site.name);
    setSlug(site.slug);
    setStatus(site.status ?? "active");
    setTheme(site.theme);
    setDescription(typeof site.settings.description === "string" ? site.settings.description : "");
    setLanguage(typeof site.settings.language === "string" ? site.settings.language : "en");
    setTimezone(typeof site.settings.timezone === "string" ? site.settings.timezone : "UTC");
    setPostsPerPage(String(site.settings.postsPerPage ?? 10));
  }

  useEffect(() => {
    void load().catch((err) => setError(err instanceof Error ? err.message : "Could not load settings."));
  }, [siteId]);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const n = Math.min(50, Math.max(1, Number(postsPerPage) || 10));
      await sitesApi.update(siteId, {
        name,
        theme,
        settings: {
          description,
          language,
          timezone,
          postsPerPage: n,
        },
      });
      toast.push("Settings saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  async function archive() {
    setBusy(true);
    try {
      await sitesApi.archive(siteId);
      toast.push("Site archived");
      setArchiveOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Archive failed.");
    } finally {
      setBusy(false);
    }
  }

  async function restore() {
    setBusy(true);
    try {
      await sitesApi.restore(siteId);
      toast.push("Site restored");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Restore failed.");
    } finally {
      setBusy(false);
    }
  }

  async function hardDelete(e: FormEvent) {
    e.preventDefault();
    if (confirmSlug !== slug) {
      setError(`Type ${slug} to confirm delete.`);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await sitesApi.remove(siteId, confirmSlug);
      toast.push("Site deleted");
      nav("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="General site preferences"
        actions={
          <Button type="button" variant="primary" disabled={busy} onClick={() => void save()}>
            Save
          </Button>
        }
      />
      {error ? <div className="error">{error}</div> : null}
      <div className="card" style={{ display: "grid", gap: "0.75rem", maxWidth: 560, marginBottom: "1rem" }}>
        <div className="field" style={{ marginBottom: 0 }}>
          <label className="label" htmlFor="settings-name">
            Name
          </label>
          <Input id="settings-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label className="label" htmlFor="settings-desc">
            Description
          </label>
          <Textarea
            id="settings-desc"
            style={{ minHeight: "5rem" }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label className="label" htmlFor="settings-lang">
            Language
          </label>
          <Input id="settings-lang" value={language} onChange={(e) => setLanguage(e.target.value)} />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label className="label" htmlFor="settings-tz">
            Timezone
          </label>
          <Input id="settings-tz" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label className="label" htmlFor="settings-theme">
            Theme
          </label>
          <Select id="settings-theme" value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="default">Default</option>
          </Select>
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label className="label" htmlFor="settings-ppp">
            Posts per page
          </label>
          <Input
            id="settings-ppp"
            type="number"
            min={1}
            max={50}
            value={postsPerPage}
            onChange={(e) => setPostsPerPage(e.target.value)}
          />
        </div>
      </div>

      <div className="card" style={{ display: "grid", gap: "0.75rem", maxWidth: 560 }}>
        <strong>Danger zone</strong>
        <p className="muted" style={{ margin: 0 }}>
          Archive hides the site from public routing. Delete permanently removes content, media metadata, domains,
          and events. Type the site slug to confirm delete.
        </p>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {status === "archived" ? (
            <Button type="button" disabled={busy} onClick={() => void restore()}>
              Restore site
            </Button>
          ) : (
            <Button type="button" disabled={busy} onClick={() => setArchiveOpen(true)}>
              Archive site
            </Button>
          )}
          <Button type="button" variant="danger" disabled={busy} onClick={() => setDeleteOpen(true)}>
            Delete site
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={archiveOpen}
        title="Archive this site?"
        body="Public URLs will stop serving until you restore."
        confirmLabel="Archive"
        onClose={() => setArchiveOpen(false)}
        onConfirm={() => void archive()}
      />

      <Dialog open={deleteOpen} title="Delete site permanently?" onClose={() => setDeleteOpen(false)}>
        <p className="muted">
          This removes the site, its posts/pages, media rows, domains, and activity. Type <strong>{slug}</strong> to
          confirm.
        </p>
        <form onSubmit={(e) => void hardDelete(e)}>
          <div className="field">
            <label className="label" htmlFor="confirm-slug">
              Confirm slug
            </label>
            <Input
              id="confirm-slug"
              value={confirmSlug}
              onChange={(e) => setConfirmSlug(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
            <Button type="button" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" disabled={busy || confirmSlug !== slug}>
              Delete forever
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
