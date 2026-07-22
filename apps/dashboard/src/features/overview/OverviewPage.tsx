import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FilePlus, Globe, Image, LayoutTemplate, Upload } from "lucide-react";
import { Badge, EmptyState, PageHeader, Skeleton } from "../../components/ui";
import { overviewApi, type SiteEvent, type SiteOverview } from "../../lib/api/overview";

function healthCopy(status: string): string {
  switch (status) {
    case "live":
      return "Your site is reachable.";
    case "dns_missing":
      return "This hostname does not resolve yet.";
    case "unreachable":
      return "DNS works, but the renderer did not respond.";
    case "archived":
      return "This site is archived.";
    default:
      return "Checking site health.";
  }
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  return new Date(iso).toLocaleString();
}

export function OverviewPage() {
  const { siteId = "" } = useParams();
  const [data, setData] = useState<SiteOverview | null>(null);
  const [events, setEvents] = useState<SiteEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const [overview, feed] = await Promise.all([
          overviewApi.get(siteId),
          overviewApi.events(siteId, 20),
        ]);
        setData(overview);
        setEvents(feed.events);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load overview.");
      } finally {
        setLoading(false);
      }
    })();
  }, [siteId]);

  if (loading) {
    return (
      <>
        <PageHeader title="Overview" />
        <div style={{ display: "grid", gap: "0.75rem" }}>
          <Skeleton height={72} />
          <Skeleton height={120} />
          <Skeleton height={160} />
        </div>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <PageHeader title="Overview" />
        <div className="error">{error ?? "Overview unavailable."}</div>
      </>
    );
  }

  const tone =
    data.routing.status === "live" ? "ok" : data.routing.status === "archived" ? "warn" : "danger";

  return (
    <>
      <PageHeader
        title={data.site.name}
        description={data.site.url}
        actions={
          data.routing.status === "live" ? (
            <a className="btn" href={data.site.url} target="_blank" rel="noreferrer">
              <Globe size={16} /> View site
            </a>
          ) : null
        }
      />

      <div className="card" style={{ marginBottom: "1rem", display: "flex", gap: "0.75rem", alignItems: "center" }}>
        <Badge tone={tone}>{data.routing.status}</Badge>
        <div>
          <strong>{healthCopy(data.routing.status)}</strong>
          <div className="muted" style={{ fontSize: "0.88rem" }}>
            {data.routing.tenantHostname} · checked {relativeTime(data.routing.checkedAt)}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "0.75rem",
          marginBottom: "1rem",
        }}
      >
        <div className="card">
          <div className="muted">Published</div>
          <strong style={{ fontSize: "1.4rem" }}>{data.counts.published}</strong>
        </div>
        <div className="card">
          <div className="muted">Drafts</div>
          <strong style={{ fontSize: "1.4rem" }}>{data.counts.drafts}</strong>
        </div>
        <div className="card">
          <div className="muted">Media</div>
          <strong style={{ fontSize: "1.4rem" }}>{data.counts.media}</strong>
        </div>
        <div className="card">
          <div className="muted">SEO score</div>
          <strong style={{ fontSize: "1.4rem" }}>{data.seo.score}</strong>
        </div>
        <div className="card">
          <div className="muted">Theme</div>
          <strong style={{ fontSize: "1.1rem" }}>{data.theme}</strong>
        </div>
        <div className="card">
          <div className="muted">Last publish</div>
          <strong style={{ fontSize: "1rem" }}>
            {data.lastPublishedAt ? relativeTime(data.lastPublishedAt) : "Never"}
          </strong>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Quick actions</h2>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <Link className="btn primary" to={`/sites/${siteId}/new`}>
            <FilePlus size={16} /> Create post
          </Link>
          <Link className="btn" to={`/sites/${siteId}/media`}>
            <Upload size={16} /> Upload media
          </Link>
          <Link className="btn" to={`/sites/${siteId}/design/themes`}>
            <LayoutTemplate size={16} /> Themes
          </Link>
          <Link className="btn" to={`/sites/${siteId}/domains`}>
            <Globe size={16} /> Domains
          </Link>
          <Link className="btn" to={`/sites/${siteId}/media`}>
            <Image size={16} /> Media library
          </Link>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Activity</h2>
        {events.length === 0 ? (
          <EmptyState title="No activity yet" body="Publishes, restores, and settings changes will show up here." />
        ) : (
          <div style={{ display: "grid", gap: "0.65rem" }}>
            {events.map((e) => (
              <div key={e.id} style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                <div>
                  <strong>{e.type}</strong>
                  <div className="muted" style={{ fontSize: "0.85rem" }}>
                    {e.resourceType ?? "site"}
                    {e.resourceId ? ` · ${e.resourceId}` : ""}
                  </div>
                </div>
                <span className="muted" style={{ fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                  {relativeTime(e.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
