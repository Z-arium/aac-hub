import type { Metadata } from "next";
import Link from "next/link";
import PageTitle from "@/components/PageTitle";
import DataTable from "@/components/DataTable";
import { BOSSES, FIELD_BOSSES, TIER_INFO, type BossTier } from "@/data/bosses";

export const metadata: Metadata = { title: "World bosses" };

const TIERS: BossTier[] = ["Major", "Normal", "Minor"];

export default function WorldBossesPage() {
  return (
    <>
      <PageTitle
        title="World bosses"
        subtitle={
          <>
            Every world boss on ArcheAge Classic, from the AAClassic wiki&apos;s{" "}
            <a className="underline" href="https://wiki.aa-classic.com/World_Bosses">
              World Bosses
            </a>{" "}
            and{" "}
            <a className="underline" href="https://wiki.aa-classic.com/Gilda_Star">
              Gilda Star
            </a>{" "}
            pages.
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
                  {(b.respawn || b.gilda) && (
                    <p className="mt-2 text-xs text-muted">
                      {b.respawn && <>Respawns {b.respawn} after a kill. </>}
                      {b.gilda && <>{b.gilda} Gilda Stars from the daily kill quest.</>}
                    </p>
                  )}
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
        <section>
          <h2 className="text-xl font-bold text-accent">Field bosses</h2>
          <p className="mb-3 text-sm text-muted">
            On a respawn timer. Each daily kill quest gives 1 Gilda Star (from the wiki&apos;s{" "}
            <a className="underline" href="https://wiki.aa-classic.com/Gilda_Star">
              Gilda Star
            </a>{" "}
            page).
          </p>
          <DataTable
            rows={FIELD_BOSSES}
            rowKey={(b) => b.name}
            columns={[
              { header: "Boss", cell: (b) => <span className="font-medium">{b.name}</span> },
              { header: "Location", cell: (b) => <span className="text-muted">{b.location}</span> },
              { header: "Respawn", cell: (b) => b.respawn },
            ]}
          />
        </section>
      </div>
    </>
  );
}
