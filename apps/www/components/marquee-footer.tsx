"use client";

const LINE = "made with kumooo.js · next.js · cloudflare · still no babysitting";

export function MarqueeFooter() {
  return (
    <div className="overflow-hidden border-t border-[var(--line)] bg-[var(--bg)] py-4">
      <div className="marquee-track" aria-hidden>
        <p className="marquee-chunk">{LINE}</p>
        <p className="marquee-chunk">{LINE}</p>
      </div>
      <p className="sr-only">{LINE}</p>
    </div>
  );
}
