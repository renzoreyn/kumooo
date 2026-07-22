import { useEffect, useState, type ReactNode } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { MenuIcon, SidebarNav } from "../components/nav/Sidebar";
import { SiteSwitcher } from "../components/nav/SiteSwitcher";
import { Button } from "../components/ui";
import { api } from "../api";
import { useAuth } from "./providers";

export function AppShell() {
  const { user, setUser } = useAuth();
  const nav = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Site navigation">
        <SidebarNav />
      </aside>
      <div className="main">
        <header className="topbar">
          <button
            className="btn menu-btn"
            type="button"
            aria-label="Open navigation"
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </button>
          <SiteSwitcher />
          <div style={{ marginLeft: "auto", display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <span className="muted" style={{ fontSize: "0.9rem" }}>
              {user?.email}
            </span>
            <Button
              type="button"
              onClick={async () => {
                await api.logout();
                setUser(null);
                nav("/login");
              }}
            >
              Sign out
            </Button>
          </div>
        </header>
        <div className="content">
          <Outlet />
        </div>
      </div>
      {drawerOpen ? (
        <>
          <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)} />
          <aside className="drawer" role="dialog" aria-modal="true" aria-label="Navigation drawer">
            <SidebarNav onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </>
      ) : null}
    </div>
  );
}

export function SimpleShell({ title, children, actions }: { title: string; children: ReactNode; actions?: ReactNode }) {
  const { user, setUser } = useAuth();
  const nav = useNavigate();
  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "1.5rem" }}>
      <header
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          marginBottom: "1.75rem",
          flexWrap: "wrap",
        }}
      >
        <a href="/" style={{ fontWeight: 700, color: "var(--fg)", letterSpacing: "-0.03em" }}>
          kumooo<span style={{ color: "var(--accent)" }}>.</span>
        </a>
        <strong style={{ marginLeft: "0.5rem" }}>{title}</strong>
        <div style={{ marginLeft: "auto", display: "flex", gap: "0.75rem", alignItems: "center" }}>
          {actions}
          <span className="muted" style={{ fontSize: "0.9rem" }}>
            {user?.email}
          </span>
          <Button
            type="button"
            onClick={async () => {
              await api.logout();
              setUser(null);
              nav("/login");
            }}
          >
            Sign out
          </Button>
        </div>
      </header>
      {children}
    </div>
  );
}
