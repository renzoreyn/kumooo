import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { scoreSeoHealth } from "@kumooo/core";
import { Badge, Button, Input, PageHeader, Textarea } from "../../components/ui";
import { useToast } from "../../components/ui/Toast";
import { sitesApi, type Site } from "../../lib/api/sites";

export function SeoPage() {
  const { siteId = "" } = useParams();
  const toast = useToast();
  const [site, setSite] = useState<Site | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [titleTemplate, setTitleTemplate] = useState("");
  const [defaultOgImage, setDefaultOgImage] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [noindex, setNoindex] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const { site: s } = await sitesApi.get(siteId);
        setSite(s);
        setTitle(typeof s.settings.title === "string" ? s.settings.title : s.name);
        setDescription(typeof s.settings.description === "string" ? s.settings.description : "");
        const seo = (s.settings.seo ?? {}) as Record<string, unknown>;
        setTitleTemplate(typeof seo.titleTemplate === "string" ? seo.titleTemplate : "");
        setDefaultOgImage(typeof seo.defaultOgImage === "string" ? seo.defaultOgImage : "");
        setTwitterHandle(typeof seo.twitterHandle === "string" ? seo.twitterHandle : "");
        setNoindex(Boolean(seo.noindex));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load SEO settings.");
      }
    })();
  }, [siteId]);

  const health = useMemo(() => {
    const url = site?.url ?? "";
    return scoreSeoHealth({
      title: title || site?.name,
      description,
      ogImage: defaultOgImage,
      canonicalUrl: url,
      hasSitemap: true,
      hasRobots: true,
      hasJsonLd: true,
      hasViewport: true,
    });
  }, [title, description, defaultOgImage, site]);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await sitesApi.update(siteId, {
        settings: {
          title,
          description,
          seo: {
            titleTemplate: titleTemplate || undefined,
            defaultOgImage: defaultOgImage || undefined,
            twitterHandle: twitterHandle || undefined,
            noindex,
          },
        },
      });
      toast.push("SEO settings saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        title="SEO"
        description={site ? `${site.url}/sitemap.xml · robots.txt` : undefined}
        actions={
          <Button type="button" variant="primary" disabled={busy} onClick={() => void save()}>
            Save
          </Button>
        }
      />
      {error ? <div className="error">{error}</div> : null}
      <div className="card" style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center" }}>
          <strong>Health score</strong>
          <Badge tone={health.score >= 75 ? "ok" : health.score >= 50 ? "warn" : "danger"}>
            {health.score}/100
          </Badge>
        </div>
        <ul style={{ margin: "0.75rem 0 0", paddingLeft: "1.1rem" }}>
          {health.checks.map((c) => (
            <li key={c.id} style={{ marginBottom: "0.35rem" }}>
              <span style={{ color: c.ok ? "inherit" : "var(--danger, #b91c1c)" }}>
                {c.ok ? "✓" : "×"} {c.label}
              </span>
              {!c.ok && c.detail ? (
                <span className="muted">: {c.detail}</span>
              ) : null}
              {c.id === "ogImage" && !c.ok ? (
                <>
                  {" "}
                  <Link to={`/sites/${siteId}/seo/og`}>OpenGraph Maker</Link>
                </>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
      <div className="card" style={{ display: "grid", gap: "0.75rem" }}>
        <div className="field" style={{ marginBottom: 0 }}>
          <label className="label" htmlFor="seo-site-title">
            Site title
          </label>
          <Input id="seo-site-title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label className="label" htmlFor="seo-site-desc">
            Site description
          </label>
          <Textarea
            id="seo-site-desc"
            style={{ minHeight: "5rem" }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label className="label" htmlFor="seo-title-template">
            Title template
          </label>
          <Input
            id="seo-title-template"
            value={titleTemplate}
            onChange={(e) => setTitleTemplate(e.target.value)}
            placeholder="%s · My Site"
          />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label className="label" htmlFor="seo-og">
            Default OpenGraph image URL
          </label>
          <Input
            id="seo-og"
            value={defaultOgImage}
            onChange={(e) => setDefaultOgImage(e.target.value)}
            placeholder="https://…"
          />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label className="label" htmlFor="seo-twitter">
            Twitter handle
          </label>
          <Input
            id="seo-twitter"
            value={twitterHandle}
            onChange={(e) => setTwitterHandle(e.target.value)}
            placeholder="@you"
          />
        </div>
        <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input type="checkbox" checked={noindex} onChange={(e) => setNoindex(e.target.checked)} />
          Noindex entire site
        </label>
      </div>
    </>
  );
}
