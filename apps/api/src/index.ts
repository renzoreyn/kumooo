import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import type { Env } from "./env";
import { loadSession, type AppEnv } from "./middleware/session";
import { authRoutes } from "./routes/auth";
import { demoBlogRoutes, wipeAndSeedDemoBlog } from "./routes/demo-blog";
import { demoMediaRoutes, wipeDemoMedia } from "./routes/demo-media";
import { demoShopRoutes, wipeAndSeedDemoShop } from "./routes/demo-shop";
import { mediaRoutes } from "./routes/media";
import { publicRoutes } from "./routes/public";
import { sitesRoutes } from "./routes/sites";

const app = new Hono<AppEnv>();

app.use(
  "/public/*",
  cors({
    origin: "*",
    allowMethods: ["GET", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  }),
);

app.use(
  "/media/*",
  cors({
    origin: "*",
    allowMethods: ["GET", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  }),
);

app.use("*", async (c, next) => {
  if (c.req.path.startsWith("/public/") || c.req.path.startsWith("/media/")) return next();
  const allowed = new Set(
    [
      c.env.APP_ORIGIN,
      c.env.BLOG_ORIGIN,
      c.env.SHOP_ORIGIN,
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
    ].filter(Boolean),
  );
  return cors({
    origin: (origin) => (origin && allowed.has(origin) ? origin : c.env.APP_ORIGIN),
    credentials: true,
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })(c, next);
});

app.use("*", loadSession);

app.get("/", (c) => c.json({ ok: true, service: "kumooo-api" }));
app.get("/health", (c) => c.json({ ok: true }));

app.route("/auth", authRoutes);
app.route("/sites", sitesRoutes);
app.route("/media", mediaRoutes);
app.route("/public", publicRoutes);
app.route("/demo/media", demoMediaRoutes);
app.route("/demo/blog", demoBlogRoutes);
app.route("/demo/shop", demoShopRoutes);

app.onError((err, c) => {
  if (err instanceof HTTPException) return err.getResponse();
  if (err instanceof Response) return err;
  console.error(err);
  return c.json({ error: "internal" }, 500);
});

async function scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext) {
  await wipeAndSeedDemoBlog(env.DB);
  await wipeAndSeedDemoShop(env.DB);
  await wipeDemoMedia(env.MEDIA);
}

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return app.fetch(request, env, ctx);
  },
  scheduled,
};
