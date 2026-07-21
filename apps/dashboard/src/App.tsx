import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { api, type Org, type User } from "./api";
import { AuthPage } from "./pages/AuthPage";
import { HomePage } from "./pages/HomePage";
import { SitePage } from "./pages/SitePage";
import { EditorPage } from "./pages/EditorPage";
import { MediaPage } from "./pages/MediaPage";

type AuthState = {
  user: User | null;
  orgs: Org[];
  loading: boolean;
  refresh: () => Promise<void>;
  setUser: (u: User | null) => void;
};

const AuthCtx = createContext<AuthState | null>(null);

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth outside provider");
  return ctx;
}

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const me = await api.me();
      setUser(me.user);
      const o = await api.orgs();
      setOrgs(o.organizations);
    } catch {
      setUser(null);
      setOrgs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <AuthCtx.Provider value={{ user, orgs, loading, refresh, setUser }}>{children}</AuthCtx.Provider>
  );
}

function Private({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="muted" style={{ padding: "3rem" }}>Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <AuthProvider>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/signup" element={<AuthPage mode="signup" />} />
          <Route
            path="/"
            element={
              <Private>
                <HomePage />
              </Private>
            }
          />
          <Route
            path="/sites/:siteId"
            element={
              <Private>
                <SitePage />
              </Private>
            }
          />
          <Route
            path="/sites/:siteId/new"
            element={
              <Private>
                <EditorPage />
              </Private>
            }
          />
          <Route
            path="/sites/:siteId/content/:contentId"
            element={
              <Private>
                <EditorPage />
              </Private>
            }
          />
          <Route
            path="/sites/:siteId/media"
            element={
              <Private>
                <MediaPage />
              </Private>
            }
          />
        </Routes>
      </AnimatePresence>
    </AuthProvider>
  );
}

export function Shell({
  title,
  children,
  actions,
}: {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const { user, setUser } = useAuth();
  const nav = useNavigate();
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 960, margin: "0 auto", padding: "1.5rem" }}>
      <header style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1.75rem", flexWrap: "wrap" }}>
        <a href="/" style={{ fontWeight: 700, color: "var(--fg)", letterSpacing: "-0.03em" }}>
          kumooo<span style={{ color: "var(--accent)" }}>.</span>
        </a>
        <strong style={{ marginLeft: "0.5rem" }}>{title}</strong>
        <div style={{ marginLeft: "auto", display: "flex", gap: "0.75rem", alignItems: "center" }}>
          {actions}
          <span className="muted" style={{ fontSize: "0.9rem" }}>{user?.email}</span>
          <button
            className="btn"
            type="button"
            onClick={async () => {
              await api.logout();
              setUser(null);
              nav("/login");
            }}
          >
            Sign out
          </button>
        </div>
      </header>
      {children}
    </motion.div>
  );
}
