import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Globe } from "lucide-react";
import { api, type Site } from "../api";
import { Shell, useAuth } from "../App";

export function HomePage() {
  const { orgs, refresh } = useAuth();
  const org = orgs[0];
  const [sites, setSites] = useState<Site[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!org) return;
    void api.sites(org.id).then((r) => setSites(r.sites));
  }, [org]);

  async function createSite(e: React.FormEvent) {
    e.preventDefault();
    if (!org) return;
    setError(null);
    try {
      const { site } = await api.createSite(org.id, { name });
      setSites((s) => [...s, site]);
      setName("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create site.");
    }
  }

  if (!org) {
    return (
      <Shell title="Home">
        <p className="muted">No workspace yet. Sign up again or refresh.</p>
      </Shell>
    );
  }

  return (
    <Shell title="Sites">
      {sites.length === 0 ? (
        <div className="card" style={{ marginBottom: "1.25rem" }}>
          <h2 style={{ marginTop: 0 }}>You don't have any sites yet.</h2>
          <p className="muted">Let's build one.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem", marginBottom: "1.5rem" }}>
          {sites.map((s) => (
            <Link key={s.id} to={`/sites/${s.id}`} className="card" style={{ color: "inherit", display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <Globe size={18} />
              <div>
                <strong>{s.name}</strong>
                <div className="muted" style={{ fontSize: "0.9rem" }}>{s.slug}.kumooo.dev · theme: {s.theme}</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {error ? <div className="error">{error}</div> : null}
      <form className="card" onSubmit={createSite} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "end" }}>
        <div className="field" style={{ flex: 1, marginBottom: 0, minWidth: 200 }}>
          <label className="label" htmlFor="site-name">New site</label>
          <input className="input" id="site-name" placeholder="My blog" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <button className="btn primary" type="submit"><Plus size={16} /> Create site</button>
      </form>
    </Shell>
  );
}
