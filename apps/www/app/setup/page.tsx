import type { Metadata } from "next";
import { FadeIn } from "@kumooo/ui";
import { SetupWizard } from "./setup-wizard";

export const metadata: Metadata = {
  title: "Guided setup",
  description: "Install tools, create a kumooo.js site, preview locally, deploy on Cloudflare.",
};

export default function SetupPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
      <FadeIn>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--mint)]">Setup</p>
        <h1 className="font-display mt-3 text-4xl font-bold tracking-tight text-[var(--paper)]">
          Guided installation
        </h1>
        <p className="mt-3 max-w-xl text-[var(--fog)]">
          Four steps. Check boxes if they help you. Nothing is saved on a server. This is just a path on the page.
        </p>
      </FadeIn>
      <div className="mt-12">
        <SetupWizard />
      </div>
    </main>
  );
}
