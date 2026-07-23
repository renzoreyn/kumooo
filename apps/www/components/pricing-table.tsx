"use client";

import * as React from "react";
import Link from "next/link";
import { Button, FadeIn, cn } from "@kumooo/ui";
import {
  formatPriceHint,
  formatPriceLabel,
  listPlans,
  type BillingInterval,
  type Plan,
} from "@kumooo/plans";
import { site } from "@/lib/site";

function statusBadge(plan: Plan) {
  if (plan.status === "live") return "Available now";
  if (plan.status === "coming_soon") return "Coming soon";
  return "Contact us";
}

export function PricingTable() {
  const [interval, setInterval] = React.useState<BillingInterval>("monthly");
  const plans = listPlans();

  return (
    <>
      <div className="mt-10 flex justify-center">
        <div
          className="inline-flex rounded-full border border-[var(--line)] bg-[var(--bg-2)] p-1 text-sm"
          role="group"
          aria-label="Billing interval"
        >
          {(
            [
              ["monthly", "Monthly"],
              ["annual", "Annually"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setInterval(value)}
              className={cn(
                "rounded-full px-4 py-1.5 font-medium transition-colors",
                interval === value
                  ? "bg-[var(--fg)] text-[var(--bg)]"
                  : "text-[var(--fog)] hover:text-[var(--fg)]",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {interval === "annual" ? (
        <p className="mt-3 text-center text-sm text-[var(--fog)]">Annual prices shown per month, billed yearly.</p>
      ) : null}

      <div className="mt-14 grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan, i) => {
          const hint = formatPriceHint(plan, interval);
          return (
            <FadeIn key={plan.id} delay={i * 0.04}>
              <article className="flex h-full flex-col rounded-2xl border border-[var(--line)] bg-[var(--bg-2)]/80 p-6">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--mint)]">{statusBadge(plan)}</p>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[var(--fg)]">{plan.name}</h2>
                <p className="mt-1 text-3xl font-semibold tracking-[-0.03em] text-[var(--fg)]">
                  {formatPriceLabel(plan, interval)}
                </p>
                {hint ? <p className="mt-1 text-xs text-[var(--fog)]">{hint}</p> : <div className="mt-1 h-4" />}
                <p className="mt-3 text-sm leading-relaxed text-[var(--fog)]">{plan.blurb}</p>
                <ul className="mt-6 flex-1 space-y-2 text-sm leading-relaxed text-[var(--fog)]">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--mint)]" aria-hidden />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  {plan.id === "free" ? (
                    <Button asChild className="w-full rounded-full bg-[var(--fg)] text-[var(--bg)] hover:opacity-90">
                      <a href={site.app}>Open dashboard</a>
                    </Button>
                  ) : plan.id === "scale" ? (
                    <Button
                      asChild
                      variant="outline"
                      className="w-full rounded-full border-[var(--line)] bg-transparent text-[var(--fg)] hover:bg-white/5"
                    >
                      <a href={site.contact}>Talk to us</a>
                    </Button>
                  ) : (
                    <Button
                      disabled
                      variant="outline"
                      className="w-full rounded-full border-[var(--line)] text-[var(--fog)]"
                    >
                      Coming soon
                    </Button>
                  )}
                </div>
              </article>
            </FadeIn>
          );
        })}
      </div>

      <p className="mx-auto mt-14 max-w-xl text-center text-sm leading-relaxed text-[var(--fog)]">
        Prefer to self-host on your own Cloudflare account? Keep using the Deploy button and guides. Our hosting is
        optional.{" "}
        <Link href="/" className="font-medium text-[var(--fg)] underline-offset-4 hover:underline">
          Back home
        </Link>
      </p>
    </>
  );
}
