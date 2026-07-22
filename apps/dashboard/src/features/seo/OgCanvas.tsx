import { useEffect, useState } from "react";
import type { RenderedOgPayload } from "@kumooo/core";
import { generateOgPng } from "./generateOgPng";

export function OgCanvas({ payload }: { payload: RenderedOgPayload }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;
    void (async () => {
      try {
        const blob = await generateOgPng(payload);
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      } catch {
        if (!cancelled) setUrl(null);
      }
    })();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [payload]);

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div
        style={{
          width: "100%",
          maxWidth: 600,
          aspectRatio: "1200 / 630",
          background: "var(--sidebar)",
          overflow: "hidden",
        }}
      >
        {url ? (
          <img src={url} alt="OpenGraph preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div className="muted" style={{ padding: "1rem" }}>
            Rendering…
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <div className="card" style={{ width: 280, padding: "0.65rem" }}>
          <div className="muted" style={{ fontSize: "0.75rem", marginBottom: "0.35rem" }}>
            Facebook-ish
          </div>
          <div style={{ aspectRatio: "1.91 / 1", overflow: "hidden", background: "#eee" }}>
            {url ? <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
          </div>
          <strong style={{ display: "block", marginTop: "0.4rem", fontSize: "0.85rem" }}>
            {payload.title || "Title"}
          </strong>
          <span className="muted" style={{ fontSize: "0.75rem" }}>
            {payload.hostname || "site.example"}
          </span>
        </div>
        <div className="card" style={{ width: 280, padding: "0.65rem" }}>
          <div className="muted" style={{ fontSize: "0.75rem", marginBottom: "0.35rem" }}>
            X-ish
          </div>
          <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #ddd" }}>
            <div style={{ aspectRatio: "1200 / 630", background: "var(--sidebar)" }}>
              {url ? <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
            </div>
            <div style={{ padding: "0.5rem" }}>
              <strong style={{ fontSize: "0.85rem" }}>{payload.title || "Title"}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
