/** Real geometric k mark as PNG (many clients skip SVG in img tags). */
const MARK_URL = "https://kumooo.dev/brand-mark.png";

/** Transactional HTML + text for email OTP sign-in. */
export function otpEmail(opts: {
  code: string;
  appOrigin: string;
}): { subject: string; text: string; html: string } {
  const { code, appOrigin } = opts;
  const subject = "Your kumooo code";

  const text = [
    "Your kumooo sign-in code",
    "",
    code,
    "",
    "This code expires in 10 minutes.",
    "",
    "If you did not ask to sign in, you can ignore this email.",
    "",
    `kumooo · ${appOrigin}`,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#0c0c0e;color:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0c0c0e;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;background:#161618;border:1px solid rgba(245,245,247,0.12);border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:28px 28px 8px;text-align:center;">
              <img src="${MARK_URL}" width="40" height="40" alt="kumooo" style="display:block;margin:0 auto;border:0;outline:none;" />
              <div style="margin-top:12px;font-size:15px;font-weight:600;letter-spacing:-0.02em;color:#f5f5f7;">kumooo<span style="color:#6ee7b7;">.js</span></div>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 0;text-align:center;">
              <h1 style="margin:0;font-size:22px;line-height:1.25;font-weight:600;letter-spacing:-0.03em;color:#f5f5f7;">Your sign-in code</h1>
              <p style="margin:12px 0 0;font-size:15px;line-height:1.55;color:#a1a1a6;">Enter this on the device where you want to stay signed in. Expires in <strong style="color:#f5f5f7;font-weight:600;">10 minutes</strong>.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;text-align:center;">
              <div style="display:inline-block;background:#0c0c0e;border:1px solid rgba(245,245,247,0.14);border-radius:12px;padding:16px 28px;font-size:32px;font-weight:700;letter-spacing:0.35em;color:#f5f5f7;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;">${code}</div>
            </td>
          </tr>
        </table>
        <p style="margin:20px 0 0;font-size:12px;line-height:1.5;color:#6e6e73;max-width:440px;text-align:center;">If you did not request this, ignore the email. Nothing will happen.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}
