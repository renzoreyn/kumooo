import { useState } from "react";
import { Dialog } from "../../components/ui/Dialog";
import { Button, Input, Select } from "../../components/ui";
import { sitesApi, type Site } from "../../lib/api/sites";
import { DEFAULT_TENANT_THEME, TENANT_THEMES } from "../../lib/themes";

export function CreateSiteDialog({
  open,
  orgId,
  onClose,
  onCreated,
  atLimit,
  limitsLabel,
}: {
  open: boolean;
  orgId: string;
  onClose: () => void;
  onCreated: (site: Site) => void;
  atLimit?: boolean;
  limitsLabel?: string;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [theme, setTheme] = useState<string>(DEFAULT_TENANT_THEME);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (atLimit) return;
    setBusy(true);
    setError(null);
    try {
      const { site } = await sitesApi.create(orgId, {
        name,
        slug: slug || undefined,
        description: description || undefined,
        theme,
      });
      onCreated(site);
      setName("");
      setSlug("");
      setDescription("");
      setTheme(DEFAULT_TENANT_THEME);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create site.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} title="Create site" onClose={onClose}>
      <form onSubmit={(e) => void submit(e)}>
        {error ? <div className="error">{error}</div> : null}
        {atLimit ? (
          <div className="error" style={{ marginBottom: "0.75rem" }}>
            {limitsLabel ??
              "Free plan includes 2 sites. Archive or delete one to create another. Paid plans with more sites come later."}
          </div>
        ) : limitsLabel ? (
          <p className="muted" style={{ marginTop: 0 }}>
            {limitsLabel}
          </p>
        ) : null}
        <div className="field">
          <label className="label" htmlFor="create-name">
            Name
          </label>
          <Input
            id="create-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={atLimit}
          />
        </div>
        <div className="field">
          <label className="label" htmlFor="create-slug">
            Slug
          </label>
          <Input
            id="create-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="my-blog"
            disabled={atLimit}
          />
        </div>
        <div className="field">
          <label className="label" htmlFor="create-desc">
            Description
          </label>
          <Input
            id="create-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={atLimit}
          />
        </div>
        <div className="field">
          <label className="label" htmlFor="create-theme">
            Theme
          </label>
          <Select
            id="create-theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            disabled={atLimit}
          >
            {TENANT_THEMES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
          <Button type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={busy || atLimit}>
            {busy ? "Creating…" : "Create site"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
