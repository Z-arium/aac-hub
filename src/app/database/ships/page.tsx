import type { Metadata } from "next";
import DataTable from "@/components/DataTable";
import PageTitle from "@/components/PageTitle";
import WikiSource from "@/components/WikiSource";
import { SHIPS } from "@/data/ships";

export const metadata: Metadata = { title: "Ships" };

export default function ShipsPage() {
  return (
    <>
      <PageTitle
        title="Ships"
        subtitle={
          <>
            Every ship on ArcheAge Classic and what it costs. Ship parts can be regraded too. From the <WikiSource page="Ships" />.
          </>
        }
      />
      <DataTable
        rows={SHIPS}
        rowKey={(s) => s.name}
        columns={[
          { header: "Ship", cell: (s) => <span className="font-medium">{s.name}</span> },
          { header: "Type", cell: (s) => <span className="text-muted">{s.type}</span> },
          { header: "Cost", cell: (s) => <span className="text-accent">{s.cost}</span> },
          { header: "How to get", cell: (s) => s.obtain },
          { header: "Features", cell: (s) => <span className="text-muted">{s.features}</span> },
        ]}
      />
    </>
  );
}
