import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell, SimpleShell } from "./AppShell";
import { useAuth } from "./providers";
import { AuthPage } from "../pages/AuthPage";
import { AllSitesPage } from "../features/sites/AllSitesPage";
import { MediaPage } from "../features/media/MediaPage";
import { OverviewPage } from "../features/overview/OverviewPage";
import { ContentListPage } from "../features/content/ContentListPage";
import { CollectionsPage } from "../features/content/CollectionsPage";
import { EditorPage } from "../features/editor/EditorPage";
import { ThemesPage } from "../features/design/ThemesPage";
import { NavigationPage } from "../features/design/NavigationPage";
import { SeoPage } from "../features/seo/SeoPage";
import { OgMakerPage } from "../features/seo/OgMakerPage";
import { DomainsPage } from "../features/domains/DomainsPage";
import { DeploymentsPage } from "../features/deployments/DeploymentsPage";
import { SettingsPage } from "../features/settings/SettingsPage";
import type { ReactNode } from "react";

function Private({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="muted" style={{ padding: "3rem" }}>Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/signup" element={<AuthPage mode="signup" />} />
      <Route
        path="/"
        element={
          <Private>
            <AllSitesPage />
          </Private>
        }
      />
      <Route
        path="/sites/:siteId"
        element={
          <Private>
            <AppShell />
          </Private>
        }
      >
        <Route index element={<OverviewPage />} />
        <Route path="posts" element={<ContentListPage type="post" />} />
        <Route path="pages" element={<ContentListPage type="page" />} />
        <Route path="collections" element={<CollectionsPage />} />
        <Route path="media" element={<MediaPage />} />
        <Route path="design/themes" element={<ThemesPage />} />
        <Route path="design/navigation" element={<NavigationPage />} />
        <Route path="seo" element={<SeoPage />} />
        <Route path="seo/og" element={<OgMakerPage />} />
        <Route path="deployments" element={<DeploymentsPage />} />
        <Route path="domains" element={<DomainsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="new" element={<EditorPage />} />
        <Route path="content/:contentId" element={<EditorPage />} />
      </Route>
    </Routes>
  );
}

export { SimpleShell };
