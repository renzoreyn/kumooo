import { useEffect, useRef, useState } from "react";
import { ApiRequestError } from "../../lib/api/client";
import { contentApi, type ContentItem } from "../../lib/api/content";

export type SaveStatus = "idle" | "saving" | "saved" | "offline" | "error" | "conflict";

type Draft = {
  title: string;
  slug: string;
  bodyMarkdown: string;
  excerpt: string;
  tags: string;
  featuredImage: string;
  status: string;
  scheduledAt: string;
  seoTitle: string;
  seoDescription: string;
  seoCanonical: string;
  seoOgImage: string;
  noindex: boolean;
  type: "post" | "page";
};

function seoFrom(item: ContentItem) {
  const seo = (item.seo ?? {}) as Record<string, unknown>;
  return {
    title: typeof seo.title === "string" ? seo.title : "",
    description: typeof seo.description === "string" ? seo.description : "",
    canonicalUrl: typeof seo.canonicalUrl === "string" ? seo.canonicalUrl : "",
    ogImage: typeof seo.ogImage === "string" ? seo.ogImage : "",
    noindex: Boolean(seo.noindex),
  };
}

function isDirty(draft: Draft, baseline: ContentItem): boolean {
  const seo = seoFrom(baseline);
  return (
    draft.title !== baseline.title ||
    draft.bodyMarkdown !== baseline.bodyMarkdown ||
    draft.excerpt !== (baseline.excerpt ?? "") ||
    draft.featuredImage !== (baseline.featuredImage ?? "") ||
    draft.status !== baseline.status ||
    draft.scheduledAt !== (baseline.scheduledAt ?? "") ||
    draft.seoTitle !== seo.title ||
    draft.seoDescription !== seo.description ||
    draft.seoCanonical !== seo.canonicalUrl ||
    draft.seoOgImage !== seo.ogImage ||
    draft.noindex !== seo.noindex ||
    draft.type !== (baseline.type === "page" ? "page" : "post") ||
    (draft.tags.trim().length > 0 &&
      draft.tags !== (Array.isArray(baseline.tags) ? baseline.tags.join(", ") : ""))
  );
}

export function useAutosave(opts: {
  siteId: string;
  contentId: string | undefined;
  draft: Draft;
  baseline: ContentItem | null;
  enabled: boolean;
  onSaved: (content: ContentItem) => void;
  onConflict: (current: ContentItem) => void;
}) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const latest = useRef(opts);
  latest.current = opts;

  useEffect(() => {
    if (!opts.enabled || !opts.contentId || !opts.baseline) return;
    if (!isDirty(opts.draft, opts.baseline)) return;

    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      void (async () => {
        const cur = latest.current;
        if (!cur.contentId || !cur.baseline) return;
        if (!isDirty(cur.draft, cur.baseline)) return;
        if (!navigator.onLine) {
          setStatus("offline");
          return;
        }
        setStatus("saving");
        setError(null);
        try {
          const seo = {
            title: cur.draft.seoTitle || undefined,
            description: cur.draft.seoDescription || undefined,
            canonicalUrl: cur.draft.seoCanonical || undefined,
            ogImage: cur.draft.seoOgImage || undefined,
            noindex: cur.draft.noindex || undefined,
          };
          const tagList = cur.draft.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
          const { content } = await contentApi.update(cur.siteId, cur.contentId, {
            title: cur.draft.title,
            bodyMarkdown: cur.draft.bodyMarkdown,
            excerpt: cur.draft.excerpt || undefined,
            featuredImage: cur.draft.featuredImage || undefined,
            status: cur.draft.status,
            scheduledAt: cur.draft.scheduledAt || undefined,
            ...(tagList.length ? { tags: tagList } : {}),
            seo,
            type: cur.draft.type,
            expectedUpdatedAt: cur.baseline.updatedAt,
          });
          setStatus("saved");
          cur.onSaved(content);
        } catch (err) {
          if (err instanceof ApiRequestError && err.code === "conflict") {
            const current = (err.details as { current?: ContentItem } | undefined)?.current;
            setStatus("conflict");
            setError(err.message);
            if (current) cur.onConflict(current);
            return;
          }
          setStatus("error");
          setError(err instanceof Error ? err.message : "Autosave failed.");
        }
      })();
    }, 800);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [opts.draft, opts.enabled, opts.contentId, opts.baseline]);

  useEffect(() => {
    const onOffline = () => setStatus("offline");
    const onOnline = () => setStatus((s) => (s === "offline" ? "idle" : s));
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  return { status, error, setStatus, setError };
}
