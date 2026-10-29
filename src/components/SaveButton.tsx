"use client";

import { useSavedPages, type SavedPage } from "@/lib/saved";

/** Star toggle that adds a guide or wiki page to "My hub". */
export default function SaveButton(page: SavedPage) {
  const { isSaved, toggle } = useSavedPages();
  const saved = isSaved(page.href);
  return (
    <button
      type="button"
      onClick={() => toggle(page)}
      aria-pressed={saved}
      title={saved ? "Remove from My hub" : "Save to My hub"}
      className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1 text-sm hover:bg-panel-2 ${saved ? "border-accent/50 text-accent" : "border-line text-muted"}`}
    >
      <span aria-hidden>{saved ? "★" : "☆"}</span>
      {saved ? "Saved" : "Save"}
    </button>
  );
}
