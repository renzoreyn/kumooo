import type { RenderedOgPayload } from "@kumooo/core";

function fillBackground(
  ctx: CanvasRenderingContext2D,
  payload: RenderedOgPayload,
): Promise<void> {
  const { width, height, background } = payload;
  if (background.type === "color") {
    ctx.fillStyle = background.value;
    ctx.fillRect(0, 0, width, height);
    return Promise.resolve();
  }
  if (background.type === "gradient") {
    const g = ctx.createLinearGradient(0, 0, width, height);
    g.addColorStop(0, background.from);
    g.addColorStop(1, background.to);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(0, 0, width, height);
      resolve();
    };
    img.onerror = () => reject(new Error("Could not load background image."));
    img.src = background.url;
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 4);
}

async function drawLogo(ctx: CanvasRenderingContext2D, url: string, x: number, y: number) {
  await new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const h = 56;
      const w = (img.width / img.height) * h;
      ctx.drawImage(img, x, y, w, h);
      resolve();
    };
    img.onerror = () => reject(new Error("Could not load logo."));
    img.src = url;
  });
}

export async function generateOgPng(payload: RenderedOgPayload): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = payload.width;
  canvas.height = payload.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported.");

  await fillBackground(ctx, payload);

  const pad = 72;
  const maxWidth = payload.width - pad * 2;
  let textX = pad;
  if (payload.layout === "center") textX = payload.width / 2;
  if (payload.layout === "right") textX = payload.width - pad;
  const align = payload.layout === "center" ? "center" : payload.layout === "right" ? "right" : "left";

  ctx.textAlign = align;
  ctx.textBaseline = "top";
  ctx.fillStyle = payload.titleColor;
  ctx.font = `700 ${payload.titleSize}px "IBM Plex Sans", system-ui, sans-serif`;
  const titleLines = wrapText(ctx, payload.title, maxWidth);
  let y = pad + 40;
  for (const line of titleLines) {
    ctx.fillText(line, textX, y);
    y += payload.titleSize * 1.15;
  }

  if (payload.subtitle) {
    y += 24;
    ctx.fillStyle = payload.subtitleColor;
    ctx.font = `400 ${payload.subtitleSize}px "IBM Plex Sans", system-ui, sans-serif`;
    for (const line of wrapText(ctx, payload.subtitle, maxWidth)) {
      ctx.fillText(line, textX, y);
      y += payload.subtitleSize * 1.2;
    }
  }

  if (payload.hostname) {
    ctx.fillStyle = payload.subtitleColor;
    ctx.font = `500 22px "IBM Plex Sans", system-ui, sans-serif`;
    ctx.fillText(payload.hostname, textX, payload.height - pad - 24);
  }

  if (payload.logoUrl) {
    const logoX = payload.layout === "right" ? payload.width - pad - 120 : pad;
    try {
      await drawLogo(ctx, payload.logoUrl, logoX, pad - 10);
    } catch {
      /* logo optional */
    }
  }

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("PNG export failed.");
  return blob;
}
