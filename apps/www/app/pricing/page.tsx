import { FadeIn } from "@kumooo/ui";
import { PricingTable } from "@/components/pricing-table";

export const metadata = {
  title: "Pricing",
  description: "Nimbus is free on kumooo.site. Cumulus from $7/mo. Stratus from $12/mo.",
};

export default function PricingPage() {
  return (
    <main className="px-5 pb-28 pt-16 sm:px-8 sm:pt-20">
      <div className="mx-auto max-w-5xl">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-[var(--mint)]">Pricing</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-[var(--fg)] sm:text-5xl">
            Host on kumooo. Start on Nimbus.
          </h1>
          <p className="mt-5 text-[17px] leading-relaxed text-[var(--fog)]">
            Two sites and 150 MB on Nimbus. Cumulus and Stratus stay affordable when you need a domain or a small team.
            Billing for paid plans lands next.
          </p>
        </FadeIn>
        <PricingTable />
      </div>
    </main>
  );
}
