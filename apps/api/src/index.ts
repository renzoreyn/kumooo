import { newId } from "@kumooo/core";
import { createDb } from "@kumooo/db";
import { Hono } from "hono";
import { cors } from "hono/cors";
import type { AppEnv } from "./env.js";
import { ApiError } from "./errors.js";
import { authenticate } from "./middleware/auth.js";
import { authRoutes } from "./routes/auth.js";
import { contentRoutes } from "./routes/content.js";
import { domainRoutes } from "./routes/domains.js";
import { mediaRoutes } from "./routes/media.js";
import { orgRoutes, siteRoutes } from "./routes/orgs.js";

const app = new Hono<AppEnv>();

app.use("*", async (c, next) => {
  c.set("requestId", newId("req"));
  c.set("db", createDb(c.env.DB));
  await next();
  c.header("X-Request-Id", c.get("requestId"));
});

app.use("*", (c, next) =>
  cors({
    origin: (origin) =>
      origin === c.env.DASHBOARD_ORIGIN || c.env.ENVIRONMENT === "development" ? origin : "",
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["X-Request-Id"],
  })(c, next),
);

app.use("*", authenticate);

app.get("/", (c) =>
  c.json({ name: "kumooo-api", docs: "https://docs.kumooo.dev", status: "ok" }),
);
app.get("/health", (c) => c.json({ ok: true }));

app.route("/v1/auth", authRoutes);
app.route("/v1/orgs", orgRoutes);
app.route("/v1", siteRoutes);
app.route("/v1", contentRoutes);
app.route("/v1", mediaRoutes);
app.route("/v1", domainRoutes);

app.notFound((c) =>
  c.json(
    { error: { code: "not_found", message: `No route for ${c.req.method} ${c.req.path}.` } },
    404,
  ),
);

app.onError((err, c) => {
  if (err instanceof ApiError) {
    return c.json(
      {
        error: {
          code: err.code,
          message: err.message,
          ...(err.details !== undefined ? { details: err.details } : {}),
        },
      },
      err.status as 400,
    );
  }
  if (err && typeof err === "object" && "name" in err && (err as { name: string }).name === "ZodError") {
    return c.json(
      {
        error: {
          code: "bad_request",
          message: "That request didn't look right.",
          details: (err as { issues?: unknown }).issues,
        },
      },
      400,
    );
  }
  console.log(
    JSON.stringify({
      level: "error",
      requestId: c.get("requestId"),
      path: c.req.path,
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    }),
  );
  return c.json(
    {
      error: {
        code: "internal_error",
        message: `Something broke on our side. Quote request ID ${c.get("requestId")} if you contact support.`,
      },
    },
    500,
  );
});

export default {
  fetch: app.fetch,
};
