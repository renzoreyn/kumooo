import { NavLink, useParams } from "react-router-dom";
import {
  BarChart3,
  FileText,
  FolderOpen,
  Globe,
  Image,
  LayoutTemplate,
  Menu,
  Navigation,
  Rocket,
  Search,
  Settings,
  Type,
} from "lucide-react";

const items = [
  { to: "", label: "Overview", icon: BarChart3, end: true },
  { group: "Content" },
  { to: "posts", label: "Posts", icon: FileText },
  { to: "pages", label: "Pages", icon: Type },
  { to: "collections", label: "Collections", icon: FolderOpen },
  { to: "media", label: "Media", icon: Image },
  { group: "Design" },
  { to: "design/themes", label: "Themes", icon: LayoutTemplate },
  { to: "design/navigation", label: "Navigation", icon: Navigation },
  { to: "seo", label: "SEO", icon: Search },
  { to: "deployments", label: "Deployments", icon: Rocket },
  { to: "domains", label: "Domains", icon: Globe },
  { to: "settings", label: "Settings", icon: Settings },
] as const;

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { siteId = "" } = useParams();
  const base = `/sites/${siteId}`;

  return (
    <>
      <NavLink to="/" className="brand" onClick={onNavigate}>
        kumooo<span>.</span>
      </NavLink>
      {items.map((item, i) => {
        if ("group" in item) {
          return (
            <div key={`${item.group}-${i}`} className="nav-group">
              {item.group}
            </div>
          );
        }
        const Icon = item.icon;
        const path = item.to ? `${base}/${item.to}` : base;
        return (
          <NavLink
            key={path}
            to={path}
            end={"end" in item ? item.end : false}
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            onClick={onNavigate}
          >
            <Icon size={16} />
            {item.label}
          </NavLink>
        );
      })}
      <div style={{ marginTop: "auto", padding: "0.75rem 0.65rem 0" }}>
        <p className="muted" style={{ fontSize: "0.78rem", margin: 0 }}>
          Analytics, team, and integrations stay off the main nav until they ship with real data.
        </p>
      </div>
    </>
  );
}

export function MenuIcon() {
  return <Menu size={18} />;
}
