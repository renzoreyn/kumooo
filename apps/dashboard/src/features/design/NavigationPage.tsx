import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button, EmptyState, Input, PageHeader } from "../../components/ui";
import { useToast } from "../../components/ui/Toast";
import { sitesApi } from "../../lib/api/sites";

type NavItem = { title: string; url: string };

export function NavigationPage() {
  const { siteId = "" } = useParams();
  const toast = useToast();
  const [items, setItems] = useState<NavItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const { site } = await sitesApi.get(siteId);
        const nav = site.settings?.nav;
        setItems(Array.isArray(nav) ? (nav as NavItem[]) : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load navigation.");
      }
    })();
  }, [siteId]);

  function update(i: number, patch: Partial<NavItem>) {
    setItems((rows) => rows.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  }

  function move(i: number, dir: -1 | 1) {
    setItems((rows) => {
      const j = i + dir;
      if (j < 0 || j >= rows.length) return rows;
      const next = [...rows];
      const tmp = next[i]!;
      next[i] = next[j]!;
      next[j] = tmp;
      return next;
    });
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const cleaned = items
        .map((n) => ({ title: n.title.trim(), url: n.url.trim() }))
        .filter((n) => n.title && n.url);
      await sitesApi.update(siteId, { settings: { nav: cleaned } });
      setItems(cleaned);
      toast.push("Navigation saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Navigation"
        description="Primary site menu links"
        actions={
          <Button type="button" variant="primary" disabled={busy} onClick={() => void save()}>
            Save
          </Button>
        }
      />
      {error ? <div className="error">{error}</div> : null}
      {items.length === 0 ? (
        <EmptyState
          title="No links yet"
          body="Add a title and URL for the header menu."
          action={
            <Button type="button" onClick={() => setItems([{ title: "Home", url: "/" }])}>
              <Plus size={16} /> Add link
            </Button>
          }
        />
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {items.map((item, i) => (
            <div key={i} className="card" style={{ display: "grid", gap: "0.65rem" }}>
              <div style={{ display: "grid", gap: "0.65rem", gridTemplateColumns: "1fr 1fr", alignItems: "end" }}>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label className="label" htmlFor={`nav-title-${i}`}>
                    Title
                  </label>
                  <Input
                    id={`nav-title-${i}`}
                    value={item.title}
                    onChange={(e) => update(i, { title: e.target.value })}
                  />
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label className="label" htmlFor={`nav-url-${i}`}>
                    URL
                  </label>
                  <Input
                    id={`nav-url-${i}`}
                    value={item.url}
                    onChange={(e) => update(i, { url: e.target.value })}
                    placeholder="/"
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.35rem" }}>
                <Button type="button" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                  <ArrowUp size={16} />
                </Button>
                <Button
                  type="button"
                  aria-label="Move down"
                  disabled={i === items.length - 1}
                  onClick={() => move(i, 1)}
                >
                  <ArrowDown size={16} />
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => setItems((rows) => rows.filter((_, idx) => idx !== i))}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
          <Button type="button" onClick={() => setItems((rows) => [...rows, { title: "", url: "/" }])}>
            <Plus size={16} /> Add link
          </Button>
        </div>
      )}
    </>
  );
}
