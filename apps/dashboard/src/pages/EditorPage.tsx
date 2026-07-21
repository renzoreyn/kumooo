import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, Send, Trash2 } from "lucide-react";
import { api } from "../api";
import { Shell } from "../App";

export function EditorPage() {
  const { siteId = "", contentId } = useParams();
  const nav = useNavigate();
  const isNew = !contentId;
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<"post" | "page">("post");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!contentId) return;
    void api.getContent(siteId, contentId).then((r) => {
      setTitle(r.content.title);
      setBody(r.content.bodyMarkdown);
      setType(r.content.type as "post" | "page");
    }).catch((err) => setError(err instanceof Error ? err.message : "Could not load."));
  }, [siteId, contentId]);

  async function save(status: "draft" | "published") {
    setBusy(true);
    setError(null);
    try {
      const payload = { title, bodyMarkdown: body, type, status };
      if (isNew) {
        const { content } = await api.createContent(siteId, payload);
        nav(`/sites/${siteId}/content/${content.id}`, { replace: true });
      } else {
        await api.updateContent(siteId, contentId!, payload);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!contentId) return;
    if (!confirm("Delete this? You can restore from backups if you have them.")) return;
    await api.deleteContent(siteId, contentId);
    nav(`/sites/${siteId}`);
  }

  return (
    <Shell
      title={isNew ? "New post" : "Edit"}
      actions={
        <>
          {!isNew ? (
            <button className="btn danger" type="button" onClick={() => void remove()}>
              <Trash2 size={16} /> Delete
            </button>
          ) : null}
          <button className="btn" type="button" disabled={busy} onClick={() => void save("draft")}>
            <Save size={16} /> Save draft
          </button>
          <button className="btn primary" type="button" disabled={busy} onClick={() => void save("published")}>
            <Send size={16} /> Publish
          </button>
        </>
      }
    >
      {error ? <div className="error">{error}</div> : null}
      <div className="card">
        <div className="field">
          <label className="label" htmlFor="title">Title</label>
          <input className="input" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="field">
          <label className="label" htmlFor="type">Type</label>
          <select className="input" id="type" value={type} onChange={(e) => setType(e.target.value as "post" | "page")}>
            <option value="post">Post</option>
            <option value="page">Page</option>
          </select>
        </div>
        <div className="field">
          <label className="label" htmlFor="body">Markdown</label>
          <textarea className="textarea" id="body" value={body} onChange={(e) => setBody(e.target.value)} placeholder={"Write something worth reading.\n\n## Or don't\n\nDrafts are free."} />
        </div>
      </div>
    </Shell>
  );
}
