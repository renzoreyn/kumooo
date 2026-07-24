"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Input } from "@kumooo/ui";
import { client } from "@/lib/api";
import { site } from "@/lib/site";

type Mode = "code" | "password" | "signup";
type Step = "form" | "verify";

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
  const [mode, setMode] = React.useState<Mode>("code");
  const [step, setStep] = React.useState<Step>("form");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [remember, setRemember] = React.useState(true);
  const [status, setStatus] = React.useState<"idle" | "busy" | "fail">("idle");
  const [devCode, setDevCode] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    client
      .me()
      .then(() => router.replace("/"))
      .catch(() => undefined);
  }, [router]);

  function switchMode(next: Mode) {
    setMode(next);
    setStep("form");
    setCode("");
    setPassword("");
    setStatus("idle");
    setMessage(null);
    setDevCode(null);
  }

  async function onRequestCode(e: React.FormEvent) {
    e.preventDefault();
    setStatus("busy");
    setMessage(null);
    setDevCode(null);
    try {
      const res = await client.requestOtp(email);
      setStep("verify");
      setStatus("idle");
      setMessage(
        res.emailed
          ? "Code sent. Expires in 10 minutes. Check spam if you live dangerously."
          : "Code created. Email is not wired, so use the dev code.",
      );
      if (res.devCode) setDevCode(res.devCode);
    } catch (err) {
      setStatus("fail");
      const fail = err instanceof Error ? err.message : "failed";
      if (fail === "rate_limited") {
        setMessage("Too many requests. Touch grass for an hour.");
      } else {
        setMessage(networkFailMessage(fail) ?? `Could not send code (${fail}).`);
      }
    }
  }

  async function onSignup(e: React.FormEvent) {
    e.preventDefault();
    setStatus("busy");
    setMessage(null);
    setDevCode(null);
    try {
      const res = await client.signup(email, password);
      setStep("verify");
      setStatus("idle");
      setMessage(
        res.emailed
          ? "Account staged. Enter the code we emailed you."
          : "Account staged. Email is not wired; use the dev code.",
      );
      if (res.devCode) setDevCode(res.devCode);
    } catch (err) {
      setStatus("fail");
      const fail = err instanceof Error ? err.message : "failed";
      if (fail === "email_taken") setMessage("That email already has a password. Sign in.");
      else if (fail === "invalid_password") setMessage("Password needs at least 8 characters.");
      else if (fail === "rate_limited") setMessage("Too many requests. Slow down.");
      else setMessage(networkFailMessage(fail) ?? `Signup failed (${fail}).`);
    }
  }

  async function onPasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setStatus("busy");
    setMessage(null);
    try {
      await client.loginPassword(email, password, remember);
      router.replace("/");
    } catch (err) {
      setStatus("fail");
      const fail = err instanceof Error ? err.message : "failed";
      if (fail === "no_password") {
        setMessage("No password on this account. Use a code, or create one after you sign in.");
      } else if (fail === "email_unverified") {
        setMessage("Email not verified yet. We can send a code.");
        try {
          const res = await client.requestOtp(email);
          setStep("verify");
          setMode("signup");
          if (res.devCode) setDevCode(res.devCode);
        } catch {
          /* ignore */
        }
      } else if (fail === "invalid_credentials") {
        setMessage("Wrong email or password. Tragic.");
      } else {
        setMessage(networkFailMessage(fail) ?? `Sign-in failed (${fail}).`);
      }
    }
  }

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setStatus("busy");
    setMessage(null);
    try {
      await client.verifyOtp(email, code, remember);
      router.replace("/");
    } catch (err) {
      setStatus("fail");
      const fail = err instanceof Error ? err.message : "failed";
      if (fail === "invalid_code") setMessage("Wrong code.");
      else if (fail === "expired_code") setMessage("Code expired. Request another.");
      else if (fail === "too_many_attempts") setMessage("Too many wrong tries. New code.");
      else if (fail === "rate_limited") setMessage("Rate limited. Wait.");
      else setMessage(networkFailMessage(fail) ?? `Could not verify (${fail}).`);
    }
  }

  const title =
    mode === "signup" ? "Create a kumooo account" : mode === "password" ? "Sign in" : "Sign in";
  const tagline =
    mode === "signup"
      ? "Password now. Code to prove the email is yours."
      : mode === "password"
        ? "Email and password. No ceremony."
        : "We email you a code. Fancy.";

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
        <h1 className="mt-4 text-2xl font-semibold tracking-[-0.03em]">{title}</h1>
        <p className="mt-2 text-sm text-[var(--fog)]">{tagline}</p>
      </div>

      {error ? (
        <p className="mb-4 rounded-xl border border-[var(--line)] bg-[var(--bg-2)] px-4 py-3 text-sm text-[var(--fog)]">
          That sign-in fell over. Try again.
        </p>
      ) : null}

      {step === "verify" ? (
        <form onSubmit={onVerify} className="space-y-4">
          <p className="text-sm text-[var(--fog)]">
            Code for <span className="text-[var(--fg)]">{email}</span>.{" "}
            <button
              type="button"
              className="underline-offset-2 hover:underline"
              onClick={() => {
                setStep("form");
                setCode("");
                setStatus("idle");
                setMessage(null);
                setDevCode(null);
              }}
            >
              Back
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
            disabled={status === "busy" || code.length !== 6}
            className="w-full rounded-full bg-[var(--fg)] text-[var(--bg)] hover:opacity-90"
          >
            {status === "busy" ? "Checking…" : "Verify code"}
          </Button>
        </form>
      ) : mode === "code" ? (
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
            disabled={status === "busy"}
            className="w-full rounded-full bg-[var(--fg)] text-[var(--bg)] hover:opacity-90"
          >
            {status === "busy" ? "Sending…" : "Email me a code"}
          </Button>
          <p className="text-center text-sm text-[var(--fog)]">
            <button type="button" className="hover:text-[var(--fg)] hover:underline" onClick={() => switchMode("password")}>
              Use a password instead
            </button>
            {" · "}
            <button type="button" className="hover:text-[var(--fg)] hover:underline" onClick={() => switchMode("signup")}>
              Create an account
            </button>
          </p>
        </form>
      ) : mode === "password" ? (
        <form onSubmit={onPasswordLogin} className="space-y-4">
          <div>
            <label htmlFor="email-pw" className="mb-1.5 block text-sm text-[var(--fog)]">
              Email
            </label>
            <Input
              id="email-pw"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-[var(--line)] bg-[var(--bg-2)] text-[var(--fg)]"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm text-[var(--fog)]">
              Password
            </label>
            <Input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-[var(--line)] bg-[var(--bg-2)] text-[var(--fg)]"
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
            disabled={status === "busy"}
            className="w-full rounded-full bg-[var(--fg)] text-[var(--bg)] hover:opacity-90"
          >
            {status === "busy" ? "Signing in…" : "Sign in"}
          </Button>
          <p className="text-center text-sm text-[var(--fog)]">
            <button type="button" className="hover:text-[var(--fg)] hover:underline" onClick={() => switchMode("code")}>
              Email me a code instead
            </button>
            {" · "}
            <button type="button" className="hover:text-[var(--fg)] hover:underline" onClick={() => switchMode("signup")}>
              Create an account
            </button>
          </p>
        </form>
      ) : (
        <form onSubmit={onSignup} className="space-y-4">
          <div>
            <label htmlFor="email-su" className="mb-1.5 block text-sm text-[var(--fog)]">
              Email
            </label>
            <Input
              id="email-su"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-[var(--line)] bg-[var(--bg-2)] text-[var(--fg)]"
            />
          </div>
          <div>
            <label htmlFor="password-su" className="mb-1.5 block text-sm text-[var(--fog)]">
              Password (8+ characters)
            </label>
            <Input
              id="password-su"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-[var(--line)] bg-[var(--bg-2)] text-[var(--fg)]"
            />
          </div>
          <Button
            type="submit"
            disabled={status === "busy"}
            className="w-full rounded-full bg-[var(--fg)] text-[var(--bg)] hover:opacity-90"
          >
            {status === "busy" ? "Working…" : "Sign up"}
          </Button>
          <p className="text-center text-sm text-[var(--fog)]">
            Already have an account?{" "}
            <button type="button" className="hover:text-[var(--fg)] hover:underline" onClick={() => switchMode("password")}>
              Sign in with password
            </button>
            {" · "}
            <button type="button" className="hover:text-[var(--fg)] hover:underline" onClick={() => switchMode("code")}>
              Use a code
            </button>
          </p>
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
