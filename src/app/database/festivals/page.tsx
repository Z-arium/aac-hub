import type { Metadata } from "next";
import PageTitle from "@/components/PageTitle";
import { FESTIVALS, MONTHS } from "@/data/festivals";

export const metadata: Metadata = { title: "Festival calendar" };
export const revalidate = 86400;

export default function FestivalsPage() {
  const thisMonth = new Date().getMonth() + 1;
  return (
    <>
      <PageTitle
        title="Festival calendar"
        subtitle={
          <>
            Monthly festivals from the{" "}
            <a className="underline" href="https://wiki.aa-classic.com/Festivals">
              AAClassic wiki
            </a>
            . All festivals now pay Daru Festival Coins. Exact dates are announced in the patch notes.
          </>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MONTHS.map((name, i) => {
          const items = FESTIVALS.filter((f) => f.month === i + 1);
          const current = i + 1 === thisMonth;
          return (
            <div key={name} className={`rounded-xl border bg-panel p-4 ${current ? "border-accent" : "border-line"}`}>
              <p className={`text-sm font-semibold ${current ? "text-accent" : "text-muted"}`}>
                {name}
                {current && " · this month"}
              </p>
              {items.map((f) => (
                <div key={f.name} className="mt-2">
                  <p className="font-medium">{f.name}</p>
                  <p className="text-sm text-muted">{f.location}</p>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
}
