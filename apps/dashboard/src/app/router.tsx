import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell, SimpleShell } from "./AppShell";
import { useAuth } from "./providers";
import { AuthPage } from "../pages/AuthPage";
import { AllSitesPage } from "../features/sites/AllSitesPage";
import { SitePage } from "../pages/SitePage";
import { EditorPage } from "../pages/EditorPage";
import { MediaPage } from "../pages/MediaPage";
import { PlaceholderPage } from "../features/common/PlaceholderPage";
import { OverviewPage } from "../features/overview/OverviewPage";
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
        <Route path="posts" element={<SitePage forcedType="post" />} />
        <Route path="pages" element={<SitePage forcedType="page" />} />
        <Route
          path="collections"
          element={
            <PlaceholderPage
              title="Collections"
              body="Collections will list available content types and route into filtered views."
            />
          }
        />
        <Route path="media" element={<MediaPage />} />
        <Route
          path="design/themes"
          element={<PlaceholderPage title="Themes" body="Theme gallery lands with the design screens task." />}
        />
        <Route
          path="design/navigation"
          element={
            <PlaceholderPage title="Navigation" body="Nav editor lands with the design screens task." />
          }
        />
        <Route path="seo" element={<PlaceholderPage title="SEO" body="SEO settings and health land next." />} />
        <Route
          path="deployments"
          element={
            <PlaceholderPage title="Deployments" body="Release activity from real site events comes later." />
          }
        />
        <Route
          path="domains"
          element={<PlaceholderPage title="Domains" body="Guided custom domains come after media and SEO." />}
        />
        <Route
          path="settings"
          element={<PlaceholderPage title="Settings" body="General site settings land with the design task." />}
        />
        <Route path="new" element={<EditorPage />} />
        <Route path="content/:contentId" element={<EditorPage />} />
      </Route>
    </Routes>
  );
}

export { SimpleShell };
