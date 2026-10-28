# AA Classic Hub

An all-in-one site for [ArcheAge Classic](https://aa-classic.com), in the spirit of garmoth.com: featured guides up top, the newest videos, live boss and event timers with alerts, and calculators.

## What's in it

| Section | Path | Notes |
| --- | --- | --- |
| Home | `/` | Featured guides, upcoming timers, latest videos, tools |
| Guides | `/guides` | Markdown files in `content/guides` |
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
