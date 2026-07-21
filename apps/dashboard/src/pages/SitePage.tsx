import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FilePlus, Image, ExternalLink } from "lucide-react";
import { api, type ContentItem, type Site } from "../api";
import { Shell, useAuth } from "../App";

export function SitePage() {
  const { siteId = "" } = useParams();
  const { orgs } = useAuth();
  const [site, setSite] = useState<Site | null>(null);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const org = orgs[0];
        if (org) {
          const listed = await api.sites(org.id);
          setSite(listed.sites.find((s) => s.id === siteId) ?? null);
        }
        const list = await api.content(siteId);
        setItems(list.content);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load site.");
      }
    })();
  }, [siteId, orgs]);

  return (
    <Shell
      title={site?.name ?? "Site"}
      actions={
        <>
          <Link className="btn" to={`/sites/${siteId}/media`}><Image size={16} /> Media</Link>
          <Link className="btn primary" to={`/sites/${siteId}/new`}><FilePlus size={16} /> New post</Link>
        </>
      }
    >
      {error ? <div className="error">{error}</div> : null}
      {site ? (
        <p className="muted" style={{ marginTop: 0 }}>
          {site.slug}.kumooo.dev · theme: {site.theme}
        </p>
      ) : null}
      {items.length === 0 ? (
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Nothing here yet.</h2>
          <p className="muted">Draft a post. Publish when you're ready.</p>
          <Link className="btn primary" to={`/sites/${siteId}/new`}>New post</Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.65rem" }}>
          {items.map((item) => (
            <Link
              key={item.id}
              to={`/sites/${siteId}/content/${item.id}`}
              className="card"
              style={{ color: "inherit", display: "flex", justifyContent: "space-between", gap: "1rem" }}
            >
              <div>
                <strong>{item.title}</strong>
                <div className="muted" style={{ fontSize: "0.88rem" }}>
                  {item.type} · {item.status} · /{item.slug}
                </div>
              </div>
              <ExternalLink size={16} className="muted" />
            </Link>
          ))}
        </div>
      )}
    </Shell>
  );
}
