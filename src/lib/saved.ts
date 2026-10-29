"use client";

import { useSynced } from "./sync";

// Pages a player saved for "My hub": guides and wiki articles (star button)
// and pinned tools. Synced to the account like everything under "aac-".

export interface SavedPage {
  href: string;
  title: string;
  kind: "guide" | "wiki";
}

export const SAVED_PAGES_KEY = "aac-saved-pages";
export const PINNED_TOOLS_KEY = "aac-pinned-tools";
export const DEFAULT_PINNED_TOOLS = ["/tools/checklist", "/timers", "/tools/class-builder", "/tools/regrade"];

export function useSavedPages() {
  const [stored, setStored] = useSynced<SavedPage[]>(SAVED_PAGES_KEY, []);
  const pages = Array.isArray(stored) ? stored : [];
  const isSaved = (href: string) => pages.some((p) => p.href === href);
  const toggle = (page: SavedPage) =>
    setStored(isSaved(page.href) ? pages.filter((p) => p.href !== page.href) : [page, ...pages]);
  return { pages, isSaved, toggle };
}
