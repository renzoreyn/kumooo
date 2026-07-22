import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { api, type Site } from "../../api";
import { useAuth } from "../../app/providers";

export function SiteSwitcher() {
  const { siteId = "" } = useParams();
  const { orgs } = useAuth();
  const org = orgs[0];
  const nav = useNavigate();
  const [sites, setSites] = useState<Site[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!org) return;
    void api.sites(org.id).then((r) => setSites(r.sites)).catch(() => setSites([]));
  }, [org]);

  const current = sites.find((s) => s.id === siteId);

  return (
    <div style={{ position: "relative" }}>
      <button className="btn ghost" type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        {current?.name ?? "Select site"}
        <ChevronDown size={16} />
      </button>
      {open ? (
        <div
          className="card"
          style={{
            position: "absolute",
            top: "110%",
            left: 0,
            minWidth: 220,
            zIndex: 20,
            padding: "0.5rem",
            display: "grid",
            gap: "0.25rem",
          }}
        >
          {sites.map((s) => (
            <button
              key={s.id}
              className="btn ghost"
              type="button"
              style={{ justifyContent: "flex-start" }}
              onClick={() => {
                setOpen(false);
                nav(`/sites/${s.id}`);
              }}
            >
              {s.name}
            </button>
          ))}
          <Link to="/" className="btn ghost" onClick={() => setOpen(false)} style={{ justifyContent: "flex-start" }}>
            All sites
          </Link>
        </div>
      ) : null}
    </div>
  );
}
