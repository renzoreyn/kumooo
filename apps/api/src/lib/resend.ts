import type { Env } from "../env";

export async function sendTransactionalEmail(
  env: Env,
  msg: { to: string; subject: string; html: string; text: string },
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const key = env.RESEND_API_KEY;
  if (!key) {
    return { ok: false, error: "missing_resend_key" };
  }

  const from = `${env.FROM_NAME} <${env.FROM_EMAIL}>`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [msg.to],
      subject: msg.subject,
      html: msg.html,
      text: msg.text,
      reply_to: env.REPLY_TO_EMAIL || undefined,
    }),
  });

  const body = (await res.json().catch(() => ({}))) as {
    id?: string;
    message?: string;
    name?: string;
  };

  if (!res.ok) {
    const error = body.message || body.name || `resend_http_${res.status}`;
    console.error("resend send failed", res.status, body);
    return { ok: false, error };
  }

  return { ok: true, id: body.id ?? "unknown" };
}
