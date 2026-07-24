import { Hono } from "hono";
import type { Context } from "hono";
import type { AppEnv } from "../middleware/session";
import {
  clearCookieHeader,
  cookieHeader,
  newId,
  randomToken,
  sha256Hex,
} from "../lib/crypto";

export const DEMO_SHOP_COOKIE = "kumooo_shop_demo";
const ADMIN_TTL_SEC = 12 * 60 * 60;
const DESC_MAX = 8000;

type ProductColor = { name: string; hex: string };

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  price: string;
  blurb: string;
  image_url: string;
  description: string;
  sizes_json: string;
  colors_json: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export const demoShopRoutes = new Hono<AppEnv>();

function readCookie(header: string | undefined, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return rest.join("=") || null;
  }
  return null;
}

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return base || `item-${Date.now().toString(36)}`;
}

function adminUser(env: AppEnv["Bindings"]): string {
  return env.SHOP_DEMO_USER || env.BLOG_DEMO_USER || "admin";
}

function adminPass(env: AppEnv["Bindings"]): string {
  return env.SHOP_DEMO_PASS || env.BLOG_DEMO_PASS || "admin";
}

function isHttpUrl(value: string): boolean {
  if (!value) return true;
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function parseSizes(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input.map((s) => String(s).trim()).filter(Boolean).slice(0, 20);
  }
  if (typeof input === "string") {
    return input
      .split(/[,|]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 20);
  }
  return [];
}

function parseColors(input: unknown): ProductColor[] {
  if (Array.isArray(input)) {
    return input
      .map((c) => {
        if (typeof c === "string") {
          const [name, hex] = c.split(/[#:]/).map((x) => x.trim());
          return { name: name || "Color", hex: normalizeHex(hex) };
        }
        if (c && typeof c === "object") {
          const o = c as { name?: string; hex?: string };
          return {
            name: String(o.name ?? "Color").trim().slice(0, 40) || "Color",
            hex: normalizeHex(o.hex),
          };
        }
        return null;
      })
      .filter((c): c is ProductColor => Boolean(c))
      .slice(0, 12);
  }
  if (typeof input === "string") {
    return input
      .split(/\n|,/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const m = line.match(/^(.+?)[\s#:]+#?([0-9a-fA-F]{3,8})$/);
        if (m) return { name: m[1]!.trim().slice(0, 40), hex: normalizeHex(m[2]) };
        return { name: line.slice(0, 40), hex: "#888888" };
      })
      .slice(0, 12);
  }
  return [];
}

function normalizeHex(hex: string | undefined): string {
  const h = String(hex ?? "888888").replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(h) || /^[0-9a-fA-F]{6}$/.test(h) || /^[0-9a-fA-F]{8}$/.test(h)) {
    return `#${h.toLowerCase()}`;
  }
  return "#888888";
}

function parseJsonArray<T>(raw: string | null | undefined, fallback: T[]): T[] {
  if (!raw) return fallback;
  try {
    const v = JSON.parse(raw) as unknown;
    return Array.isArray(v) ? (v as T[]) : fallback;
  } catch {
    return fallback;
  }
}

async function requireDemoAdmin(c: Context<AppEnv>): Promise<boolean> {
  const auth = c.req.header("authorization");
  const bearer = auth?.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : null;
  const token = bearer || readCookie(c.req.header("cookie"), DEMO_SHOP_COOKIE);
  if (!token) return false;
  const hash = await sha256Hex(token);
  const row = await c.env.DB.prepare(
    `SELECT id FROM demo_shop_sessions
     WHERE token_hash = ? AND expires_at > strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`,
  )
    .bind(hash)
    .first<{ id: string }>();
  return Boolean(row);
}

export const SEED_PRODUCTS = [
  {
    slug: "drift",
    name: "Drift Parka",
    price: "$420",
    blurb: "Wind-cut shell for cold starts.",
    description:
      "A layered shell built for cold starts and long walks. Storm flap, quiet hardware, and a hood that actually stays put.\n\nPacks into its own pocket. Water-resistant face fabric with a soft brushed liner.",
    imageUrl: "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800&q=80",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Ink", hex: "#1d1d1f" },
      { name: "Fog", hex: "#8b93a7" },
      { name: "Mint", hex: "#6ee7b7" },
    ],
  },
  {
    slug: "rime",
    name: "Rime Shell",
    price: "$280",
    blurb: "Hardface layer. Quiet zippers.",
    description:
      "Hardface outer with taped seams and a clean silhouette. Made for shoulder seasons when weather won't pick a side.\n\nTwo-way zip, packable hood, reflective stitch at the hem.",
    imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Black", hex: "#0a0a0a" },
      { name: "Ice", hex: "#c8d6ef" },
    ],
  },
  {
    slug: "glacier",
    name: "Glacier Knit",
    price: "$160",
    blurb: "Merino weight for the descent.",
    description:
      "Fine merino knit with enough structure for layering and enough softness for all-day wear. Ribbed cuffs, relaxed collar.\n\nMachine wash cold. Lay flat to dry.",
    imageUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80",
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Cream", hex: "#f4f0e8" },
      { name: "Stone", hex: "#9a9590" },
      { name: "Navy", hex: "#1e3a5f" },
    ],
  },
] as const;

export async function wipeAndSeedDemoShop(db: D1Database): Promise<void> {
  await db.prepare(`DELETE FROM demo_products`).run();
  await db.prepare(`DELETE FROM demo_shop_sessions`).run();
  const now = new Date().toISOString();
  for (const p of SEED_PRODUCTS) {
    const id = newId("dprod");
    await db
      .prepare(
        `INSERT INTO demo_products
         (id, slug, name, price, blurb, image_url, description, sizes_json, colors_json, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?)`,
      )
      .bind(
        id,
        p.slug,
        p.name,
        p.price,
        p.blurb,
        p.imageUrl,
        p.description,
        JSON.stringify(p.sizes),
        JSON.stringify(p.colors),
        now,
        now,
      )
      .run();
  }
}

function mapProduct(p: ProductRow) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    blurb: p.blurb,
    description: p.description || "",
    imageUrl: p.image_url || null,
    sizes: parseJsonArray<string>(p.sizes_json, []),
    colors: parseJsonArray<ProductColor>(p.colors_json, []),
    status: p.status,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

// —— Public ——

demoShopRoutes.get("/products", async (c) => {
  const rows = await c.env.DB.prepare(
    `SELECT * FROM demo_products WHERE status = 'published' ORDER BY name ASC`,
  ).all<ProductRow>();
  return c.json({ products: (rows.results ?? []).map(mapProduct) });
});

demoShopRoutes.get("/products/:slug", async (c) => {
  const slug = c.req.param("slug");
  const row = await c.env.DB.prepare(
    `SELECT * FROM demo_products WHERE slug = ? AND status = 'published'`,
  )
    .bind(slug)
    .first<ProductRow>();
  if (!row) return c.json({ error: "not_found" }, 404);
  return c.json({ product: mapProduct(row) });
});

// —— Admin auth ——

demoShopRoutes.post("/admin/login", async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as {
    username?: string;
    password?: string;
  };
  const username = String(body.username ?? "");
  const password = String(body.password ?? "");
  if (username !== adminUser(c.env) || password !== adminPass(c.env)) {
    return c.json({ error: "invalid_credentials" }, 401);
  }
  const token = randomToken(32);
  const hash = await sha256Hex(token);
  const id = newId("dssess");
  const expires = new Date(Date.now() + ADMIN_TTL_SEC * 1000).toISOString();
  await c.env.DB.prepare(
    `INSERT INTO demo_shop_sessions (id, token_hash, expires_at) VALUES (?, ?, ?)`,
  )
    .bind(id, hash, expires)
    .run();

  c.header(
    "Set-Cookie",
    cookieHeader(DEMO_SHOP_COOKIE, token, ADMIN_TTL_SEC, undefined, "None"),
  );
  return c.json({ ok: true, token });
});

demoShopRoutes.post("/admin/logout", async (c) => {
  const auth = c.req.header("authorization");
  const bearer = auth?.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : null;
  const token = bearer || readCookie(c.req.header("cookie"), DEMO_SHOP_COOKIE);
  if (token) {
    const hash = await sha256Hex(token);
    await c.env.DB.prepare(`DELETE FROM demo_shop_sessions WHERE token_hash = ?`)
      .bind(hash)
      .run();
  }
  c.header("Set-Cookie", clearCookieHeader(DEMO_SHOP_COOKIE, undefined, "None"));
  return c.json({ ok: true });
});

demoShopRoutes.get("/admin/me", async (c) => {
  if (!(await requireDemoAdmin(c))) return c.json({ error: "unauthorized" }, 401);
  return c.json({ ok: true, user: "admin" });
});

demoShopRoutes.get("/admin/products", async (c) => {
  if (!(await requireDemoAdmin(c))) return c.json({ error: "unauthorized" }, 401);
  const rows = await c.env.DB.prepare(
    `SELECT * FROM demo_products ORDER BY updated_at DESC`,
  ).all<ProductRow>();
  return c.json({ products: (rows.results ?? []).map(mapProduct) });
});

demoShopRoutes.post("/admin/products", async (c) => {
  if (!(await requireDemoAdmin(c))) return c.json({ error: "unauthorized" }, 401);
  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
  const name = String(body.name ?? "").trim().slice(0, 120);
  const price = String(body.price ?? "").trim().slice(0, 40);
  const blurb = String(body.blurb ?? "").trim().slice(0, 280);
  const description = String(body.description ?? "").trim().slice(0, DESC_MAX);
  const imageUrl = String(body.imageUrl ?? "").trim().slice(0, 500);
  const sizes = parseSizes(body.sizes ?? body.sizesText);
  const colors = parseColors(body.colors ?? body.colorsText);
  if (!name || !price) return c.json({ error: "invalid" }, 400);
  if (!isHttpUrl(imageUrl)) return c.json({ error: "invalid_image" }, 400);
  let slug = String(body.slug ?? slugify(name))
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 80);
  if (!slug) slug = slugify(name);
  const status = body.status === "draft" ? "draft" : "published";
  const now = new Date().toISOString();
  const id = newId("dprod");
  try {
    await c.env.DB.prepare(
      `INSERT INTO demo_products
       (id, slug, name, price, blurb, image_url, description, sizes_json, colors_json, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        id,
        slug,
        name,
        price,
        blurb,
        imageUrl,
        description,
        JSON.stringify(sizes),
        JSON.stringify(colors),
        status,
        now,
        now,
      )
      .run();
  } catch {
    return c.json({ error: "slug_taken" }, 409);
  }
  const row = await c.env.DB.prepare(`SELECT * FROM demo_products WHERE id = ?`)
    .bind(id)
    .first<ProductRow>();
  return c.json({ product: mapProduct(row!) }, 201);
});

demoShopRoutes.patch("/admin/products/:id", async (c) => {
  if (!(await requireDemoAdmin(c))) return c.json({ error: "unauthorized" }, 401);
  const id = c.req.param("id");
  const existing = await c.env.DB.prepare(`SELECT * FROM demo_products WHERE id = ?`)
    .bind(id)
    .first<ProductRow>();
  if (!existing) return c.json({ error: "not_found" }, 404);
  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
  const name =
    body.name !== undefined ? String(body.name).trim().slice(0, 120) : existing.name;
  const price =
    body.price !== undefined ? String(body.price).trim().slice(0, 40) : existing.price;
  const blurb =
    body.blurb !== undefined ? String(body.blurb).trim().slice(0, 280) : existing.blurb;
  const description =
    body.description !== undefined
      ? String(body.description).trim().slice(0, DESC_MAX)
      : existing.description || "";
  const imageUrl =
    body.imageUrl !== undefined
      ? String(body.imageUrl).trim().slice(0, 500)
      : existing.image_url;
  const sizes =
    body.sizes !== undefined || body.sizesText !== undefined
      ? parseSizes(body.sizes ?? body.sizesText)
      : parseJsonArray<string>(existing.sizes_json, []);
  const colors =
    body.colors !== undefined || body.colorsText !== undefined
      ? parseColors(body.colors ?? body.colorsText)
      : parseJsonArray<ProductColor>(existing.colors_json, []);
  let slug =
    body.slug !== undefined
      ? String(body.slug)
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, "")
          .slice(0, 80)
      : existing.slug;
  if (!slug) slug = existing.slug;
  const status =
    body.status === "draft" || body.status === "published"
      ? body.status
      : existing.status;
  if (!name || !price) return c.json({ error: "invalid" }, 400);
  if (!isHttpUrl(imageUrl)) return c.json({ error: "invalid_image" }, 400);
  const now = new Date().toISOString();
  try {
    await c.env.DB.prepare(
      `UPDATE demo_products SET slug = ?, name = ?, price = ?, blurb = ?, image_url = ?,
       description = ?, sizes_json = ?, colors_json = ?, status = ?, updated_at = ? WHERE id = ?`,
    )
      .bind(
        slug,
        name,
        price,
        blurb,
        imageUrl,
        description,
        JSON.stringify(sizes),
        JSON.stringify(colors),
        status,
        now,
        id,
      )
      .run();
  } catch {
    return c.json({ error: "slug_taken" }, 409);
  }
  const row = await c.env.DB.prepare(`SELECT * FROM demo_products WHERE id = ?`)
    .bind(id)
    .first<ProductRow>();
  return c.json({ product: mapProduct(row!) });
});

demoShopRoutes.delete("/admin/products/:id", async (c) => {
  if (!(await requireDemoAdmin(c))) return c.json({ error: "unauthorized" }, 401);
  const id = c.req.param("id");
  const res = await c.env.DB.prepare(`DELETE FROM demo_products WHERE id = ?`).bind(id).run();
  if (!res.meta.changes) return c.json({ error: "not_found" }, 404);
  return c.json({ ok: true });
});
