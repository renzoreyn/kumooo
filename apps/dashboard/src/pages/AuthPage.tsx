import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../api";
import { useAuth } from "../App";

export function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const nav = useNavigate();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "signup") await api.signup({ email, password, name });
      else await api.login({ email, password });
      await refresh();
      nav("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "That didn't work.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: 420, margin: "4rem auto", padding: "0 1.25rem" }}
    >
      <h1 style={{ letterSpacing: "-0.03em" }}>{mode === "signup" ? "Create account" : "Sign in"}</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        {mode === "signup"
          ? "One account. As many sites as you want."
          : "Welcome back. Let's publish something."}
      </p>
      {error ? <div className="error">{error}</div> : null}
      <form className="card" onSubmit={submit}>
        {mode === "signup" ? (
          <div className="field">
            <label className="label" htmlFor="name">Name</label>
            <input className="input" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
        ) : null}
        <div className="field">
          <label className="label" htmlFor="email">Email</label>
          <input className="input" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label className="label" htmlFor="password">Password</label>
          <input className="input" id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={10} />
        </div>
        <button className="btn primary" type="submit" disabled={busy}>
          {busy ? "Working…" : mode === "signup" ? "Create account" : "Sign in"}
        </button>
      </form>
      <p className="muted" style={{ marginTop: "1rem" }}>
        {mode === "signup" ? (
          <>Already have an account? <Link to="/login">Sign in</Link></>
        ) : (
          <>New here? <Link to="/signup">Create account</Link></>
        )}
      </p>
    </motion.div>
  );
}
