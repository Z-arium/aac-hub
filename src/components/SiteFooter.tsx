export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line py-8 text-sm text-muted">
      <div className="mx-auto max-w-7xl space-y-2 px-4">
        <p>
          A fan-made site for ArcheAge Classic. Not affiliated with the AAClassic team, XLGames or Kakao Games.
        </p>
        <p>
          Game data comes from the{" "}
          <a className="underline hover:text-text" href="https://wiki.aa-classic.com/Main_Page">
            AAClassic wiki
          </a>{" "}
          and the official{" "}
          <a className="underline hover:text-text" href="https://aa-classic.com/timers">
            timers page
          </a>
          . Spot a mistake? Times are in server time (US Eastern).
        </p>
      </div>
    </footer>
  );
}
