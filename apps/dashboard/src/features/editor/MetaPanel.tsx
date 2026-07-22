import { Button, Input, Select, Textarea } from "../../components/ui";

export type MetaDraft = {
  excerpt: string;
  tags: string;
  featuredImage: string;
  status: string;
  scheduledAt: string;
  seoTitle: string;
  seoDescription: string;
  seoCanonical: string;
  seoOgImage: string;
  noindex: boolean;
  type: "post" | "page";
};

export function MetaPanel({
  open,
  draft,
  onChange,
  revisions,
  onRestore,
  onGenerateOg,
  generatingOg,
}: {
  open: boolean;
  draft: MetaDraft;
  onChange: (patch: Partial<MetaDraft>) => void;
  revisions: { id: string; createdBy: string; createdAt: string }[];
  onRestore: (revisionId: string) => void;
  onGenerateOg?: () => void;
  generatingOg?: boolean;
}) {
  if (!open) return null;
  return (
    <aside className="card" style={{ display: "grid", gap: "0.75rem", alignContent: "start" }}>
      <h2 style={{ margin: 0, fontSize: "1rem" }}>Details</h2>
      <div className="field" style={{ marginBottom: 0 }}>
        <label className="label" htmlFor="meta-type">
          Type
        </label>
        <Select
          id="meta-type"
          value={draft.type}
          onChange={(e) => onChange({ type: e.target.value as "post" | "page" })}
        >
          <option value="post">Post</option>
          <option value="page">Page</option>
        </Select>
      </div>
      <div className="field" style={{ marginBottom: 0 }}>
        <label className="label" htmlFor="meta-status">
          Status
        </label>
        <Select id="meta-status" value={draft.status} onChange={(e) => onChange({ status: e.target.value })}>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </Select>
      </div>
      <div className="field" style={{ marginBottom: 0 }}>
        <label className="label" htmlFor="meta-schedule">
          Schedule (ISO)
        </label>
        <Input
          id="meta-schedule"
          value={draft.scheduledAt}
          onChange={(e) => onChange({ scheduledAt: e.target.value })}
          placeholder="2026-07-22T18:00:00.000Z"
        />
      </div>
      <div className="field" style={{ marginBottom: 0 }}>
        <label className="label" htmlFor="meta-excerpt">
          Excerpt
        </label>
        <Textarea
          id="meta-excerpt"
          style={{ minHeight: "5rem" }}
          value={draft.excerpt}
          onChange={(e) => onChange({ excerpt: e.target.value })}
        />
      </div>
      <div className="field" style={{ marginBottom: 0 }}>
        <label className="label" htmlFor="meta-tags">
          Tags (comma-separated)
        </label>
        <Input id="meta-tags" value={draft.tags} onChange={(e) => onChange({ tags: e.target.value })} />
      </div>
      <div className="field" style={{ marginBottom: 0 }}>
        <label className="label" htmlFor="meta-feature">
          Featured image URL
        </label>
        <Input
          id="meta-feature"
          value={draft.featuredImage}
          onChange={(e) => onChange({ featuredImage: e.target.value })}
        />
      </div>
      <h3 style={{ margin: "0.5rem 0 0", fontSize: "0.95rem" }}>SEO</h3>
      <div className="field" style={{ marginBottom: 0 }}>
        <label className="label" htmlFor="seo-title">
          SEO title
        </label>
        <Input id="seo-title" value={draft.seoTitle} onChange={(e) => onChange({ seoTitle: e.target.value })} />
      </div>
      <div className="field" style={{ marginBottom: 0 }}>
        <label className="label" htmlFor="seo-desc">
          Meta description
        </label>
        <Textarea
          id="seo-desc"
          style={{ minHeight: "4.5rem" }}
          value={draft.seoDescription}
          onChange={(e) => onChange({ seoDescription: e.target.value })}
        />
      </div>
      <div className="field" style={{ marginBottom: 0 }}>
        <label className="label" htmlFor="seo-canonical">
          Canonical URL
        </label>
        <Input
          id="seo-canonical"
          value={draft.seoCanonical}
          onChange={(e) => onChange({ seoCanonical: e.target.value })}
        />
      </div>
      <div className="field" style={{ marginBottom: 0 }}>
        <label className="label" htmlFor="seo-og">
          Social image URL
        </label>
        <Input id="seo-og" value={draft.seoOgImage} onChange={(e) => onChange({ seoOgImage: e.target.value })} />
      </div>
      {onGenerateOg ? (
        <Button type="button" disabled={generatingOg} onClick={onGenerateOg}>
          {generatingOg ? "Generating…" : "Generate social image"}
        </Button>
      ) : null}
      <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <input
          type="checkbox"
          checked={draft.noindex}
          onChange={(e) => onChange({ noindex: e.target.checked })}
        />
        Noindex
      </label>
      <h3 style={{ margin: "0.5rem 0 0", fontSize: "0.95rem" }}>Revisions</h3>
      {revisions.length === 0 ? (
        <p className="muted" style={{ margin: 0 }}>
          No revisions yet.
        </p>
      ) : (
        <div style={{ display: "grid", gap: "0.4rem" }}>
          {revisions.map((r) => (
            <div key={r.id} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <span className="muted" style={{ flex: 1, fontSize: "0.82rem" }}>
                {new Date(r.createdAt).toLocaleString()}
              </span>
              <Button type="button" onClick={() => onRestore(r.id)}>
                Restore
              </Button>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
