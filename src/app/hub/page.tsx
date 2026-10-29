import type { Metadata } from "next";
import PageTitle from "@/components/PageTitle";
import MyHub from "./MyHub";

export const metadata: Metadata = { title: "My hub", description: "Your pinned tools, saved guides, timers, checklist and builds in one place." };

export default function HubPage() {
  return (
    <>
      <PageTitle title="My hub" subtitle="Your pinned tools, saved guides and wiki pages, timers, today's checklist and builds, all in one place." />
      <MyHub />
    </>
  );
}
