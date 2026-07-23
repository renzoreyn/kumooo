"use client";

import * as React from "react";
import { Button, CodeBlock, cn } from "@kumooo/ui";
import { DeployButton } from "@/components/deploy-button";
import { createCommand } from "@/lib/site";

const steps = [
  { id: "tools", label: "Tools" },
  { id: "create", label: "Create" },
  { id: "preview", label: "Preview" },
  { id: "deploy", label: "Deploy" },
] as const;

type StepId = (typeof steps)[number]["id"];

export function SetupWizard() {
  const [step, setStep] = React.useState<StepId>("tools");
  const [checks, setChecks] = React.useState({ node: false, editor: false, created: false });
  const index = steps.findIndex((s) => s.id === step);

  return (
    <div className="mx-auto max-w-2xl">
      <ol className="mb-10 flex flex-wrap gap-2">
        {steps.map((item, i) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setStep(item.id)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                item.id === step
                  ? "bg-[var(--fg)] text-white"
                  : i < index
                    ? "bg-[var(--mint-soft)] text-[var(--mint-dim)]"
                    : "bg-white text-[var(--fog)] ring-1 ring-[var(--line)]",
              )}
            >
              {i + 1}. {item.label}
            </button>
          </li>
        ))}
      </ol>

      {step === "tools" ? (
        <section className="space-y-5 rounded-3xl border border-[var(--line)] bg-white p-7 shadow-sm">
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--fg)]">Install the basics</h2>
          <p className="leading-relaxed text-[var(--fog)]">
            You need Node, a package manager, and a place to edit files. About fifteen minutes the first time.
          </p>
          <ul className="space-y-3 text-sm leading-relaxed text-[var(--fog)]">
            <li>
              <a className="font-medium text-[var(--mint-dim)] underline" href="https://nodejs.org" rel="noreferrer" target="_blank">
                Node.js LTS
              </a>{" "}
              (after install, run <code className="rounded bg-[var(--bg)] px-1.5 py-0.5 font-mono text-[var(--fg)]">node -v</code>)
            </li>
            <li>
              Package manager: npm ships with Node. Or install{" "}
              <a className="font-medium text-[var(--mint-dim)] underline" href="https://pnpm.io" rel="noreferrer" target="_blank">
                pnpm
              </a>
              .
            </li>
            <li>
              Editor:{" "}
              <a className="font-medium text-[var(--mint-dim)] underline" href="https://cursor.com" rel="noreferrer" target="_blank">
                Cursor
              </a>{" "}
              or{" "}
              <a
                className="font-medium text-[var(--mint-dim)] underline"
                href="https://code.visualstudio.com"
                rel="noreferrer"
                target="_blank"
              >
                VS Code
              </a>
              .
            </li>
          </ul>
          <label className="flex items-center gap-2 text-sm text-[var(--fg)]">
            <input
              type="checkbox"
              checked={checks.node}
              onChange={(e) => setChecks((c) => ({ ...c, node: e.target.checked }))}
            />
            I installed Node and can run node -v
          </label>
          <label className="flex items-center gap-2 text-sm text-[var(--fg)]">
            <input
              type="checkbox"
              checked={checks.editor}
              onChange={(e) => setChecks((c) => ({ ...c, editor: e.target.checked }))}
            />
            I have a code editor
          </label>
          <Button className="rounded-full bg-[var(--fg)] text-white hover:bg-black" onClick={() => setStep("create")}>
            Next: Create
          </Button>
        </section>
      ) : null}

      {step === "create" ? (
        <section className="space-y-5 rounded-3xl border border-[var(--line)] bg-white p-7 shadow-sm">
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--fg)]">Create your site</h2>
          <p className="leading-relaxed text-[var(--fog)]">
            Run this in a terminal, or skip ahead and deploy with one click.
          </p>
          <CodeBlock language="bash" code={`${createCommand}\n# pick blank, blog, or shop`} />
          <DeployButton />
          <label className="flex items-center gap-2 text-sm text-[var(--fg)]">
            <input
              type="checkbox"
              checked={checks.created}
              onChange={(e) => setChecks((c) => ({ ...c, created: e.target.checked }))}
            />
            I created a project (or I will deploy instead)
          </label>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="rounded-full border-[var(--line)] text-[var(--fg)]"
              onClick={() => setStep("tools")}
            >
              Back
            </Button>
            <Button className="rounded-full bg-[var(--fg)] text-white hover:bg-black" onClick={() => setStep("preview")}>
              Next: Preview
            </Button>
          </div>
        </section>
      ) : null}

      {step === "preview" ? (
        <section className="space-y-5 rounded-3xl border border-[var(--line)] bg-white p-7 shadow-sm">
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--fg)]">See it on your machine</h2>
          <p className="leading-relaxed text-[var(--fog)]">
            Go into the folder create-kumooo made, install if needed, then start the dev server.
          </p>
          <CodeBlock language="bash" code={`cd my-site\npnpm install\npnpm dev`} />
          <p className="text-sm text-[var(--fog)]">
            Open{" "}
            <a className="font-medium text-[var(--mint-dim)] underline" href="http://localhost:3000" rel="noreferrer" target="_blank">
              http://localhost:3000
            </a>
            . Edit a file, save, watch it update.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="rounded-full border-[var(--line)] text-[var(--fg)]"
              onClick={() => setStep("create")}
            >
              Back
            </Button>
            <Button className="rounded-full bg-[var(--fg)] text-white hover:bg-black" onClick={() => setStep("deploy")}>
              Next: Deploy
            </Button>
          </div>
        </section>
      ) : null}

      {step === "deploy" ? (
        <section className="space-y-5 rounded-3xl border border-[var(--line)] bg-white p-7 shadow-sm">
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--fg)]">Put it on the internet</h2>
          <p className="leading-relaxed text-[var(--fog)]">
            Cloudflare Workers runs Next.js via OpenNext. Click Deploy, sign in or register on their site, and follow
            the prompts. You get a workers.dev URL.
          </p>
          <DeployButton size="lg" />
          <Button
            variant="outline"
            className="rounded-full border-[var(--line)] text-[var(--fg)]"
            onClick={() => setStep("preview")}
          >
            Back
          </Button>
        </section>
      ) : null}
    </div>
  );
}
