import type { Metadata } from "next";
import { FadeIn } from "@kumooo/ui";
import { SetupWizard } from "./setup-wizard";

export const metadata: Metadata = {
  title: "Guided setup",
  description: "Install tools, create a kumooo.js site, preview locally, deploy on Cloudflare.",
};

export default function SetupPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
      <FadeIn className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium text-[var(--mint)]">Setup</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-[var(--fg)]">Guided installation</h1>
        <p className="mt-3 text-[17px] leading-relaxed text-[var(--fog)]">
          Four steps. Check boxes if they help. Nothing is saved on a server.
        </p>
      </FadeIn>
      <div className="mt-12">
        <SetupWizard />
      </div>
    </main>
  );
}
