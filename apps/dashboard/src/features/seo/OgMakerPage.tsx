import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ogTemplateSchema,
  renderOgPayload,
  type OgTemplate,
} from "@kumooo/core";
import { Badge, Button, Input, PageHeader, Select } from "../../components/ui";
import { useToast } from "../../components/ui/Toast";
import { absoluteMediaUrl, mediaApi } from "../../lib/api/media";
import { ogApi, type OgTemplateRow } from "../../lib/api/og";
import { sitesApi } from "../../lib/api/sites";
import { OgCanvas } from "./OgCanvas";
import { generateOgPng } from "./generateOgPng";

const DEFAULT_CONFIG: OgTemplate = ogTemplateSchema.parse({
  layout: "left",
  background: { type: "gradient", from: "#1c1f26", to: "#3a3428" },
  title: { text: "{{title}}", color: "#f3f1ea", size: 64 },
  subtitle: { text: "{{siteName}}", color: "#c4b8a0", size: 28 },
  showHostname: true,
});

export function OgMakerPage() {
  const { siteId = "" } = useParams();
  const toast = useToast();
  const [templates, setTemplates] = useState<OgTemplateRow[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [name, setName] = useState("Default card");
  const [config, setConfig] = useState<OgTemplate>(DEFAULT_CONFIG);
  const [siteName, setSiteName] = useState("");
  const [hostname, setHostname] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [sampleTitle, setSampleTitle] = useState("Ship something worth reading");
  const [sampleExcerpt, setSampleExcerpt] = useState("A short supporting line for social cards.");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const [{ templates: rows }, { site }] = await Promise.all([
      ogApi.list(siteId),
      sitesApi.get(siteId),
    ]);
    setTemplates(rows);
    setSiteName(site.name);
    setSiteUrl(site.url ?? `https://${site.slug}.kumooo.dev`);
    setHostname(new URL(site.url ?? `https://${site.slug}.kumooo.dev`).hostname);
    const def = rows.find((t) => t.isDefault) ?? rows[0];
    if (def) {
      setSelectedId(def.id);
      setName(def.name);
      setConfig(ogTemplateSchema.parse(def.config));
    }
  }

  useEffect(() => {
    void load().catch((err) => setError(err instanceof Error ? err.message : "Could not load."));
  }, [siteId]);

  const payload = useMemo(
    () =>
      renderOgPayload(config, {
        title: sampleTitle,
        siteName,
        excerpt: sampleExcerpt,
        featuredImage: null,
        hostname,
      }),
    [config, sampleTitle, sampleExcerpt, siteName, hostname],
  );

  function patchConfig(patch: Partial<OgTemplate>) {
    setConfig((c) => ogTemplateSchema.parse({ ...c, ...patch }));
  }

  async function saveTemplate() {
    setBusy(true);
    setError(null);
    try {
      if (selectedId) {
        await ogApi.update(siteId, selectedId, { name, config });
        toast.push("Template saved");
      } else {
        const { template } = await ogApi.create(siteId, {
          name,
          config,
          isDefault: templates.length === 0,
        });
        setSelectedId(template.id);
        toast.push("Template created");
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  async function createNew() {
    setSelectedId("");
    setName("New card");
    setConfig(DEFAULT_CONFIG);
  }

  async function makeDefault() {
    if (!selectedId) return;
    setBusy(true);
    try {
      await ogApi.setDefault(siteId, selectedId);
      toast.push("Default template set");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not set default.");
    } finally {
      setBusy(false);
    }
  }

  async function generateAndApply() {
    setBusy(true);
    setError(null);
    try {
      const blob = await generateOgPng(payload);
      const file = new File([blob], `og-${Date.now()}.png`, { type: "image/png" });
      const { media } = await mediaApi.upload(siteId, file, sampleTitle);
      const url = absoluteMediaUrl(siteUrl, media.url);
      await sitesApi.update(siteId, {
        settings: { seo: { defaultOgImage: url } },
      });
      if (selectedId || media.id) {
        await ogApi.recordGenerated(siteId, {
          mediaId: media.id,
          url,
          templateId: selectedId || undefined,
        });
      }
      toast.push("OG image generated and set as site default");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generate failed.");
    } finally {
      setBusy(false);
    }
  }

  const bgType = config.background.type;

  return (
    <>
      <PageHeader
        title="OpenGraph Maker"
        description="Template-based social cards. Each generate uploads a new PNG."
        actions={
          <>
            <Link className="btn" to={`/sites/${siteId}/seo`}>
              Back to SEO
            </Link>
            <Button type="button" onClick={() => void createNew()}>
              New template
            </Button>
            <Button type="button" disabled={busy} onClick={() => void saveTemplate()}>
              Save template
            </Button>
            <Button type="button" variant="primary" disabled={busy} onClick={() => void generateAndApply()}>
              Generate & set default
            </Button>
          </>
        }
      />
      {error ? <div className="error">{error}</div> : null}
      <div
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "minmax(260px, 340px) minmax(0, 1fr)",
          alignItems: "start",
        }}
      >
        <div style={{ display: "grid", gap: "0.75rem" }}>
          <div className="card" style={{ display: "grid", gap: "0.65rem" }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <label className="label" htmlFor="og-select">
                Templates
              </label>
              <Select
                id="og-select"
                value={selectedId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedId(id);
                  const row = templates.find((t) => t.id === id);
                  if (row) {
                    setName(row.name);
                    setConfig(ogTemplateSchema.parse(row.config));
                  }
                }}
              >
                <option value="">Unsaved</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                    {t.isDefault ? " (default)" : ""}
                  </option>
                ))}
              </Select>
            </div>
            {selectedId ? (
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                {templates.find((t) => t.id === selectedId)?.isDefault ? (
                  <Badge tone="ok">Default</Badge>
                ) : (
                  <Button type="button" disabled={busy} onClick={() => void makeDefault()}>
                    Make default
                  </Button>
                )}
              </div>
            ) : null}
            <div className="field" style={{ marginBottom: 0 }}>
              <label className="label" htmlFor="og-name">
                Template name
              </label>
              <Input id="og-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label className="label" htmlFor="og-layout">
                Layout
              </label>
              <Select
                id="og-layout"
                value={config.layout}
                onChange={(e) => patchConfig({ layout: e.target.value as OgTemplate["layout"] })}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </Select>
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label className="label" htmlFor="og-bg-type">
                Background
              </label>
              <Select
                id="og-bg-type"
                value={bgType}
                onChange={(e) => {
                  const type = e.target.value as "color" | "gradient" | "image";
                  if (type === "color") patchConfig({ background: { type: "color", value: "#1c1f26" } });
                  else if (type === "gradient")
                    patchConfig({ background: { type: "gradient", from: "#1c1f26", to: "#3a3428" } });
                  else patchConfig({ background: { type: "image", url: "https://example.com/bg.jpg" } });
                }}
              >
                <option value="color">Color</option>
                <option value="gradient">Gradient</option>
                <option value="image">Image URL</option>
              </Select>
            </div>
            {config.background.type === "color" ? (
              <Input
                type="color"
                value={config.background.value}
                onChange={(e) => patchConfig({ background: { type: "color", value: e.target.value } })}
              />
            ) : null}
            {config.background.type === "gradient" ? (
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <Input
                  type="color"
                  value={config.background.from}
                  onChange={(e) =>
                    patchConfig({
                      background: { type: "gradient", from: e.target.value, to: config.background.type === "gradient" ? config.background.to : "#333" },
                    })
                  }
                />
                <Input
                  type="color"
                  value={config.background.to}
                  onChange={(e) =>
                    patchConfig({
                      background: {
                        type: "gradient",
                        from: config.background.type === "gradient" ? config.background.from : "#111",
                        to: e.target.value,
                      },
                    })
                  }
                />
              </div>
            ) : null}
            {config.background.type === "image" ? (
              <Input
                value={config.background.url}
                onChange={(e) => patchConfig({ background: { type: "image", url: e.target.value } })}
                placeholder="https://…"
              />
            ) : null}
            <div className="field" style={{ marginBottom: 0 }}>
              <label className="label" htmlFor="og-title-tpl">
                Title text
              </label>
              <Input
                id="og-title-tpl"
                value={config.title.text}
                onChange={(e) =>
                  patchConfig({ title: { ...config.title, text: e.target.value } })
                }
              />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label className="label" htmlFor="og-title-color">
                Title color
              </label>
              <Input
                id="og-title-color"
                type="color"
                value={config.title.color}
                onChange={(e) => patchConfig({ title: { ...config.title, color: e.target.value } })}
              />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label className="label" htmlFor="og-sub-tpl">
                Subtitle text
              </label>
              <Input
                id="og-sub-tpl"
                value={config.subtitle?.text ?? ""}
                onChange={(e) =>
                  patchConfig({
                    subtitle: {
                      text: e.target.value || "{{siteName}}",
                      color: config.subtitle?.color ?? "#c4b8a0",
                      size: config.subtitle?.size ?? 28,
                    },
                  })
                }
              />
            </div>
            <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input
                type="checkbox"
                checked={config.showHostname}
                onChange={(e) => patchConfig({ showHostname: e.target.checked })}
              />
              Show hostname
            </label>
          </div>
          <div className="card" style={{ display: "grid", gap: "0.65rem" }}>
            <strong>Sample bindings</strong>
            <Input value={sampleTitle} onChange={(e) => setSampleTitle(e.target.value)} placeholder="Title" />
            <Input
              value={sampleExcerpt}
              onChange={(e) => setSampleExcerpt(e.target.value)}
              placeholder="Excerpt"
            />
          </div>
        </div>
        <div className="card">
          <OgCanvas payload={payload} />
        </div>
      </div>
    </>
  );
}
