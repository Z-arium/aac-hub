import type { Metadata } from "next";
import PageTitle from "@/components/PageTitle";
import WikiSource from "@/components/WikiSource";
import NecklacePlanner from "./NecklacePlanner";

export const metadata: Metadata = { title: "Halcyona Necklace planner" };

export default function NecklacePage() {
  return (
    <>
      <PageTitle
        title="Halcyona Necklace planner"
        subtitle={
          <>
            Warrior Medals and Mana Wisps needed to go from one rank to another. Upgrade at the Proven Warrior Workbench in
            your faction base. From the <WikiSource page="Halcyona_Necklace" />.
          </>
        }
      />
      <NecklacePlanner />
    </>
  );
}
