"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button, cn } from "@kumooo/ui";
import { createCommand } from "@/lib/site";

type SiteType = "blank" | "blog" | "shop";
type Accent = "mint" | "coral" | "ice";

const accents: Record<Accent, string> = {
  mint: "#6ee7b7",
  coral: "#fb7185",
  ice: "#7dd3fc",
};

const typeCopy: Record<SiteType, { title: string; blurb: string; block: string }> = {
  blank: {
    title: "Your site starts here",
    blurb: "A clean canvas. Swap this page for your own.",
    block: "Drop in sections. Keep the kit.",
  },
  blog: {
    title: "Write something true",
    blurb: "Posts, an index, and room to grow.",
    block: "Latest: Why beginners should ship ugly first",
  },
  shop: {
    title: "Lookbook, not cart chaos",
    blurb: "Product-shaped pages with a demo bag.",
    block: "Featured: Drift Parka · look only",
  },
};

function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "bg-[var(--mint)] text-[var(--ink)]"
          : "bg-white/5 text-[var(--fog)] hover:bg-white/10 hover:text-[var(--paper)]",
      )}
    >
      {children}
    </button>
  );
}

export function SitePlayground() {
  const reduce = useReducedMotion();
  const [type, setType] = React.useState<SiteType>("blank");
  const [accent, setAccent] = React.useState<Accent>("mint");
  const [motionOn, setMotionOn] = React.useState(true);
  const [copied, setCopied] = React.useState(false);

  const accentColor = accents[accent];
  const copy = typeCopy[type];
  const animate = motionOn && !reduce;

  async function copyCreate() {
    const cmd = `${createCommand} my-${type}-site`;
    try {
      await navigator.clipboard.writeText(cmd);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex h-full min-h-[420px] flex-col overflow-hidden rounded-none border-y border-[var(--line)] bg-[var(--ink-elevated)]/80 sm:rounded-2xl sm:border lg:min-h-[520px]">
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--line)] px-4 py-3">
        <span className="mr-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--mint)]">
          Preview
        </span>
        <div className="flex flex-wrap gap-1.5">
          {(["blank", "blog", "shop"] as const).map((value) => (
            <Chip key={value} active={type === value} onClick={() => setType(value)}>
              {value}
            </Chip>
          ))}
        </div>
        <div className="mx-1 h-4 w-px bg-[var(--line)]" />
        <div className="flex flex-wrap gap-1.5">
          {(["mint", "coral", "ice"] as const).map((value) => (
            <Chip key={value} active={accent === value} onClick={() => setAccent(value)}>
              {value}
            </Chip>
          ))}
        </div>
        <div className="mx-1 h-4 w-px bg-[var(--line)]" />
        <Chip active={motionOn} onClick={() => setMotionOn((v) => !v)}>
          motion {motionOn ? "on" : "off"}
        </Chip>
      </div>

      <div className="relative flex-1 p-4 sm:p-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${type}-${accent}-${motionOn}`}
            initial={animate ? { opacity: 0, y: 12 } : false}
            animate={{ opacity: 1, y: 0 }}
            exit={animate ? { opacity: 0, y: -8 } : undefined}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0b100e]"
            style={{ boxShadow: `inset 0 0 0 1px ${accentColor}22` }}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-xs">
              <span className="font-semibold" style={{ color: accentColor }}>
                {type}.site
              </span>
              <span className="text-white/40">Home · About · {type === "shop" ? "Bag" : "Posts"}</span>
            </div>
            <div className="flex flex-1 flex-col gap-4 p-5">
              <motion.h3
                className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl"
                animate={animate ? { y: [8, 0], opacity: [0, 1] } : undefined}
                transition={{ duration: 0.45 }}
              >
                {copy.title}
              </motion.h3>
              <p className="max-w-md text-sm text-white/55">{copy.blurb}</p>
              <motion.div
                className="mt-auto rounded-lg border border-white/10 bg-white/[0.03] p-4"
                style={{ borderColor: `${accentColor}33` }}
                animate={animate ? { scale: [0.98, 1], opacity: [0.6, 1] } : undefined}
                transition={{ duration: 0.4, delay: 0.08 }}
              >
                <div className="mb-2 h-1.5 w-16 rounded-full" style={{ background: accentColor }} />
                <p className="text-sm text-white/70">{copy.block}</p>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] px-4 py-3">
        <p className="text-xs text-[var(--fog)]">
          Theme editor will feel this simple. <span className="text-[var(--paper)]/80">Coming later.</span>
        </p>
        <Button variant="outline" size="sm" onClick={copyCreate} className="border-[var(--line)]">
          {copied ? "Copied" : "Copy create command"}
        </Button>
      </div>
    </div>
  );
}
