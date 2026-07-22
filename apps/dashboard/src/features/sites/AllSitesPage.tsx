import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Archive, ExternalLink, Globe, Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import { SimpleShell } from "../../app/AppShell";
import { useAuth } from "../../app/providers";
import { Badge, Button, EmptyState, Input, PageHeader, Select } from "../../components/ui";
import { Dialog } from "../../components/ui/Dialog";
import { useToast } from "../../components/ui/Toast";
import { overviewApi, type RoutingHealth } from "../../lib/api/overview";
import { sitesApi, type Site } from "../../lib/api/sites";
import { CreateSiteDialog } from "./CreateSiteDialog";

type SiteCard = Site & { routing?: RoutingHealth };

export function AllSitesPage() {
  const { orgs, refresh } = useAuth();
  const toast = useToast();
  const org = orgs[0];
  const [sites, setSites] = useState<SiteCard[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"active" | "archived" | "all">("active");
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SiteCard | null>(null);
  const [confirmSlug, setConfirmSlug] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    if (!org) return;
    const status = filter === "active" ? undefined : filter;
    const { sites: listed } = await sitesApi.list(org.id, status);
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
  }

  useEffect(() => {
    if (!org) return;
    void load().catch((err) => setError(err instanceof Error ? err.message : "Could not load sites."));
  }, [org, filter]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sites;
    return sites.filter(
      (s) => s.name.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q),
    );
  }, [sites, query]);

  async function archive(site: SiteCard) {
    setBusy(true);
    try {
      await sitesApi.archive(site.id);
      toast.push(`Archived ${site.name}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Archive failed.");
    } finally {
      setBusy(false);
    }
  }

  async function restore(site: SiteCard) {
    setBusy(true);
    try {
      await sitesApi.restore(site.id);
      toast.push(`Restored ${site.name}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Restore failed.");
    } finally {
      setBusy(false);
    }
  }

  async function hardDelete() {
    if (!deleteTarget) return;
    if (confirmSlug !== deleteTarget.slug) {
      setError(`Type ${deleteTarget.slug} to confirm.`);
      return;
    }
    setBusy(true);
    try {
      await sitesApi.remove(deleteTarget.id, confirmSlug);
      toast.push(`Deleted ${deleteTarget.name}`);
      setDeleteTarget(null);
      setConfirmSlug("");
      await load();
      void refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setBusy(false);
    }
  }

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
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
        <div className="field" style={{ flex: 1, maxWidth: 360, marginBottom: 0 }}>
          <label className="label" htmlFor="site-search">
            Search
          </label>
          <div style={{ position: "relative" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--muted)",
              }}
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
        <div className="field" style={{ minWidth: 140, marginBottom: 0 }}>
          <label className="label" htmlFor="site-filter">
            Status
          </label>
          <Select
            id="site-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value as "active" | "archived" | "all")}
          >
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="all">All</option>
          </Select>
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
            const archived = s.status === "archived";
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
                  <Badge tone={live ? "ok" : archived ? "warn" : "default"}>
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
                  {archived ? (
                    <Button type="button" disabled={busy} onClick={() => void restore(s)}>
                      <RotateCcw size={16} /> Restore
                    </Button>
                  ) : (
                    <Button type="button" disabled={busy} onClick={() => void archive(s)}>
                      <Archive size={16} /> Archive
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="danger"
                    disabled={busy}
                    onClick={() => {
                      setConfirmSlug("");
                      setDeleteTarget(s);
                    }}
                  >
                    <Trash2 size={16} /> Delete
                  </Button>
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
      <Dialog open={Boolean(deleteTarget)} title="Delete site permanently?" onClose={() => setDeleteTarget(null)}>
        <p className="muted">
          Removes content, media metadata, domains, and events for <strong>{deleteTarget?.name}</strong>. Type{" "}
          <strong>{deleteTarget?.slug}</strong> to confirm.
        </p>
        <div className="field">
          <label className="label" htmlFor="all-sites-confirm-slug">
            Confirm slug
          </label>
          <Input
            id="all-sites-confirm-slug"
            value={confirmSlug}
            onChange={(e) => setConfirmSlug(e.target.value)}
            autoComplete="off"
          />
        </div>
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
          <Button type="button" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={busy || !deleteTarget || confirmSlug !== deleteTarget.slug}
            onClick={() => void hardDelete()}
          >
            Delete forever
          </Button>
        </div>
      </Dialog>
    </SimpleShell>
  );
}
