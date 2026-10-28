import type { Metadata } from "next";
import PageTitle from "@/components/PageTitle";
import WikiSource from "@/components/WikiSource";
import { RACES } from "@/data/races";

export const metadata: Metadata = { title: "Races" };

export default function RacesPage() {
  return (
    <>
      <PageTitle
        title="Races"
        subtitle={
          <>
            Racial skills are instant cast. Classic swaps some racial skills between races for balance. From the{" "}
            <WikiSource page="Races" />.
          </>
        }
      />
      <div className="space-y-10">
        {(["Nuia", "Haranya"] as const).map((f) => (
          <section key={f}>
            <h2 className="mb-3 text-xl font-bold text-accent">{f === "Nuia" ? "Nuian Alliance (west)" : "Haranyan Alliance (east)"}</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {RACES.filter((r) => r.faction === f).map((r) => (
                <div key={r.name} className="rounded-xl border border-line bg-panel p-4">
                  <h3 className="text-lg font-semibold">{r.name}</h3>
                  <ul className="mt-2 space-y-3">
                    {r.skills.map((s) => (
                      <li key={s.name}>
                        <p className="text-sm font-medium">
                          {s.name} <span className="text-xs text-muted">· {s.cooldown}</span>
                        </p>
                        <p className="text-sm text-muted">{s.effect}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
