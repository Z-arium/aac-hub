import type { Metadata } from "next";
import Link from "next/link";
import PageTitle from "@/components/PageTitle";
import { getWikiCoverage, getWikiPages } from "@/lib/wiki";
import FileBrowser from "./FileBrowser";

export const metadata: Metadata = {
  title: "Wiki files",
  description: "Every image and file uploaded to the AAClassic wiki, mirrored and searchable.",
};

export default function WikiFilesPage() {
  const titles = Object.fromEntries(getWikiPages().map((p) => [p.slug, p.title]));
  const coverage = getWikiCoverage();
  return (
    <>
      <Link href="/wiki" className="text-sm text-accent-2 hover:underline">
        ← Wiki
      </Link>
      <div className="mt-4">
        <PageTitle
          title="Files"
          subtitle={
            <>
              Every image and file uploaded to the AAClassic wiki, mostly item, skill and buff icons
              {coverage ? `: ${coverage.files.wiki.toLocaleString()} files, all stored on this site` : ""}. Click one for
              its details and the pages that use it.
            </>
          }
        />
      </div>
      <FileBrowser titles={titles} />
    </>
  );
}
