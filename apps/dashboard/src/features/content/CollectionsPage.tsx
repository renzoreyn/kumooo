import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FileText, Type } from "lucide-react";
import { EmptyState, PageHeader } from "../../components/ui";
import { contentApi } from "../../lib/api/content";

type Collection = { type: string; count: number; href: string; label: string };

export function CollectionsPage() {
  const { siteId = "" } = useParams();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await contentApi.list(siteId, "?perPage=100");
        const counts = new Map<string, number>();
        for (const item of res.content) {
          counts.set(item.type, (counts.get(item.type) ?? 0) + 1);
        }
        const builtins: Collection[] = [
          {
            type: "post",
            label: "Posts",
            count: counts.get("post") ?? 0,
            href: `/sites/${siteId}/posts`,
          },
          {
            type: "page",
            label: "Pages",
            count: counts.get("page") ?? 0,
            href: `/sites/${siteId}/pages`,
          },
        ];
        const extras = [...counts.keys()]
          .filter((t) => t !== "post" && t !== "page")
          .map((type) => ({
            type,
            label: type,
            count: counts.get(type) ?? 0,
            href: `/sites/${siteId}/posts`,
          }));
        setCollections([...builtins, ...extras]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load collections.");
      }
    })();
  }, [siteId]);

  return (
    <>
      <PageHeader
        title="Collections"
        description="Available content types on this site. Schema editing ships later."
      />
      {error ? <div className="error">{error}</div> : null}
      {collections.length === 0 ? (
        <EmptyState title="No content types yet" body="Create a post or page to get started." />
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {collections.map((c) => (
            <Link
              key={c.type}
              to={c.href}
              className="card"
              style={{ color: "inherit", display: "flex", gap: "0.75rem", alignItems: "center" }}
            >
              {c.type === "page" ? <Type size={18} /> : <FileText size={18} />}
              <div style={{ flex: 1 }}>
                <strong>{c.label}</strong>
                <div className="muted" style={{ fontSize: "0.88rem" }}>
                  {c.count} item{c.count === 1 ? "" : "s"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
