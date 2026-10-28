import type { Metadata } from "next";
import PageTitle from "@/components/PageTitle";
import Account from "./Account";

export const metadata: Metadata = { title: "My account" };

export default function AccountPage() {
  return (
    <>
      <PageTitle title="My account" subtitle="Sign in to keep your checklist, timer alerts and builds on every device." />
      <Account />
    </>
  );
}
