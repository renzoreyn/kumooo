import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="grid min-h-screen place-items-center text-[var(--fog)]">Loading…</main>}>
      <LoginForm />
    </Suspense>
  );
}
