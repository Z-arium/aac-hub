import type { Metadata } from "next";
import PageTitle from "@/components/PageTitle";
import Checklist from "./Checklist";

export const metadata: Metadata = { title: "Daily & weekly checklist" };

export default function ChecklistPage() {
  return (
    <>
      <PageTitle
        title="Daily & weekly checklist"
        subtitle="Tick things off as you go. It clears itself at the daily reset."
      />
      <Checklist />
    </>
  );
}
