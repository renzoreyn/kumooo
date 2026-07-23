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
    title: "Start empty.",
    blurb: "One page. Replace it.",
    block: "Keep the kit. Change everything else.",
  },
  blog: {
    title: "Write something.",
    blurb: "Index, posts, done.",
    block: "Latest draft sits here.",
  },
  shop: {
    title: "Show the product.",
    blurb: "Lookbook energy. Fake bag.",
    block: "Featured piece. No checkout yet.",
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
        "rounded px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide transition-colors",
        active
          ? "bg-[var(--mint)] text-[#09090b]"
          : "bg-transparent text-[var(--fog)] hover:text-[var(--fg)]",
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
    <div className="flex h-full min-h-[400px] flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg-2)] lg:min-h-[480px]">
      <div className="flex flex-wrap items-center gap-1 border-b border-[var(--line)] px-3 py-2">
        <span className="mr-2 font-mono text-[10px] tracking-[0.16em] text-[var(--mint)] uppercase">
          Preview
        </span>
        {(["blank", "blog", "shop"] as const).map((value) => (
          <Chip key={value} active={type === value} onClick={() => setType(value)}>
            {value}
          </Chip>
        ))}
        <span className="mx-1 text-[var(--line)]">|</span>
        {(["mint", "coral", "ice"] as const).map((value) => (
          <Chip key={value} active={accent === value} onClick={() => setAccent(value)}>
            {value}
          </Chip>
        ))}
        <span className="mx-1 text-[var(--line)]">|</span>
        <Chip active={motionOn} onClick={() => setMotionOn((v) => !v)}>
          motion {motionOn ? "on" : "off"}
        </Chip>
      </div>

      <div className="relative flex-1 p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${type}-${accent}-${motionOn}`}
            initial={animate ? { opacity: 0, y: 10 } : false}
            animate={{ opacity: 1, y: 0 }}
            exit={animate ? { opacity: 0, y: -6 } : undefined}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex h-full flex-col border border-[var(--line)] bg-[var(--bg)]"
            style={{ borderTopColor: accentColor }}
          >
            <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3 font-mono text-[11px]">
              <span style={{ color: accentColor }}>{type}.site</span>
              <span className="text-[var(--fog)]">home / {type === "shop" ? "bag" : "posts"}</span>
            </div>
            <div className="flex flex-1 flex-col gap-3 p-5">
              <h3 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--fg)]">{copy.title}</h3>
              <p className="max-w-sm text-sm text-[var(--fog)]">{copy.blurb}</p>
              <div
                className="mt-auto border border-[var(--line)] p-4"
                style={{ borderLeftColor: accentColor, borderLeftWidth: 2 }}
              >
                <p className="text-sm text-[var(--fog)]">{copy.block}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] px-4 py-3">
        <p className="text-xs text-[var(--fog)]">
          Theme editor teaser. <span className="text-[var(--fg)]">Not shipping yet.</span>
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={copyCreate}
          className="rounded-md border-[var(--line)] font-mono text-[11px]"
        >
          {copied ? "copied" : "copy create"}
        </Button>
      </div>
    </div>
  );
}
