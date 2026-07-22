import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FilePlus, ExternalLink } from "lucide-react";
import { api, type ContentItem, type Site } from "../api";
import { useAuth } from "../app/providers";
import { PageHeader } from "../components/ui";

export function SitePage({ forcedType }: { forcedType?: "post" | "page" }) {
  const { siteId = "" } = useParams();
  const { orgs } = useAuth();
  const [site, setSite] = useState<Site | null>(null);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const title = forcedType === "page" ? "Pages" : forcedType === "post" ? "Posts" : "Content";

  useEffect(() => {
    void (async () => {
      try {
        const org = orgs[0];
        if (org) {
          const listed = await api.sites(org.id);
          setSite(listed.sites.find((s) => s.id === siteId) ?? null);
        }
        const q = forcedType ? `?type=${forcedType}` : "";
        const list = await api.content(siteId, q);
        setItems(list.content);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load site.");
      }
    })();
  }, [siteId, orgs, forcedType]);

  return (
    <>
      <PageHeader
        title={title}
        description={site ? `${site.slug}.kumooo.dev · theme: ${site.theme}` : undefined}
        actions={
          <Link className="btn primary" to={`/sites/${siteId}/new?type=${forcedType ?? "post"}`}>
            <FilePlus size={16} /> New {forcedType ?? "post"}
          </Link>
        }
      />
      {error ? <div className="error">{error}</div> : null}
      {items.length === 0 ? (
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Nothing here yet.</h2>
          <p className="muted">Draft something. Publish when you're ready.</p>
          <Link className="btn primary" to={`/sites/${siteId}/new?type=${forcedType ?? "post"}`}>
            New {forcedType ?? "post"}
          </Link>
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
    </>
  );
}
