import Link from "next/link";
import type { WikiPageMeta } from "@/lib/wiki";

export default function WikiPageCard({ page }: { page: WikiPageMeta }) {
  return (
    <Link href={`/wiki/${page.slug}`} className="group block rounded-lg border border-line bg-panel p-4 transition hover:border-accent">
      <h3 className="font-semibold group-hover:text-accent">{page.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted">{page.summary}</p>
    </Link>
  );
}
