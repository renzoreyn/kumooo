import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Env } from "./env";
import { loadSession, type AppEnv } from "./middleware/session";
import { authRoutes } from "./routes/auth";
import { sitesRoutes } from "./routes/sites";

const app = new Hono<AppEnv>();

app.use("*", async (c, next) => {
  const origin = c.env.APP_ORIGIN;
  return cors({
    origin,
    credentials: true,
    allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  })(c, next);
});

app.use("*", loadSession);

app.get("/", (c) => c.json({ ok: true, service: "kumooo-api" }));
app.get("/health", (c) => c.json({ ok: true }));

app.route("/auth", authRoutes);
app.route("/sites", sitesRoutes);

app.onError((err, c) => {
  if (err instanceof Response) return err;
  console.error(err);
  return c.json({ error: "internal" }, 500);
});

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return app.fetch(request, env, ctx);
  },
};
