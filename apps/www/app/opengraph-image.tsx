import { ImageResponse } from "next/og";

export const alt = "kumooo.js — Next.js starters on Cloudflare";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(145deg, #0c0c0e 0%, #16161a 55%, #0f1412 100%)",
          color: "#f5f5f7",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 999, background: "#6ee7b7" }} />
          <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em", opacity: 0.9 }}>
            kumooo.js
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.05, maxWidth: 980 }}>
            Next.js sites. Less babysitting.
          </div>
          <div style={{ fontSize: 30, color: "#a1a1a6", maxWidth: 900, lineHeight: 1.35 }}>
            Open source starters and UI. Deploy on Cloudflare or host with us.
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#8e8e93" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: 999, background: "#6ee7b7" }} />
            kumooo.dev
          </div>
          <div style={{ opacity: 0.7 }}>Next.js · Cloudflare</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
