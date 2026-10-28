import type { Metadata } from "next";
import DataTable from "@/components/DataTable";
import PageTitle from "@/components/PageTitle";
import WikiSource from "@/components/WikiSource";
import { CURRENCIES } from "@/data/currencies";

export const metadata: Metadata = { title: "Currencies" };

export default function CurrenciesPage() {
  return (
    <>
      <PageTitle
        title="Currencies"
        subtitle={
          <>
            How to earn each currency and where to spend it. From the <WikiSource page="Currencies" />.
          </>
        }
      />
      <DataTable
        rows={CURRENCIES}
        rowKey={(c) => c.name}
        columns={[
          { header: "Currency", cell: (c) => <span className="font-medium">{c.name}</span> },
          { header: "How to earn", cell: (c) => c.earn },
          { header: "Where to spend", cell: (c) => <span className="text-muted">{c.spend}</span> },
        ]}
      />
    </>
  );
}
