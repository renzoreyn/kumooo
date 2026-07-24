export function DemoBanner({ starter }: { starter: "blank" | "blog" | "shop" }) {
  return (
    <div className="relative z-20 border-b border-white/10 bg-[#0a0a0a] px-4 py-2 text-center text-xs text-white/55">
      Live <span className="text-[#6ee7b7]">{starter}</span> starter demo ·{" "}
      <a href="https://kumooo.dev" className="text-white/80 underline-offset-2 hover:underline">
        kumooo.js
      </a>
      {" · "}
      <a
        href="https://docs.kumooo.dev/docs/setup"
        className="text-white/80 underline-offset-2 hover:underline"
      >
        make your own
      </a>
    </div>
  );
}
