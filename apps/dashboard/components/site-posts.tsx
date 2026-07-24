"use client";

import * as React from "react";
import { Button, Input, Label } from "@kumooo/ui";
import { client, type PostItem } from "@/lib/api";

export function SitePosts({ siteId }: { siteId: string }) {
  const [posts, setPosts] = React.useState<PostItem[]>([]);
  const [editing, setEditing] = React.useState<PostItem | null>(null);
  const [title, setTitle] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [excerpt, setExcerpt] = React.useState("");
  const [body, setBody] = React.useState("");
  const [status, setStatus] = React.useState<"published" | "draft">("draft");
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    const data = await client.listPosts(siteId);
    setPosts(data.posts);
  }, [siteId]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await client.listPosts(siteId);
        if (!cancelled) setPosts(data.posts);
      } catch (e) {
        if (!cancelled) setMsg(e instanceof Error ? e.message : "failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [siteId]);

  function startNew() {
    setEditing(null);
    setTitle("");
    setSlug("");
    setExcerpt("");
    setBody("");
    setStatus("draft");
    setMsg(null);
  }

  function startEdit(p: PostItem) {
    setEditing(p);
    setTitle(p.title);
    setSlug(p.slug);
    setExcerpt(p.excerpt);
    setBody(p.body);
    setStatus(p.status === "published" ? "published" : "draft");
    setMsg(null);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const input = {
        title,
        slug: slug || undefined,
        excerpt,
        body,
        status,
      };
      if (editing) await client.updatePost(siteId, editing.id, input);
      else await client.createPost(siteId, input);
      await load();
      startNew();
      setMsg("Saved.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this post?")) return;
    await client.deletePost(siteId, id);
    await load();
    if (editing?.id === id) startNew();
  }

  return (
    <section className="mt-10 max-w-2xl">
      <h2 className="text-sm font-semibold tracking-wide text-[var(--fg)]">Posts</h2>
      <p className="mt-1 text-sm text-[var(--fog)]">
        Write Markdown posts for this site. Published posts are available at the public API for your starter.
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <form onSubmit={save} className="space-y-3 rounded-2xl border border-[var(--line)] bg-white/[0.02] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--fog)]">
            {editing ? "Edit post" : "New post"}
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="post-title">Title</Label>
            <Input
              id="post-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="border-[var(--line)] bg-transparent"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="post-slug">Slug</Label>
            <Input
              id="post-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="auto from title"
              className="border-[var(--line)] bg-transparent"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="post-excerpt">Excerpt</Label>
            <Input
              id="post-excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="border-[var(--line)] bg-transparent"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="post-body">Body (Markdown)</Label>
            <textarea
              id="post-body"
              className="min-h-36 w-full rounded-lg border border-[var(--line)] bg-transparent px-3 py-2 font-mono text-sm text-[var(--fg)]"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              placeholder={"## Hello\n\nWrite **Markdown** here."}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="post-status">Status</Label>
            <select
              id="post-status"
              className="h-10 w-full rounded-lg border border-[var(--line)] bg-transparent px-3 text-sm text-[var(--fg)]"
              value={status}
              onChange={(e) => setStatus(e.target.value as "published" | "draft")}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          {msg ? <p className="text-xs text-[var(--fog)]">{msg}</p> : null}
          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              disabled={busy}
              className="rounded-full bg-[var(--fg)] text-[var(--bg)] hover:opacity-90"
            >
              {busy ? "Saving..." : "Save"}
            </Button>
            {editing ? (
              <Button
                type="button"
                variant="outline"
                onClick={startNew}
                className="rounded-full border-[var(--line)] text-[var(--fog)]"
              >
                Cancel
              </Button>
            ) : null}
          </div>
        </form>

        <ul className="space-y-3">
          {posts.map((p) => (
            <li key={p.id} className="rounded-2xl border border-[var(--line)] bg-white/[0.02] p-4">
              <p className="font-semibold text-[var(--fg)]">{p.title}</p>
              <p className="mt-1 font-mono text-[10px] text-[var(--fog)]">
                /{p.slug} · {p.status}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className="rounded-full border border-[var(--line)] px-3 py-1 text-[10px] font-semibold text-[var(--fog)] hover:text-[var(--fg)]"
                  onClick={() => startEdit(p)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="rounded-full border border-[var(--line)] px-3 py-1 text-[10px] font-semibold text-red-400/90"
                  onClick={() => void remove(p.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
          {posts.length === 0 ? (
            <li className="text-sm text-[var(--fog)]">No posts yet.</li>
          ) : null}
        </ul>
      </div>
    </section>
  );
}
