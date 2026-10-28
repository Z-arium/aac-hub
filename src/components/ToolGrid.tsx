import Link from "next/link";
import { TOOLS, type Tool } from "@/data/tools";

export default function ToolGrid({ items = TOOLS }: { items?: Tool[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className="group flex items-start gap-4 rounded-xl border border-line bg-panel p-4 transition hover:-translate-y-0.5 hover:border-accent/60"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-panel-2 text-xl" aria-hidden>
            {t.icon}
          </span>
          <div className="min-w-0">
            <h3 className="font-semibold group-hover:text-accent">{t.name}</h3>
            <p className="mt-1 text-sm text-muted">{t.blurb}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
