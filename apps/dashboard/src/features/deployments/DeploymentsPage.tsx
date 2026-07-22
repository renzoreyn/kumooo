import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge, EmptyState, PageHeader } from "../../components/ui";
import { overviewApi, type SiteEvent } from "../../lib/api/overview";

const RELEASE_TYPES = new Set([
  "content.published",
  "content.scheduled",
  "content.restored",
  "site.theme_changed",
  "site.settings_changed",
  "domain.added",
  "domain.verified",
  "domain.error",
  "domain.removed",
  "og.generated",
  "media.uploaded",
  "media.deleted",
  "site.archived",
  "site.restored",
]);

function labelFor(type: string): string {
  return type.replace(/\./g, " · ");
}

export function DeploymentsPage() {
  const { siteId = "" } = useParams();
  const [events, setEvents] = useState<SiteEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void overviewApi
      .events(siteId, 50)
      .then((r) => setEvents(r.events))
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load."));
  }, [siteId]);

  const releases = useMemo(
    () => events.filter((e) => RELEASE_TYPES.has(e.type)),
    [events],
  );

  return (
    <>
      <PageHeader
        title="Deployments"
        description="Real publish and configuration events, not Git builds."
      />
      {error ? <div className="error">{error}</div> : null}
      {releases.length === 0 ? (
        <EmptyState
          title="No release activity yet"
          body="Publish a post, change a theme, or verify a domain to populate this timeline."
        />
      ) : (
        <div style={{ display: "grid", gap: "0.65rem" }}>
          {releases.map((e) => {
            const meta = e.metadata ?? {};
            const contentId = typeof meta.contentId === "string" ? meta.contentId : e.resourceType === "content" ? e.resourceId : null;
            const revisionId = typeof meta.revisionId === "string" ? meta.revisionId : null;
            return (
              <div key={e.id} className="card" style={{ display: "grid", gap: "0.35rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
                  <strong>{labelFor(e.type)}</strong>
                  <Badge>{new Date(e.createdAt).toLocaleString()}</Badge>
                </div>
                {typeof meta.title === "string" || typeof meta.hostname === "string" || typeof meta.to === "string" ? (
                  <div className="muted" style={{ fontSize: "0.88rem" }}>
                    {typeof meta.title === "string" ? meta.title : null}
                    {typeof meta.hostname === "string" ? meta.hostname : null}
                    {typeof meta.to === "string" ? `theme → ${meta.to}` : null}
                    {typeof meta.slug === "string" ? ` /${meta.slug}` : null}
                  </div>
                ) : null}
                {contentId ? (
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Link className="btn" to={`/sites/${siteId}/content/${contentId}`}>
                      Open content
                    </Link>
                    {revisionId ? (
                      <span className="muted" style={{ fontSize: "0.8rem", alignSelf: "center" }}>
                        revision {revisionId}
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
