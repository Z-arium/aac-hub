import type { Metadata } from "next";
import DataTable from "@/components/DataTable";
import PageTitle from "@/components/PageTitle";
import WikiSource from "@/components/WikiSource";
import { GLIDERS, type Glider, type Rating } from "@/data/gliders";

export const metadata: Metadata = { title: "Gliders" };

const RATING_COLOR: Record<Rating, string> = {
  Low: "text-muted",
  Moderate: "text-text",
  High: "text-emerald-300",
  "Very High": "text-accent",
  "?": "text-muted",
};

const rating = (r: Rating) => <span className={RATING_COLOR[r]}>{r}</span>;

const GROUPS: { id: Glider["group"]; title: string; note?: string }[] = [
  { id: "Basic", title: "Basic gliders", note: "Blueprints are sold on the left side of Mirage Isle and crafted at a Machining bench." },
  { id: "Glider", title: "Gliders" },
  { id: "Coin glider", title: "Special coin gliders" },
  { id: "Magithopter", title: "Magithopters", note: "Columns are air speed, cruising, steering and ascension." },
];

export default function GlidersPage() {
  return (
    <>
      <PageTitle
        title="Gliders"
        subtitle={
          <>
            Stats are for the lowest crafted grade and go up as you upgrade. From the <WikiSource page="Gliders" />.
          </>
        }
      />
      <div className="space-y-10">
        {GROUPS.map((g) => (
          <section key={g.id}>
            <h2 className="text-xl font-bold text-accent">{g.title}</h2>
            {g.note && <p className="mb-3 text-sm text-muted">{g.note}</p>}
            <div className={g.note ? "" : "mt-3"}>
              <DataTable
                rows={GLIDERS.filter((x) => x.group === g.id)}
                rowKey={(x) => x.name}
                columns={[
                  { header: "Name", cell: (x) => <span className="font-medium">{x.name}</span> },
                  { header: "Skill", cell: (x) => x.skill },
                  { header: "How to get", cell: (x) => <span className="text-muted">{x.obtain}</span> },
                  { header: "Speed", cell: (x) => rating(x.speed) },
                  { header: "Glide", cell: (x) => rating(x.glide) },
                  { header: "Turn", cell: (x) => rating(x.turn) },
                  { header: "Launch", cell: (x) => rating(x.launch) },
                ]}
              />
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
