import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Archive, Eye, FilePlus, RotateCcw, Send, Trash2 } from "lucide-react";
import { Badge, Button, EmptyState, Input, PageHeader, Select } from "../../components/ui";
import { ConfirmDialog } from "../../components/ui/Dialog";
import { contentApi, type ContentItem } from "../../lib/api/content";
import { useToast } from "../../components/ui/Toast";

export function ContentListPage({ type }: { type: "post" | "page" }) {
  const { siteId = "" } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContentItem | null>(null);
  const label = type === "page" ? "Pages" : "Posts";

  async function load() {
    const params = new URLSearchParams();
    params.set("type", type);
    params.set("page", String(page));
    params.set("perPage", "20");
    if (status) params.set("status", status);
    if (search.trim()) params.set("search", search.trim());
    const res = await contentApi.list(siteId, `?${params.toString()}`);
    setItems(res.content);
    setTotal(res.pagination?.total ?? res.content.length);
  }

  useEffect(() => {
    void load().catch((err) => setError(err instanceof Error ? err.message : "Could not load."));
  }, [siteId, type, page, status]);

  const pages = Math.max(1, Math.ceil(total / 20));

  async function setItemStatus(item: ContentItem, next: string) {
    setBusyId(item.id);
    setError(null);
    try {
      await contentApi.update(siteId, item.id, {
        status: next,
        expectedUpdatedAt: item.updatedAt,
      });
      toast.push(`${item.title} → ${next}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setBusyId(null);
    }
  }

  async function preview(item: ContentItem) {
    try {
      const { url } = await contentApi.previewToken(siteId, item.id);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Preview failed.");
    }
  }

  async function hardDelete() {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);
    try {
      await contentApi.remove(siteId, deleteTarget.id);
      toast.push(`Deleted ${deleteTarget.title}`);
      setDeleteTarget(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setBusyId(null);
    }
  }

  const filteredHint = useMemo(() => `${total} ${label.toLowerCase()}`, [total, label]);

  return (
    <>
      <PageHeader
        title={label}
        description={filteredHint}
        actions={
          <Link className="btn primary" to={`/sites/${siteId}/new?type=${type}`}>
            <FilePlus size={16} /> New {type}
          </Link>
        }
      />
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <div className="field" style={{ flex: 1, minWidth: 180, marginBottom: 0 }}>
          <label className="label" htmlFor="content-search">
            Search
          </label>
          <Input
            id="content-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setPage(1);
                void load().catch((err) => setError(err instanceof Error ? err.message : "Could not load."));
              }
            }}
            placeholder="Title"
          />
        </div>
        <div className="field" style={{ minWidth: 160, marginBottom: 0 }}>
          <label className="label" htmlFor="content-status">
            Status
          </label>
          <Select
            id="content-status"
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
          >
            <option value="">All</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </Select>
        </div>
        <div style={{ alignSelf: "end" }}>
          <Button
            type="button"
            onClick={() => {
              setPage(1);
              void load().catch((err) => setError(err instanceof Error ? err.message : "Could not load."));
            }}
          >
            Apply
          </Button>
        </div>
      </div>
      {error ? <div className="error">{error}</div> : null}
      {items.length === 0 ? (
        <EmptyState
          title={`No ${label.toLowerCase()} yet`}
          body="Draft something. Publish when you're ready."
          action={
            <Link className="btn primary" to={`/sites/${siteId}/new?type=${type}`}>
              New {type}
            </Link>
          }
        />
      ) : (
        <div style={{ display: "grid", gap: "0.65rem" }}>
          {items.map((item) => (
            <div key={item.id} className="card" style={{ display: "grid", gap: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                <div>
                  <Link to={`/sites/${siteId}/content/${item.id}`} style={{ color: "inherit" }}>
                    <strong>{item.title}</strong>
                  </Link>
                  <div className="muted" style={{ fontSize: "0.88rem" }}>
                    /{item.slug} · updated {new Date(item.updatedAt).toLocaleString()}
                  </div>
                </div>
                <Badge
                  tone={
                    item.status === "published" ? "ok" : item.status === "archived" ? "warn" : "default"
                  }
                >
                  {item.status}
                </Badge>
              </div>
              <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
                <Button type="button" onClick={() => nav(`/sites/${siteId}/content/${item.id}`)}>
                  Edit
                </Button>
                <Button type="button" onClick={() => void preview(item)} disabled={busyId === item.id}>
                  <Eye size={16} /> Preview
                </Button>
                {item.status !== "published" ? (
                  <Button type="button" variant="primary" disabled={busyId === item.id} onClick={() => void setItemStatus(item, "published")}>
                    <Send size={16} /> Publish
                  </Button>
                ) : null}
                {item.status !== "archived" ? (
                  <Button type="button" disabled={busyId === item.id} onClick={() => void setItemStatus(item, "archived")}>
                    <Archive size={16} /> Archive
                  </Button>
                ) : (
                  <>
                    <Button type="button" disabled={busyId === item.id} onClick={() => void setItemStatus(item, "draft")}>
                      <RotateCcw size={16} /> Restore
                    </Button>
                    <Button type="button" variant="danger" disabled={busyId === item.id} onClick={() => setDeleteTarget(item)}>
                      <Trash2 size={16} /> Delete
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {pages > 1 ? (
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", alignItems: "center" }}>
          <Button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="muted">
            Page {page} of {pages}
          </span>
          <Button type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      ) : null}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete permanently?"
        body={
          deleteTarget
            ? `“${deleteTarget.title}” at /${deleteTarget.slug} and its revisions will be removed.`
            : ""
        }
        confirmLabel="Delete"
        danger
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void hardDelete()}
      />
    </>
  );
}
