import type { Metadata } from "next";
import Link from "next/link";
import PageTitle from "@/components/PageTitle";
import { BOSSES, TIER_INFO, type BossTier } from "@/data/bosses";

export const metadata: Metadata = { title: "World bosses" };

const TIERS: BossTier[] = ["Major", "Normal", "Minor"];

export default function WorldBossesPage() {
  return (
    <>
      <PageTitle
        title="World bosses"
        subtitle={
          <>
            Every world boss on ArcheAge Classic, from the{" "}
            <a className="underline" href="https://wiki.aa-classic.com/World_Bosses">
              AAClassic wiki
            </a>
            .
          </>
        }
      />
      <div className="space-y-10">
        {TIERS.map((tier) => (
          <section key={tier}>
            <h2 className="text-xl font-bold text-accent">{tier} world bosses</h2>
            <p className="mb-3 text-sm text-muted">{TIER_INFO[tier]}</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {BOSSES.filter((b) => b.tier === tier).map((b) => (
                <div key={b.name} className="rounded-xl border border-line bg-panel p-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-semibold">{b.name}</h3>
                    <span className="text-xs text-muted">Lv {b.level}</span>
                  </div>
                  <p className="text-sm text-muted">{b.location}</p>
                  {b.notes && <p className="mt-2 text-sm">{b.notes}</p>}
                  {b.scheduleId && (
                    <Link href="/timers" className="mt-2 inline-block text-xs text-accent-2 hover:underline">
                      See spawn times
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
