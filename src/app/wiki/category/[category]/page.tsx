import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageTitle from "@/components/PageTitle";
import { getWikiCategories } from "@/lib/wiki";
import WikiPageCard from "../../WikiPageCard";

export function generateStaticParams() {
  return getWikiCategories().map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  return { title: `${getWikiCategories().find((c) => c.slug === category)?.name ?? "Category"} · Wiki` };
}

export default async function WikiCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const c = getWikiCategories().find((x) => x.slug === category);
  if (!c) notFound();
  return (
    <>
      <Link href="/wiki" className="text-sm text-accent-2 hover:underline">
        ← Wiki
      </Link>
      <div className="mt-4">
        <PageTitle title={c.name} subtitle={`${c.pages.length} pages`} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {c.pages.map((p) => (
          <WikiPageCard key={p.slug} page={p} />
        ))}
      </div>
    </>
  );
}
