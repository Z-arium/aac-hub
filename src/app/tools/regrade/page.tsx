import type { Metadata } from "next";
import PageTitle from "@/components/PageTitle";
import RegradeCalculator from "./RegradeCalculator";

export const metadata: Metadata = { title: "Regrade calculator" };

export default function RegradePage() {
  return (
    <>
      <PageTitle
        title="Regrade calculator"
        subtitle={
          <>
            Success rates from the{" "}
            <a className="underline" href="https://wiki.aa-classic.com/Regrade_Rates">
              AAClassic wiki
            </a>
            . Pick your item type and grades to see the odds, expected scrolls and cost.
          </>
        }
      />
      <RegradeCalculator />
    </>
  );
}
