"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Input } from "@kumooo/ui";
import { client } from "@/lib/api";
import { site } from "@/lib/site";

function networkFailMessage(code: string) {
  if (
    code === "Failed to fetch" ||
    code === "NetworkError when attempting to fetch resource." ||
    code === "Load failed" ||
    code === "Network request failed"
  ) {
    return `Could not reach the API (${site.api}). Hard-refresh and try again.`;
  }
  return null;
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const error = params.get("error");
  const [step, setStep] = React.useState<"email" | "code">("email");
  const [email, setEmail] = React.useState("");
  const [code, setCode] = React.useState("");
  const [remember, setRemember] = React.useState(true);
  const [status, setStatus] = React.useState<"idle" | "sending" | "verifying" | "fail">("idle");
  const [devCode, setDevCode] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    client
      .me()
      .then(() => router.replace("/"))
      .catch(() => undefined);
  }, [router]);

  async function onRequestCode(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setMessage(null);
    setDevCode(null);
    try {
      const res = await client.requestOtp(email);
      setStep("code");
      setStatus("idle");
      setMessage(
        res.emailed
          ? "Check your email for a 6-digit code. It expires in 10 minutes."
          : "Code created. Email sending is not configured, so use the dev code below.",
      );
      if (res.devCode) setDevCode(res.devCode);
    } catch (err) {
      setStatus("fail");
      const fail = err instanceof Error ? err.message : "failed";
      if (fail === "rate_limited") {
        setMessage("Too many requests. Try again in an hour.");
      } else {
        setMessage(networkFailMessage(fail) ?? `Could not send code (${fail}).`);
      }
    }
  }

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setStatus("verifying");
    setMessage(null);
    try {
      await client.verifyOtp(email, code, remember);
      router.replace("/");
    } catch (err) {
      setStatus("fail");
      const fail = err instanceof Error ? err.message : "failed";
      if (fail === "invalid_code") {
        setMessage("That code is wrong. Try again.");
      } else if (fail === "expired_code") {
        setMessage("That code expired. Request a new one.");
      } else if (fail === "too_many_attempts") {
        setMessage("Too many wrong tries. Request a new code.");
      } else if (fail === "rate_limited") {
        setMessage("Too many requests. Try again later.");
      } else {
        setMessage(networkFailMessage(fail) ?? `Could not verify (${fail}).`);
      }
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-16">
      <div className="mb-10 text-center">
        <svg className="mx-auto size-10 text-[var(--fg)]" viewBox="0 0 32 32" fill="currentColor" aria-hidden>
          <g transform="translate(6.811 3.2) scale(0.071508)">
            <rect x="0" y="0" width="85" height="358" />
            <polygon points="85,252 133,185 134,185 147,204 161,223 174,242 187,261 201,280 214,299 228,318 241,337 255,356 256,357 156,357 155,356 142,337 129,318 116,299 103,280 90,261 90,252" />
            <circle cx="191.65" cy="155.3" r="42" fill="#6ee7b7" />
          </g>
        </svg>
        <h1 className="mt-4 text-2xl font-semibold tracking-[-0.03em]">Sign in to kumooo</h1>
        <p className="mt-2 text-sm text-[var(--fog)]">Email code. No password.</p>
      </div>

      {error ? (
        <p className="mb-4 rounded-xl border border-[var(--line)] bg-[var(--bg-2)] px-4 py-3 text-sm text-[var(--fog)]">
          Something went wrong with that sign-in. Request a new code.
        </p>
      ) : null}

      {step === "email" ? (
        <form onSubmit={onRequestCode} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm text-[var(--fog)]">
              Email
            </label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="border-[var(--line)] bg-[var(--bg-2)] text-[var(--fg)]"
            />
          </div>
          <Button
            type="submit"
            disabled={status === "sending"}
            className="w-full rounded-full bg-[var(--fg)] text-[var(--bg)] hover:opacity-90"
          >
            {status === "sending" ? "Sending…" : "Email me a code"}
          </Button>
        </form>
      ) : (
        <form onSubmit={onVerify} className="space-y-4">
          <p className="text-sm text-[var(--fog)]">
            Code sent to <span className="text-[var(--fg)]">{email}</span>.{" "}
            <button
              type="button"
              className="underline-offset-2 hover:underline"
              onClick={() => {
                setStep("email");
                setCode("");
                setStatus("idle");
                setMessage(null);
                setDevCode(null);
              }}
            >
              Use a different email
            </button>
          </p>
          <div>
            <label htmlFor="code" className="mb-1.5 block text-sm text-[var(--fog)]">
              6-digit code
            </label>
            <Input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              pattern="\d{6}"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="border-[var(--line)] bg-[var(--bg-2)] font-mono text-lg tracking-[0.35em] text-[var(--fg)]"
            />
          </div>
          <label className="flex items-center gap-2.5 text-sm text-[var(--fog)]">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="size-4 rounded border-[var(--line)] accent-[var(--mint)]"
            />
            Remember this device for 30 days
          </label>
          <Button
            type="submit"
            disabled={status === "verifying" || code.length !== 6}
            className="w-full rounded-full bg-[var(--fg)] text-[var(--bg)] hover:opacity-90"
          >
            {status === "verifying" ? "Verifying…" : "Verify code"}
          </Button>
          <button
            type="button"
            className="w-full text-center text-sm text-[var(--fog)] underline-offset-2 hover:text-[var(--fg)] hover:underline"
            disabled={status === "sending"}
            onClick={async () => {
              setStatus("sending");
              setMessage(null);
              try {
                const res = await client.requestOtp(email);
                setStatus("idle");
                setMessage(
                  res.emailed
                    ? "New code sent. It expires in 10 minutes."
                    : "New code created. Use the dev code below.",
                );
                if (res.devCode) setDevCode(res.devCode);
              } catch (err) {
                setStatus("fail");
                const fail = err instanceof Error ? err.message : "failed";
                setMessage(networkFailMessage(fail) ?? `Could not resend (${fail}).`);
              }
            }}
          >
            Resend code
          </button>
        </form>
      )}

      {message ? <p className="mt-4 text-sm leading-relaxed text-[var(--fog)]">{message}</p> : null}
      {devCode ? (
        <p className="mt-3 font-mono text-sm tracking-[0.2em] text-[var(--mint)]">{devCode}</p>
      ) : null}

      <p className="mt-10 text-center text-sm text-[var(--fog)]">
        <a href={site.marketing} className="hover:text-[var(--fg)]">
          kumooo.dev
        </a>
      </p>
    </main>
  );
}
