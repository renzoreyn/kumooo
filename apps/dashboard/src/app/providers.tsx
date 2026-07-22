import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, type Org, type User } from "../api";
import { ToastProvider } from "../components/ui/Toast";

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

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>{children}</ToastProvider>
    </AuthProvider>
  );
}
