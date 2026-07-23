"use client";

import { useReducedMotion } from "framer-motion";

/** One soft mint beam that fills the hero. */
export function HeroAtmosphere() {
  const reduce = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className={`hero-ray-stage${reduce ? " hero-ray-stage--static" : ""}`}>
        <span className="hero-beam" />
        <div className="hero-ray-core" />
      </div>
    </div>
  );
}
