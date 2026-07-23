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
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                item.id === step
                  ? "bg-[var(--mint)] text-[var(--ink)]"
                  : i < index
                    ? "bg-white/10 text-[var(--paper)]"
                    : "bg-white/5 text-[var(--fog)]",
              )}
            >
              {i + 1}. {item.label}
            </button>
          </li>
        ))}
      </ol>

      {step === "tools" ? (
        <section className="space-y-5">
          <h2 className="font-display text-2xl font-bold text-[var(--paper)]">Install the basics</h2>
          <p className="text-[var(--fog)]">
            You need Node (the engine), a package manager, and a place to edit files. Takes about fifteen minutes the
            first time.
          </p>
          <ul className="space-y-3 text-sm text-[var(--fog)]">
            <li>
              <a className="text-[var(--mint)] underline" href="https://nodejs.org" rel="noreferrer" target="_blank">
                Node.js LTS
              </a>{" "}
              {" "}
              (after install, open a terminal and run <code className="text-[var(--mint)]">node -v</code>)
            </li>
            <li>
              Package manager: npm ships with Node. Or install{" "}
              <a className="text-[var(--mint)] underline" href="https://pnpm.io" rel="noreferrer" target="_blank">
                pnpm
              </a>
              .
            </li>
            <li>
              Editor:{" "}
              <a className="text-[var(--mint)] underline" href="https://cursor.com" rel="noreferrer" target="_blank">
                Cursor
              </a>{" "}
              or{" "}
              <a
                className="text-[var(--mint)] underline"
                href="https://code.visualstudio.com"
                rel="noreferrer"
                target="_blank"
              >
                VS Code
              </a>
              .
            </li>
          </ul>
          <label className="flex items-center gap-2 text-sm text-[var(--paper)]">
            <input
              type="checkbox"
              checked={checks.node}
              onChange={(e) => setChecks((c) => ({ ...c, node: e.target.checked }))}
            />
            I installed Node and can run <code className="text-[var(--mint)]">node -v</code>
          </label>
          <label className="flex items-center gap-2 text-sm text-[var(--paper)]">
            <input
              type="checkbox"
              checked={checks.editor}
              onChange={(e) => setChecks((c) => ({ ...c, editor: e.target.checked }))}
            />
            I have a code editor
          </label>
          <Button className="bg-[var(--mint)] text-[var(--ink)]" onClick={() => setStep("create")}>
            Next: Create
          </Button>
        </section>
      ) : null}

      {step === "create" ? (
        <section className="space-y-5">
          <h2 className="font-display text-2xl font-bold text-[var(--paper)]">Create your site</h2>
          <p className="text-[var(--fog)]">
            In a terminal, run this. It scaffolds a Next.js app with the kumooo.js kit. Or skip ahead and deploy with
            one click.
          </p>
          <CodeBlock language="bash" code={`${createCommand}\n# pick blank, blog, or shop`} />
          <DeployButton />
          <label className="flex items-center gap-2 text-sm text-[var(--paper)]">
            <input
              type="checkbox"
              checked={checks.created}
              onChange={(e) => setChecks((c) => ({ ...c, created: e.target.checked }))}
            />
            I created a project (or I&apos;ll deploy instead)
          </label>
          <div className="flex gap-3">
            <Button variant="outline" className="border-[var(--line)]" onClick={() => setStep("tools")}>
              Back
            </Button>
            <Button className="bg-[var(--mint)] text-[var(--ink)]" onClick={() => setStep("preview")}>
              Next: Preview
            </Button>
          </div>
        </section>
      ) : null}

      {step === "preview" ? (
        <section className="space-y-5">
          <h2 className="font-display text-2xl font-bold text-[var(--paper)]">See it on your machine</h2>
          <p className="text-[var(--fog)]">
            Go into the folder create-kumooo made, install if needed, then start the dev server.
          </p>
          <CodeBlock language="bash" code={`cd my-site\npnpm install\npnpm dev`} />
          <p className="text-sm text-[var(--fog)]">
            Open{" "}
            <a className="text-[var(--mint)] underline" href="http://localhost:3000" rel="noreferrer" target="_blank">
              http://localhost:3000
            </a>
            . Edit a file, save, watch it update.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="border-[var(--line)]" onClick={() => setStep("create")}>
              Back
            </Button>
            <Button className="bg-[var(--mint)] text-[var(--ink)]" onClick={() => setStep("deploy")}>
              Next: Deploy
            </Button>
          </div>
        </section>
      ) : null}

      {step === "deploy" ? (
        <section className="space-y-5">
          <h2 className="font-display text-2xl font-bold text-[var(--paper)]">Put it on the internet</h2>
          <p className="text-[var(--fog)]">
            Cloudflare Workers runs Next.js via OpenNext. Click Deploy, sign in or register on their site, and
            follow the prompts. They&apos;ll give you a workers.dev URL (custom domain later).
          </p>
          <DeployButton size="lg" />
          <p className="text-sm text-[var(--fog)]">
            Prefer CLI after create-kumooo? We&apos;ll keep expanding CF deploy docs. For now Guided setup plus the
            Deploy button is the happy path.
          </p>
          <Button variant="outline" className="border-[var(--line)]" onClick={() => setStep("preview")}>
            Back
          </Button>
        </section>
      ) : null}
    </div>
  );
}
