import type { Metadata } from "next";
import PageTitle from "@/components/PageTitle";
import Checklist from "./Checklist";

export const metadata: Metadata = { title: "Daily & weekly checklist" };

export default function ChecklistPage() {
  return (
    <>
      <PageTitle
        title="Daily & weekly checklist"
        subtitle="Your main dailies on top, extras by category below. Press Customize to choose what you see. Clears itself at each reset and saves to your account when signed in."
      />
      <Checklist />
    </>
  );
}
