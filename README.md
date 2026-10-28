# AA Classic Hub

An all-in-one site for [ArcheAge Classic](https://aa-classic.com), in the spirit of garmoth.com: featured guides up top, the newest videos, live boss and event timers with alerts, and calculators.

## What's in it

| Section | Path | Notes |
| --- | --- | --- |
| Home | `/` | Featured guides, upcoming timers, latest videos, tools |
| Guides | `/guides` | Markdown files in `content/guides` |
| Wiki | `/wiki` | A complete mirror of the AAClassic wiki: every page, redirect and image, with categories and search |
| Wiki files | `/wiki/files` | Every uploaded image, searchable, with the pages that use it |
| Wiki coverage | `/wiki/coverage` | Proof the mirror matches the wiki |
| Timers | `/timers` | Live countdowns, browser alerts, per-event mute |
| Regrade calculator | `/tools/regrade` | Wiki rates, expected attempts and cost, simulator |
| Daily & weekly checklist | `/tools/checklist` | Saved in the browser, clears at reset |
| Labor calculator | `/tools/labor` | 40 labor per 5 minutes |
| Trade pack calculator | `/tools/trade-packs` | Base value × turn-in % minus materials |
| World bosses | `/database/world-bosses` | |
| Festivals | `/database/festivals` | |
| Videos | `/videos` | Refreshes hourly from YouTube |

## Running it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Videos

Set one of these in `.env.local` (see `.env.example`):

- `YOUTUBE_API_KEY`: searches YouTube for "ArcheAge Classic", newest first.
- `YOUTUBE_CHANNEL_IDS`: comma-separated channel IDs, read from their public RSS feeds. No key needed.

## Game data

Game data lives in `src/data` and comes from the [AAClassic wiki](https://wiki.aa-classic.com/Main_Page) and the official [timers page](https://aa-classic.com/timers). Event times are stored in server time (US Eastern). Entries with `verified: false` still need an in-game check.

## Wiki import

`/wiki` is a complete, cleaned-up, searchable mirror of the [AAClassic wiki](https://wiki.aa-classic.com) (CC0): every page in every namespace (articles, templates, Lua modules, user and settings pages), every redirect, and every uploaded file. Each page links back to its source.

```bash
npm run wiki:import            # only downloads pages edited since the last run
npm run wiki:import -- --force # re-download everything
```

The importer (`scripts/wiki-import`) uses the MediaWiki API, waits 750 ms between requests (`WIKI_DELAY_MS` to change it) and writes:

- `content/wiki/index.json`: every page's title, namespace, category, summary and last edit, plus redirects
- `content/wiki/pages/<slug>.json`: cleaned HTML, wikitext, headings, every table as rows of text, and the source link
- `content/wiki/files.json` and `public/wiki-files/`: every uploaded file, stored once per distinct file under its sha1 (`public/wiki-files/ab/abcd….png`) and checked against the wiki's checksum
- `public/wiki-search.json`: the text index the search box loads

`npm run wiki:coverage` asks the wiki for its full page, redirect and file lists, compares them with the mirror, re-hashes every stored file, and writes `content/wiki/coverage.json` (shown at `/wiki/coverage`). It exits with an error if anything is missing.

The wiki has no categories of its own, so `scripts/wiki-import/categories.mjs` sorts pages by title. Add a rule there when a new page lands in "General".

Tools can read wiki tables with `getWikiTables(slug)` from `src/lib/wiki.ts`.

The **Wiki import** GitHub Action runs weekly (and from the Actions tab) and opens a "Wiki refresh" pull request when anything changed. For that, turn on *Settings → Actions → General → Allow GitHub Actions to create and approve pull requests*. A push that changes the importer commits a fresh import to that branch.

## Adding a guide

Add a markdown file to `content/guides` with this header:

```md
---
title: My guide
summary: One line shown on the card.
category: Gear
featured: true
updated: 2026-10-27
sources: https://wiki.aa-classic.com/Some_Page
---
```

Featured guides show at the top of the home page, newest first.
