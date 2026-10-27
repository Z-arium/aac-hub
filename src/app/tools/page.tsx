import type { Metadata } from "next";
import PageTitle from "@/components/PageTitle";
import ToolGrid from "@/components/ToolGrid";

export const metadata: Metadata = { title: "Tools" };

export default function ToolsPage() {
  return (
    <>
      <PageTitle title="Tools" subtitle="Calculators, trackers and timers for ArcheAge Classic." />
      <ToolGrid />
    </>
  );
}
