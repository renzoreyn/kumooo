import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Globe, Plus, Search } from "lucide-react";
import { SimpleShell } from "../../app/AppShell";
import { useAuth } from "../../app/providers";
import { Badge, Button, EmptyState, Input, PageHeader } from "../../components/ui";
import { overviewApi, type RoutingHealth } from "../../lib/api/overview";
import { sitesApi, type Site } from "../../lib/api/sites";
import { CreateSiteDialog } from "./CreateSiteDialog";

type SiteCard = Site & { routing?: RoutingHealth };

export function AllSitesPage() {
  const { orgs, refresh } = useAuth();
  const org = orgs[0];
  const [sites, setSites] = useState<SiteCard[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!org) return;
    void (async () => {
      try {
        const { sites: listed } = await sitesApi.list(org.id);
        const withHealth = await Promise.all(
          listed.map(async (site) => {
            try {
              const { routing } = await overviewApi.routingHealth(site.id);
              return { ...site, routing };
            } catch {
              return site;
            }
          }),
        );
        setSites(withHealth);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load sites.");
      }
    })();
  }, [org]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sites;
    return sites.filter(
      (s) => s.name.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q),
    );
  }, [sites, query]);

  if (!org) {
    return (
      <SimpleShell title="Sites">
        <p className="muted">No workspace yet. Sign up again or refresh.</p>
      </SimpleShell>
    );
  }

  return (
    <SimpleShell title="Sites">
      <PageHeader
        title="Sites"
        description="Open a site dashboard or visit it when routing is live."
        actions={
          <Button type="button" variant="primary" onClick={() => setOpen(true)}>
            <Plus size={16} /> New site
          </Button>
        }
      />
      <div className="field" style={{ maxWidth: 360 }}>
        <label className="label" htmlFor="site-search">
          Search
        </label>
        <div style={{ position: "relative" }}>
          <Search
            size={16}
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }}
          />
          <Input
            id="site-search"
            style={{ paddingLeft: "2.2rem" }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a site"
          />
        </div>
      </div>
      {error ? <div className="error">{error}</div> : null}
      {filtered.length === 0 ? (
        <EmptyState
          title="No sites yet"
          body="Create a site to start publishing."
          action={
            <Button type="button" variant="primary" onClick={() => setOpen(true)}>
              <Plus size={16} /> Create site
            </Button>
          }
        />
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {filtered.map((s) => {
            const live = s.routing?.status === "live";
            const hostname = s.url ? new URL(s.url).hostname : `${s.slug}.kumooo.dev`;
            return (
              <div key={s.id} className="card" style={{ display: "grid", gap: "0.75rem" }}>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                  <Globe size={18} />
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <strong>{s.name}</strong>
                    <div className="muted" style={{ fontSize: "0.9rem" }}>
                      {hostname} · theme: {s.theme}
                    </div>
                  </div>
                  <Badge tone={live ? "ok" : s.status === "archived" ? "warn" : "default"}>
                    {live ? "Live" : s.routing?.status === "dns_missing" ? "DNS missing" : s.status ?? "active"}
                  </Badge>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <Link className="btn primary" to={`/sites/${s.id}`}>
                    Open dashboard
                  </Link>
                  {live && s.url ? (
                    <a className="btn" href={s.url} target="_blank" rel="noreferrer">
                      <ExternalLink size={16} /> Visit
                    </a>
                  ) : (
                    <Button type="button" disabled title="Visit unlocks when public DNS resolves">
                      Visit
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <CreateSiteDialog
        open={open}
        orgId={org.id}
        onClose={() => setOpen(false)}
        onCreated={(site) => {
          setSites((prev) => [...prev, site]);
          void refresh();
        }}
      />
    </SimpleShell>
  );
}
