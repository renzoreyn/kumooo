import { z } from "zod";

export const roles = ["owner", "admin", "editor", "author", "viewer"] as const;
export type Role = (typeof roles)[number];

export const contentStatuses = ["draft", "scheduled", "published", "archived"] as const;
export type ContentStatus = (typeof contentStatuses)[number];

export const siteStatuses = ["active", "archived"] as const;
export type SiteStatus = (typeof siteStatuses)[number];

export const siteSettingsSchema = z
  .object({
    title: z.string().default(""),
    description: z.string().default(""),
    language: z.string().default("en"),
    timezone: z.string().default("UTC"),
    postsPerPage: z.number().int().min(1).max(50).default(10),
    allowRawHtml: z.boolean().default(false),
    seo: z
      .object({
        titleTemplate: z.string().optional(),
        defaultOgImage: z.string().optional(),
        twitterHandle: z.string().optional(),
        noindex: z.boolean().default(false),
      })
      .default({}),
    nav: z
      .array(z.object({ title: z.string(), url: z.string() }))
      .default([]),
  })
  .default({});

export type SiteSettings = z.infer<typeof siteSettingsSchema>;

export const contentSeoSchema = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    ogImage: z.string().optional(),
    canonicalUrl: z.string().optional(),
    noindex: z.boolean().optional(),
  })
  .default({});

export type ContentSeo = z.infer<typeof contentSeoSchema>;

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10, "Use at least 10 characters. Passphrases beat hieroglyphs."),
  name: z.string().min(1).max(80),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createSiteSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z
    .string()
    .regex(/^[a-z0-9][a-z0-9-]*$/, "Lowercase letters, numbers, hyphens.")
    .optional(),
  description: z.string().max(500).optional(),
  theme: z.string().default("haru"),
});

export const createContentSchema = z.object({
  type: z.enum(["post", "page"]).default("post"),
  title: z.string().min(1).max(300),
  slug: z.string().optional(),
  excerpt: z.string().max(2000).optional(),
  bodyMarkdown: z.string().default(""),
  status: z.enum(contentStatuses).default("draft"),
  scheduledAt: z.string().datetime().optional(),
  tags: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
  customFields: z.record(z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])).default({}),
  seo: contentSeoSchema.optional(),
  featuredImage: z.string().optional(),
});

export const updateContentSchema = createContentSchema.partial().extend({
  expectedUpdatedAt: z.string().datetime().optional(),
});

export const RESERVED_SLUGS = new Set([
  "www",
  "api",
  "docs",
  "app",
  "admin",
  "dashboard",
  "dash",
  "static",
  "cdn",
  "mail",
  "status",
]);
