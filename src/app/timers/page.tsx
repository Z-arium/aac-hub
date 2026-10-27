import type { Metadata } from "next";
import PageTitle from "@/components/PageTitle";
import TimerBoard from "./TimerBoard";

export const metadata: Metadata = { title: "Boss & event timers" };

export default function TimersPage() {
  return (
    <>
      <PageTitle
        title="Boss & event timers"
        subtitle={
          <>
            Live countdowns in your local time. Turn on alerts to get a browser notification before an event starts.
            Times come from the official{" "}
            <a href="https://aa-classic.com/timers" className="underline">
              AAClassic timers
            </a>{" "}
            and are still being checked in game.
          </>
        }
      />
      <TimerBoard />
    </>
  );
}
