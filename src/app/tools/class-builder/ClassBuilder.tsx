"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CLASS_NAMES } from "@/data/classes";
import { TREE_SKILLS } from "@/data/skills";
import { SKILL_TREES } from "@/data/skillTrees";
import {
  type Build,
  type SavedBuild,
  type TreePicks,
  decodeBuild,
  encodeBuild,
  loadSavedBuilds,
  pickedIn,
  storeSavedBuilds,
} from "@/lib/builds";

const keyOf = (trees: string[]) => [...trees].sort().join("/");
const treeColor = (name: string) => SKILL_TREES.find((t) => t.name === name)?.color;

export default function ClassBuilder() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState<SavedBuild[]>([]);

  useEffect(() => setSaved(loadSavedBuilds()), []);

  const build = useMemo(() => decodeBuild(new URLSearchParams(params.toString())), [params]);
  const selected = build.trees;
  const queryString = encodeBuild(build);

  function update(next: Partial<Build>) {
    const qs = encodeBuild({ ...build, ...next });
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  function setSelected(trees: string[]) {
    update({ trees, picks: Object.fromEntries(trees.map((t) => [t, build.picks[t] ?? { active: [], passive: [] }])) });
  }

  function toggleTree(name: string) {
    if (selected.includes(name)) setSelected(selected.filter((t) => t !== name));
    else if (selected.length < 3) setSelected([...selected, name]);
  }

  function toggleSkill(tree: string, kind: keyof TreePicks, i: number) {
    const cur = build.picks[tree];
    const list = cur[kind].includes(i) ? cur[kind].filter((x) => x !== i) : [...cur[kind], i].sort((a, b) => a - b);
    update({ picks: { ...build.picks, [tree]: { ...cur, [kind]: list } } });
  }

  const className = selected.length === 3 ? CLASS_NAMES[keyOf(selected)] : null;
  const totalPicked = selected.reduce((n, t) => n + pickedIn(build.picks[t]), 0);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return Object.entries(CLASS_NAMES)
      .filter(([k, v]) => v.toLowerCase().includes(q) || k.toLowerCase().includes(q))
      .slice(0, 12);
  }, [query]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  function saveBuild() {
    const entry: SavedBuild = {
      id: `${Date.now()}`,
      name: build.name.trim() || className || selected.join(" / "),
      className: className ?? "",
      query: queryString,
      saved: Date.now(),
    };
    const next = [entry, ...saved.filter((s) => s.query !== queryString)];
    setSaved(next);
    storeSavedBuilds(next);
  }

  function removeSaved(id: string) {
    const next = saved.filter((s) => s.id !== id);
    setSaved(next);
    storeSavedBuilds(next);
  }

  const isSaved = saved.some((s) => s.query === queryString);

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-line bg-panel p-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase text-muted">Your class</p>
            <p className="text-3xl font-bold text-accent">
              {className ?? (selected.length === 3 ? "Unknown" : `Pick ${3 - selected.length} more`)}
            </p>
            <p className="text-sm text-muted">
              {selected.length ? selected.join(" · ") : "No trees picked yet"}
              {totalPicked > 0 && ` · ${totalPicked} skills and passives picked`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setSelected([])} className="rounded-lg border border-line px-3 py-2 text-sm hover:border-muted">
              Clear
            </button>
            <button
              onClick={saveBuild}
              disabled={selected.length === 0 || isSaved}
              className="rounded-lg border border-line px-3 py-2 text-sm hover:border-muted disabled:opacity-40"
            >
              {isSaved ? "Saved" : "Save build"}
            </button>
            <button
              onClick={copyLink}
              disabled={selected.length === 0}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg disabled:opacity-40"
            >
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            value={build.name}
            onChange={(e) => update({ name: e.target.value })}
            maxLength={60}
            placeholder="Build name (optional), e.g. Arena burst"
            className="w-full rounded border border-line bg-panel-2 px-3 py-2"
          />
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a class, e.g. Darkrunner"
              className="w-full rounded border border-line bg-panel-2 px-3 py-2"
            />
            {matches.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-line bg-panel-2 shadow-lg">
                {matches.map(([k, v]) => (
                  <li key={k}>
                    <button
                      onClick={() => {
                        setSelected(k.split("/"));
                        setQuery("");
                      }}
                      className="flex w-full justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-panel"
                    >
                      <span className="font-medium">{v}</span>
                      <span className="text-muted">{k.replaceAll("/", " · ")}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {totalPicked > 0 && <BuildSummary build={build} className={className} />}

      {(["Primary", "Secondary"] as const).map((kind) => (
        <section key={kind}>
          <h2 className="mb-3 text-lg font-semibold">{kind} trees</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SKILL_TREES.filter((t) => t.kind === kind).map((t) => {
              const on = selected.includes(t.name);
              const disabled = !on && selected.length >= 3;
              return (
                <button
                  key={t.name}
                  onClick={() => toggleTree(t.name)}
                  disabled={disabled}
                  className={`flex flex-col rounded-xl border bg-panel p-4 text-left transition disabled:opacity-40 ${
                    on ? "border-accent bg-accent/5" : "border-line hover:border-muted"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ background: t.color }} />
                    <h3 className="font-semibold">{t.name}</h3>
                    {on && <span className="ml-auto text-xs text-accent">Picked</span>}
                  </div>
                  <p className="mt-1 text-sm text-muted">{t.summary}</p>
                </button>
              );
            })}
          </div>
        </section>
      ))}

      {selected.map((tree) => (
        <TreeSkills key={tree} tree={tree} picks={build.picks[tree]} onToggle={(kind, i) => toggleSkill(tree, kind, i)} />
      ))}

      <section>
        <h2 className="mb-3 text-lg font-semibold">Saved builds</h2>
        {saved.length === 0 ? (
          <p className="text-sm text-muted">
            Builds you save are kept in this browser. Use Copy link to share one or open it on another device.
          </p>
        ) : (
          <ul className="divide-y divide-line rounded-xl border border-line bg-panel">
            {saved.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <button
                  onClick={() => router.replace(`${pathname}?${s.query}`, { scroll: false })}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className="font-medium hover:text-accent">{s.name}</span>
                  <span className="block text-sm text-muted">
                    {[s.className, new URLSearchParams(s.query).get("trees")?.replaceAll(",", " · ")]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </button>
                <span className="text-xs text-muted">{new Date(s.saved).toLocaleDateString()}</span>
                <button onClick={() => removeSaved(s.id)} className="text-sm text-muted hover:text-red-400">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function BuildSummary({ build, className }: { build: Build; className: string | null }) {
  return (
    <section className="rounded-xl border border-line bg-panel p-5">
      <h2 className="text-lg font-semibold">{build.name.trim() || className || "Build summary"}</h2>
      {build.name.trim() && className && <p className="text-sm text-muted">{className}</p>}
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {build.trees.map((tree) => {
          const p = build.picks[tree];
          const skills = TREE_SKILLS[tree];
          return (
            <div key={tree}>
              <h3 className="flex items-center gap-2 font-semibold">
                <span className="h-3 w-3 rounded-full" style={{ background: treeColor(tree) }} />
                {tree}
                <span className="text-sm font-normal text-muted">({pickedIn(p)})</span>
              </h3>
              {pickedIn(p) === 0 ? (
                <p className="mt-1 text-sm text-muted">Nothing picked</p>
              ) : (
                <ul className="mt-1 space-y-0.5 text-sm">
                  {p.active.map((i) => (
                    <li key={`a${i}`}>{skills.active[i].name}</li>
                  ))}
                  {p.passive.map((i) => (
                    <li key={`p${i}`} className="text-muted">
                      {skills.passive[i].name} <span className="text-xs">(passive)</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function TreeSkills({
  tree,
  picks,
  onToggle,
}: {
  tree: string;
  picks: TreePicks;
  onToggle: (kind: keyof TreePicks, i: number) => void;
}) {
  const skills = TREE_SKILLS[tree];
  if (!skills) return null;
  const picked = pickedIn(picks);
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
        <span className="h-3 w-3 rounded-full" style={{ background: treeColor(tree) }} />
        {tree} skills
        <a href={`https://wiki.aa-classic.com/${tree}`} className="ml-auto text-sm font-normal text-muted underline">
          Wiki
        </a>
      </h2>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {skills.active.map((s, i) => (
          <SkillButton
            key={s.name}
            on={picks.active.includes(i)}
            badge={`Lv ${s.level}`}
            name={s.name}
            description={s.description}
            onClick={() => onToggle("active", i)}
          />
        ))}
      </div>
      <h3 className="mb-2 mt-4 text-sm font-semibold uppercase text-muted">Passives</h3>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {skills.passive.map((s, i) => {
          const on = picks.passive.includes(i);
          const short = on && picked - 1 < s.points;
          return (
            <SkillButton
              key={s.name}
              on={on}
              badge={`${s.points} pts`}
              name={s.name}
              description={s.description}
              warning={short ? `Needs ${s.points} points spent in ${tree}` : undefined}
              onClick={() => onToggle("passive", i)}
            />
          );
        })}
      </div>
    </section>
  );
}

function SkillButton(props: {
  on: boolean;
  badge: string;
  name: string;
  description: string;
  warning?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={props.onClick}
      aria-pressed={props.on}
      className={`flex flex-col rounded-lg border bg-panel p-3 text-left transition ${
        props.on ? "border-accent bg-accent/5" : "border-line hover:border-muted"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="font-medium">{props.name}</span>
        <span className="ml-auto shrink-0 rounded bg-panel-2 px-1.5 py-0.5 text-xs text-muted">{props.badge}</span>
      </div>
      <p className="mt-1 line-clamp-3 text-xs text-muted" title={props.description}>
        {props.description}
      </p>
      {props.warning && <p className="mt-1 text-xs text-amber-400">{props.warning}</p>}
    </button>
  );
}
