import type { Metadata } from "next";
import GuideCard from "@/components/GuideCard";
import PageTitle from "@/components/PageTitle";
import { getGuides } from "@/lib/guides";

export const metadata: Metadata = { title: "Guides" };

export default function GuidesPage() {
  const guides = getGuides();
  const categories = [...new Set(guides.map((g) => g.category))].sort();
  return (
    <>
      <PageTitle title="Guides" subtitle="Leveling, gear, gold making and more, checked against the AAClassic wiki." />
      <div className="space-y-10">
        {categories.map((c) => (
          <section key={c}>
            <h2 className="mb-3 text-lg font-semibold text-accent">{c}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {guides
                .filter((g) => g.category === c)
                .map((g) => (
                  <GuideCard key={g.slug} guide={g} />
                ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
