import Link from "next/link";
import { TOOLS, type Tool } from "@/data/tools";

export default function ToolGrid({ items = TOOLS }: { items?: Tool[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((t) => (
        <Link key={t.href} href={t.href} className="flex gap-4 rounded-xl border border-line bg-panel p-4 hover:border-accent">
          <span className="text-2xl" aria-hidden>
            {t.icon}
          </span>
          <div>
            <h3 className="font-semibold">{t.name}</h3>
            <p className="mt-1 text-sm text-muted">{t.blurb}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
