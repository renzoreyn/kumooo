import { z } from "zod";

const color = z.string().min(1);

const textLayerSchema = z.object({
  text: z.string().min(1),
  color,
  size: z.number().int().min(12).max(120),
});

export const ogTemplateSchema = z.object({
  layout: z.enum(["left", "center", "right"]).default("left"),
  background: z.discriminatedUnion("type", [
    z.object({ type: z.literal("color"), value: color }),
    z.object({ type: z.literal("gradient"), from: color, to: color }),
    z.object({ type: z.literal("image"), url: z.string().url() }),
  ]),
  title: textLayerSchema,
  subtitle: textLayerSchema.optional(),
  logoUrl: z.string().url().optional(),
  showHostname: z.boolean().default(false),
});

export type OgTemplate = z.infer<typeof ogTemplateSchema>;

export type OgBindings = {
  title: string;
  siteName: string;
  excerpt: string;
  featuredImage: string | null;
  hostname: string;
};

export type RenderedOgPayload = {
  width: number;
  height: number;
  layout: OgTemplate["layout"];
  background: OgTemplate["background"];
  title: string;
  titleColor: string;
  titleSize: number;
  subtitle: string;
  subtitleColor: string;
  subtitleSize: number;
  logoUrl?: string;
  hostname?: string;
};

function bind(text: string, bindings: OgBindings): string {
  return text
    .replaceAll("{{title}}", bindings.title)
    .replaceAll("{{excerpt}}", bindings.excerpt)
    .replaceAll("{{siteName}}", bindings.siteName)
    .replaceAll("{{hostname}}", bindings.hostname);
}

export function renderOgPayload(template: OgTemplate, bindings: OgBindings): RenderedOgPayload {
  const background =
    template.background.type === "image" && bindings.featuredImage
      ? template.background
      : template.background;

  return {
    width: 1200,
    height: 630,
    layout: template.layout,
    background,
    title: bind(template.title.text, bindings),
    titleColor: template.title.color,
    titleSize: template.title.size,
    subtitle: bind(template.subtitle?.text ?? "", bindings),
    subtitleColor: template.subtitle?.color ?? "#9a968c",
    subtitleSize: template.subtitle?.size ?? 28,
    logoUrl: template.logoUrl,
    hostname: template.showHostname ? bindings.hostname : undefined,
  };
}
