import Link from "next/link";
import type { Guide } from "@/lib/guides";

export default function GuideCard({ guide, large = false }: { guide: Guide; large?: boolean }) {
  return (
    <Link
      href={`/guides/${guide.slug}`}
      className={`group flex flex-col justify-end rounded-xl border border-line bg-gradient-to-br from-panel-2 to-panel p-5 transition hover:border-accent ${
        large ? "min-h-56" : "min-h-40"
      }`}
    >
      <span className="mb-2 w-fit rounded bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">{guide.category}</span>
      <h3 className={`font-bold group-hover:text-accent ${large ? "text-2xl" : "text-lg"}`}>{guide.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted">{guide.summary}</p>
    </Link>
  );
}
