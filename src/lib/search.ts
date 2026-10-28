export interface SearchItem {
  /** Title */
  t: string;
  /** Path on this site */
  h: string;
  /** Section shown next to the result */
  k: string;
  /** Short description */
  d?: string;
}

/** Results for a query: every word must match the title or description. Title matches rank first. */
export function searchItems(items: SearchItem[], query: string, limit = 12): SearchItem[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const scored: { item: SearchItem; score: number }[] = [];
  for (const item of items) {
    const title = item.t.toLowerCase();
    const desc = (item.d ?? "").toLowerCase();
    let score = 0;
    let all = true;
    for (const term of terms) {
      let s = 0;
      if (title === term) s += 40;
      if (title.startsWith(term)) s += 20;
      if (new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(title)) s += 10;
      if (title.includes(term)) s += 10;
      if (desc.includes(term)) s += 2;
      if (!s) all = false;
      score += s;
    }
    // Site pages and tools before wiki pages with the same score.
    if (all) scored.push({ item, score: score + (item.k === "Wiki" ? 0 : 3) });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit).map((s) => s.item);
}
