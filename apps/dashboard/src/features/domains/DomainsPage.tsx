import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useParams } from "react-router-dom";
import { Plus, RefreshCw, Trash2 } from "lucide-react";
import { Badge, Button, EmptyState, Input, PageHeader } from "../../components/ui";
import { ConfirmDialog } from "../../components/ui/Dialog";
import { useToast } from "../../components/ui/Toast";
import {
  domainsApi,
  type DnsRecord,
  type DomainItem,
  type DomainVerifyResult,
} from "../../lib/api/domains";
import { overviewApi, type RoutingHealth } from "../../lib/api/overview";

export function DomainsPage() {
  const { siteId = "" } = useParams();
  const toast = useToast();
  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [tenantHostname, setTenantHostname] = useState("");
  const [routing, setRouting] = useState<RoutingHealth | null>(null);
  const [hostname, setHostname] = useState("");
  const [records, setRecords] = useState<DnsRecord[]>([]);
  const [lastVerify, setLastVerify] = useState<DomainVerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DomainItem | null>(null);

  const load = useCallback(async () => {
    const [dom, health] = await Promise.all([
      domainsApi.list(siteId),
      overviewApi.routingHealth(siteId),
    ]);
    setDomains(dom.domains);
    setTenantHostname(dom.tenantHostname);
    setRouting(health.routing);
  }, [siteId]);

  useEffect(() => {
    void load().catch((err) => setError(err instanceof Error ? err.message : "Could not load."));
  }, [load]);

  async function addDomain(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await domainsApi.create(siteId, hostname.trim());
      if (res.records) setRecords(res.records);
      if (res.note) toast.push(res.note);
      else toast.push("Domain added");
      setHostname("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add domain.");
    } finally {
      setBusy(false);
    }
  }

  async function verify(domain: DomainItem) {
    setBusy(true);
    setError(null);
    try {
      const res = await domainsApi.verify(siteId, domain.id);
      setLastVerify(res);
      setRecords(res.records);
      toast.push(
        res.status === "active" ? "Domain verified" : res.dnsOk ? "DNS found, HTTPS incomplete" : "Still waiting on DNS",
      );
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verify failed.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await domainsApi.remove(siteId, deleteTarget.id);
      toast.push("Domain removed");
      setDeleteTarget(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Remove failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title="Domains" description="Platform hostname plus guided custom domains" />
      {error ? <div className="error">{error}</div> : null}

      <div className="card" style={{ marginBottom: "1rem", display: "grid", gap: "0.65rem" }}>
        <strong>Platform hostname</strong>
        <div className="muted">{tenantHostname || "…"}</div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <Badge tone={routing?.dnsOk ? "ok" : "warn"}>DNS {routing?.dnsOk ? "ok" : "missing"}</Badge>
          <Badge tone={routing?.httpOk ? "ok" : "warn"}>HTTP {routing?.httpOk ? "ok" : "no"}</Badge>
          <Badge tone={routing?.status === "live" ? "ok" : "default"}>Routing {routing?.status ?? "…"}</Badge>
        </div>
        <p className="muted" style={{ margin: 0, fontSize: "0.88rem" }}>
          Public wildcard DNS for `*.kumooo.dev` must point at the renderer (AAAA `*` → `100::`, proxied) before
          tenant URLs resolve.
        </p>
      </div>

      <form className="card" style={{ marginBottom: "1rem", display: "grid", gap: "0.75rem" }} onSubmit={(e) => void addDomain(e)}>
        <strong>Add custom domain</strong>
        <div className="field" style={{ marginBottom: 0 }}>
          <label className="label" htmlFor="domain-host">
            Hostname
          </label>
          <Input
            id="domain-host"
            value={hostname}
            onChange={(e) => setHostname(e.target.value)}
            placeholder="www.example.com"
            required
          />
        </div>
        <Button type="submit" variant="primary" disabled={busy}>
          <Plus size={16} /> Add domain
        </Button>
      </form>

      {records.length > 0 ? (
        <div className="card" style={{ marginBottom: "1rem" }}>
          <strong>Required DNS</strong>
          <div style={{ overflowX: "auto", marginTop: "0.65rem" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
              <thead>
                <tr>
                  <th align="left">Type</th>
                  <th align="left">Name</th>
                  <th align="left">Value</th>
                  <th align="left">Proxied</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={i}>
                    <td>{r.type}</td>
                    <td>{r.name}</td>
                    <td style={{ wordBreak: "break-all" }}>{r.value}</td>
                    <td>{r.proxied ? "yes" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {lastVerify ? (
        <div className="card" style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <Badge tone={lastVerify.dnsOk ? "ok" : "warn"}>DNS {lastVerify.dnsOk ? "ok" : "no"}</Badge>
          <Badge tone={lastVerify.sslOk ? "ok" : "warn"}>SSL {lastVerify.sslOk ? "ok" : "no"}</Badge>
          <Badge tone={lastVerify.httpOk ? "ok" : "warn"}>CDN/HTTP {lastVerify.httpOk ? "ok" : "no"}</Badge>
          <Badge tone={lastVerify.status === "active" ? "ok" : "default"}>{lastVerify.status}</Badge>
        </div>
      ) : null}

      {domains.length === 0 ? (
        <EmptyState title="No custom domains" body="Add a hostname you control, then follow the DNS table." />
      ) : (
        <div style={{ display: "grid", gap: "0.65rem" }}>
          {domains.map((d) => (
            <div key={d.id} className="card" style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
              <div>
                <strong>{d.hostname}</strong>
                <div className="muted" style={{ fontSize: "0.88rem" }}>
                  Status: {d.status}
                  {d.verifiedAt ? ` · verified ${new Date(d.verifiedAt).toLocaleString()}` : ""}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.35rem" }}>
                <Button type="button" disabled={busy} onClick={() => void verify(d)}>
                  <RefreshCw size={16} /> Verify
                </Button>
                <Button type="button" variant="danger" onClick={() => setDeleteTarget(d)}>
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Remove domain?"
        body={deleteTarget ? `Stop serving ${deleteTarget.hostname} on this site.` : ""}
        confirmLabel="Remove"
        danger
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void remove()}
      />
    </>
  );
}
