import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Input, PageHeader, Select, Textarea } from "../../components/ui";
import { useToast } from "../../components/ui/Toast";
import { sitesApi } from "../../lib/api/sites";

export function SettingsPage() {
  const { siteId = "" } = useParams();
  const toast = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("UTC");
  const [theme, setTheme] = useState("default");
  const [postsPerPage, setPostsPerPage] = useState("10");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const { site } = await sitesApi.get(siteId);
        setName(site.name);
        setTheme(site.theme);
        setDescription(typeof site.settings.description === "string" ? site.settings.description : "");
        setLanguage(typeof site.settings.language === "string" ? site.settings.language : "en");
        setTimezone(typeof site.settings.timezone === "string" ? site.settings.timezone : "UTC");
        setPostsPerPage(String(site.settings.postsPerPage ?? 10));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load settings.");
      }
    })();
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
      <div className="card" style={{ display: "grid", gap: "0.75rem", maxWidth: 560 }}>
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
    </>
  );
}
