import Link from "next/link";
import type { Guide } from "@/lib/guides";

export default function GuideCard({ guide, large = false }: { guide: Guide; large?: boolean }) {
  return (
    <Link
      href={`/guides/${guide.slug}`}
      className={`group relative flex h-full flex-col justify-end overflow-hidden rounded-xl border border-line bg-panel p-5 transition hover:-translate-y-0.5 hover:border-accent/60 ${
        large ? "min-h-64" : "min-h-40"
      }`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_0%,rgba(230,180,80,0.14),transparent_55%),linear-gradient(160deg,var(--panel-2),var(--panel))]"
      />
      <span className="relative mb-2 w-fit rounded bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">{guide.category}</span>
      <h3 className={`relative font-bold group-hover:text-accent ${large ? "text-2xl md:text-3xl" : "text-lg"}`}>{guide.title}</h3>
      <p className={`relative mt-1 text-sm text-muted ${large ? "line-clamp-3 max-w-xl" : "line-clamp-2"}`}>{guide.summary}</p>
      {guide.updated && <p className="relative mt-3 text-xs text-muted/80">Updated {guide.updated}</p>}
    </Link>
  );
}
