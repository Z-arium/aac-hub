import type { Metadata } from "next";
import PageTitle from "@/components/PageTitle";
import ToolGrid from "@/components/ToolGrid";
import { DATABASE } from "@/data/tools";

export const metadata: Metadata = { title: "Database" };

export default function DatabasePage() {
  return (
    <>
      <PageTitle title="Database" subtitle="Bosses, gliders, ships, currencies and more, collected from the AAClassic wiki." />
      <ToolGrid items={DATABASE} />
    </>
  );
}
