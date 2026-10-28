import type { Metadata } from "next";
import PageTitle from "@/components/PageTitle";
import TradePackCalculator from "./TradePackCalculator";

export const metadata: Metadata = { title: "Trade pack calculator" };

export default function TradePacksPage() {
  return (
    <>
      <PageTitle
        title="Trade pack calculator"
        subtitle={
          <>
            Payout is the pack&apos;s base value times its turn-in percentage (70% to 130%). Check current percentages in game
            with Shift+O. For base values, see{" "}
            <a className="underline" href="https://sermeatball.com/tools/trade-pack-prices">
              this price list
            </a>
            , which the wiki recommends.
          </>
        }
      />
      <TradePackCalculator />
    </>
  );
}
