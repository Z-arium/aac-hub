import type { Metadata } from "next";
import PageTitle from "@/components/PageTitle";
import Checklist from "./Checklist";

export const metadata: Metadata = { title: "Daily & weekly checklist" };

export default function ChecklistPage() {
  return (
    <>
      <PageTitle
        title="Daily & weekly checklist"
        subtitle="Tick things off as you go. Your list is saved in this browser and clears itself at each reset."
      />
      <Checklist />
    </>
  );
}
