import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Columns2, Eye, PanelRight, Send } from "lucide-react";
import { insertImage, renderMarkdown, type InsertResult, type TextSelection } from "@kumooo/core";
import { Button, Input, PageHeader, Textarea } from "../../components/ui";
import { contentApi, type ContentItem } from "../../lib/api/content";
import { useToast } from "../../components/ui/Toast";
import { MarkdownToolbar } from "./MarkdownToolbar";
import { MetaPanel, type MetaDraft } from "./MetaPanel";
import { SlashMenu } from "./SlashMenu";
import { useAutosave, type SaveStatus } from "./useAutosave";

type Draft = MetaDraft & {
  title: string;
  slug: string;
  bodyMarkdown: string;
};

const emptyDraft = (type: "post" | "page"): Draft => ({
  title: "",
  slug: "",
  bodyMarkdown: "",
  excerpt: "",
  tags: "",
  featuredImage: "",
  status: "draft",
  scheduledAt: "",
  seoTitle: "",
  seoDescription: "",
  seoCanonical: "",
  seoOgImage: "",
  noindex: false,
  type,
});

function fromContent(item: ContentItem): Draft {
  const seo = (item.seo ?? {}) as Record<string, unknown>;
  return {
    title: item.title,
    slug: item.slug,
    bodyMarkdown: item.bodyMarkdown,
    excerpt: item.excerpt ?? "",
    tags: Array.isArray(item.tags) ? item.tags.join(", ") : "",
    featuredImage: item.featuredImage ?? "",
    status: item.status,
    scheduledAt: item.scheduledAt ?? "",
    seoTitle: typeof seo.title === "string" ? seo.title : "",
    seoDescription: typeof seo.description === "string" ? seo.description : "",
    seoCanonical: typeof seo.canonicalUrl === "string" ? seo.canonicalUrl : "",
    seoOgImage: typeof seo.ogImage === "string" ? seo.ogImage : "",
    noindex: Boolean(seo.noindex),
    type: item.type === "page" ? "page" : "post",
  };
}

function statusLabel(status: SaveStatus): string {
  switch (status) {
    case "saving":
      return "Saving…";
    case "saved":
      return "Saved";
    case "offline":
      return "Offline — changes wait until you're back";
    case "error":
      return "Save failed";
    case "conflict":
      return "Conflict — content changed elsewhere";
    default:
      return "Ready";
  }
}

export function EditorPage() {
  const { siteId = "", contentId } = useParams();
  const [search] = useSearchParams();
  const nav = useNavigate();
  const toast = useToast();
  const isNew = !contentId;
  const initialType = search.get("type") === "page" ? "page" : "post";

  const [draft, setDraft] = useState<Draft>(() => emptyDraft(initialType));
  const [baseline, setBaseline] = useState<ContentItem | null>(null);
  const [revisions, setRevisions] = useState<{ id: string; createdBy: string; createdAt: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [split, setSplit] = useState(true);
  const [metaOpen, setMetaOpen] = useState(true);
  const [slash, setSlash] = useState<{ open: boolean; query: string; start: number }>({
    open: false,
    query: "",
    start: 0,
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const patchDraft = useCallback((patch: Partial<Draft>) => {
    setDraft((d) => ({ ...d, ...patch }));
  }, []);

  const loadRevisions = useCallback(
    async (id: string) => {
      const res = await contentApi.revisions(siteId, id);
      setRevisions(res.revisions);
    },
    [siteId],
  );

  useEffect(() => {
    if (!contentId) {
      setBaseline(null);
      setDraft(emptyDraft(initialType));
      return;
    }
    void (async () => {
      try {
        const { content } = await contentApi.get(siteId, contentId);
        setBaseline(content);
        setDraft(fromContent(content));
        await loadRevisions(contentId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load.");
      }
    })();
  }, [siteId, contentId, initialType, loadRevisions]);

  const { status, error: saveError, setStatus } = useAutosave({
    siteId,
    contentId,
    draft,
    baseline,
    enabled: Boolean(contentId && baseline),
    onSaved: (content) => {
      setBaseline(content);
      setDraft((d) => ({ ...d, slug: content.slug, status: content.status }));
      void loadRevisions(content.id);
    },
    onConflict: () => {
      /* keep local draft; status already conflict */
    },
  });

  const previewHtml = useMemo(() => renderMarkdown(draft.bodyMarkdown).value, [draft.bodyMarkdown]);

  function applyInsert(factory: (selection: TextSelection) => InsertResult) {
    const el = textareaRef.current;
    if (!el) return;
    const result = factory({
      value: el.value,
      selectionStart: el.selectionStart,
      selectionEnd: el.selectionEnd,
    });
    patchDraft({ bodyMarkdown: result.value });
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  }

  function onBodyKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget;
    if (e.key === "/" && !slash.open) {
      setSlash({ open: true, query: "", start: el.selectionStart });
      return;
    }
    if (!slash.open) return;
    if (e.key === "Escape") {
      setSlash({ open: false, query: "", start: 0 });
    }
  }

  function onBodyChange(e: ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    patchDraft({ bodyMarkdown: value });
    if (!slash.open) return;
    const cursor = e.target.selectionStart;
    const from = slash.start;
    if (cursor < from || value[from] !== "/") {
      setSlash({ open: false, query: "", start: 0 });
      return;
    }
    const query = value.slice(from + 1, cursor);
    if (query.includes("\n") || query.includes(" ")) {
      setSlash({ open: false, query: "", start: 0 });
      return;
    }
    setSlash((s) => ({ ...s, query }));
  }

  function pickSlash(factory: (selection: TextSelection) => InsertResult) {
    const el = textareaRef.current;
    if (!el) return;
    const before = draft.bodyMarkdown.slice(0, slash.start);
    const after = draft.bodyMarkdown.slice(el.selectionStart);
    const cleared = before + after;
    const selection: TextSelection = {
      value: cleared,
      selectionStart: slash.start,
      selectionEnd: slash.start,
    };
    const result = factory(selection);
    patchDraft({ bodyMarkdown: result.value });
    setSlash({ open: false, query: "", start: 0 });
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  }

  async function createFirst() {
    if (!draft.title.trim()) {
      setError("Title is required.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { content } = await contentApi.create(siteId, {
        title: draft.title,
        bodyMarkdown: draft.bodyMarkdown,
        type: draft.type,
        status: "draft",
        excerpt: draft.excerpt || undefined,
        featuredImage: draft.featuredImage || undefined,
        tags: draft.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        seo: {
          title: draft.seoTitle || undefined,
          description: draft.seoDescription || undefined,
          canonicalUrl: draft.seoCanonical || undefined,
          ogImage: draft.seoOgImage || undefined,
          noindex: draft.noindex || undefined,
        },
      });
      toast.push("Draft created");
      nav(`/sites/${siteId}/content/${content.id}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create.");
    } finally {
      setBusy(false);
    }
  }

  async function publish() {
    if (isNew) {
      await createFirst();
      return;
    }
    if (!baseline || !contentId) return;
    setBusy(true);
    setError(null);
    try {
      const { content } = await contentApi.update(siteId, contentId, {
        title: draft.title,
        bodyMarkdown: draft.bodyMarkdown,
        status: "published",
        excerpt: draft.excerpt || undefined,
        featuredImage: draft.featuredImage || undefined,
        scheduledAt: draft.scheduledAt || undefined,
        tags: draft.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        seo: {
          title: draft.seoTitle || undefined,
          description: draft.seoDescription || undefined,
          canonicalUrl: draft.seoCanonical || undefined,
          ogImage: draft.seoOgImage || undefined,
          noindex: draft.noindex || undefined,
        },
        type: draft.type,
        expectedUpdatedAt: baseline.updatedAt,
      });
      setBaseline(content);
      setDraft(fromContent(content));
      setStatus("saved");
      toast.push("Published");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed.");
    } finally {
      setBusy(false);
    }
  }

  async function preview() {
    if (!contentId) {
      setError("Save a draft before previewing.");
      return;
    }
    try {
      const { url } = await contentApi.previewToken(siteId, contentId);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Preview failed.");
    }
  }

  async function restoreRevision(revisionId: string) {
    if (!contentId) return;
    setBusy(true);
    try {
      const { content } = await contentApi.restore(siteId, contentId, revisionId);
      setBaseline(content);
      setDraft(fromContent(content));
      setStatus("saved");
      toast.push("Revision restored");
      await loadRevisions(contentId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Restore failed.");
    } finally {
      setBusy(false);
    }
  }

  function reloadServer() {
    if (!baseline) return;
    setDraft(fromContent(baseline));
    setStatus("idle");
    setError(null);
  }

  return (
    <>
      <PageHeader
        title={isNew ? `New ${draft.type}` : "Edit"}
        description={draft.slug ? `/${draft.slug}` : undefined}
        actions={
          <>
            <span className="muted" aria-live="polite" style={{ alignSelf: "center", fontSize: "0.85rem" }}>
              {statusLabel(status)}
            </span>
            <Button type="button" onClick={() => setSplit((s) => !s)} aria-pressed={split}>
              <Columns2 size={16} /> Split
            </Button>
            <Button type="button" onClick={() => setMetaOpen((s) => !s)} aria-pressed={metaOpen}>
              <PanelRight size={16} /> Meta
            </Button>
            {!isNew ? (
              <Button type="button" onClick={() => void preview()}>
                <Eye size={16} /> Preview
              </Button>
            ) : null}
            {isNew ? (
              <Button type="button" variant="primary" disabled={busy} onClick={() => void createFirst()}>
                Create draft
              </Button>
            ) : (
              <Button type="button" variant="primary" disabled={busy} onClick={() => void publish()}>
                <Send size={16} /> Publish
              </Button>
            )}
          </>
        }
      />
      {error || saveError ? <div className="error">{error ?? saveError}</div> : null}
      {status === "conflict" ? (
        <div className="card" style={{ marginBottom: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <p className="muted" style={{ margin: 0, flex: 1 }}>
            Someone else saved this content. Keep typing to overwrite on next save attempt after reload, or discard
            local changes.
          </p>
          <Button type="button" onClick={reloadServer}>
            Load server version
          </Button>
        </div>
      ) : null}
      <div
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: metaOpen ? "minmax(0, 1fr) minmax(240px, 320px)" : "1fr",
          alignItems: "start",
        }}
      >
        <div className="card" style={{ position: "relative" }}>
          <div className="field">
            <label className="label" htmlFor="editor-title">
              Title
            </label>
            <Input
              id="editor-title"
              value={draft.title}
              onChange={(e) => patchDraft({ title: e.target.value })}
              placeholder="Title"
            />
          </div>
          <MarkdownToolbar
            textareaRef={textareaRef}
            value={draft.bodyMarkdown}
            onChange={(bodyMarkdown) => patchDraft({ bodyMarkdown })}
            onInsertImage={() => {
              const url = window.prompt("Image URL");
              if (!url) return;
              applyInsert((s) => insertImage(s, url));
            }}
          />
          <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: split ? "1fr 1fr" : "1fr" }}>
            <div className="field" style={{ marginBottom: 0, position: "relative" }}>
              <label className="label" htmlFor="editor-body">
                Markdown
              </label>
              <Textarea
                ref={textareaRef}
                id="editor-body"
                value={draft.bodyMarkdown}
                onChange={onBodyChange}
                onKeyDown={onBodyKeyDown}
                style={{ minHeight: "28rem", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
                placeholder={"Write something worth reading.\n\n## Or don't\n\nDrafts are free."}
              />
              <SlashMenu
                open={slash.open}
                query={slash.query}
                onClose={() => setSlash({ open: false, query: "", start: 0 })}
                onPick={pickSlash}
              />
            </div>
            {split ? (
              <div className="field" style={{ marginBottom: 0 }}>
                <label className="label" htmlFor="editor-preview">
                  Preview
                </label>
                <div
                  id="editor-preview"
                  className="card"
                  style={{ minHeight: "28rem", overflow: "auto", background: "var(--sidebar)" }}
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </div>
            ) : null}
          </div>
        </div>
        <MetaPanel
          open={metaOpen}
          draft={draft}
          onChange={patchDraft}
          revisions={revisions}
          onRestore={(id) => void restoreRevision(id)}
        />
      </div>
    </>
  );
}
