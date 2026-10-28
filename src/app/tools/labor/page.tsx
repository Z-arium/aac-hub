import type { Metadata } from "next";
import PageTitle from "@/components/PageTitle";
import LaborCalculator from "./LaborCalculator";

export const metadata: Metadata = { title: "Labor calculator" };

export default function LaborPage() {
  return (
    <>
      <PageTitle
        title="Labor calculator"
        subtitle={
          <>
            On ArcheAge Classic you regain 40 labor every 5 minutes, online or offline (
            <a className="underline" href="https://wiki.aa-classic.com/Custom_Server_Changes">
              wiki
            </a>
            ). Enter your current labor to see when you will be capped.
          </>
        }
      />
      <LaborCalculator />
    </>
  );
}
