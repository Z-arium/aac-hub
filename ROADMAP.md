# Roadmap to 1.0

This is the plan for what AA Classic Hub needs before it launches to the public as 1.0. The site today (0.1) is live at https://z-arium.github.io/aac-hub/ as a static Next.js export on GitHub Pages.

Items marked **(must-have)** are Jacob's 1.0 requirements. Items marked **(suggested)** are additions we think belong in 1.0 for parity with garmoth.com; any of them can move to after launch.

## Where we are (0.1)

- Guides (12 markdown guides), the full AAClassic wiki mirror with search, live timers with browser alerts
- Tools: regrade calculator, daily and weekly checklist, labor, trade packs, Halcyona necklace planner, class builder
- Database: world bosses, festivals, gliders, ships, currencies, races
- Videos page is a "coming soon" placeholder until a video source is chosen
- Everything a user saves (checklist, timer mutes) lives only in their browser

## The backend decision

Accounts and the market need a server and a database, and GitHub Pages only serves static files.

**Recommendation: keep the site on GitHub Pages and add [Supabase](https://supabase.com).**

- Supabase gives us Postgres, sign-in (Discord and email), file storage and row-level security, and the browser talks to it directly, so the static export keeps working and nothing about hosting changes.
- Discord sign-in fits the ArcheAge Classic community, which already lives on Discord.
- The free tier covers launch-size traffic. One catch: free projects pause after a week with no activity, so before the public launch we either keep traffic flowing or move to the Pro plan (about $25 a month).
- Alternatives considered: Firebase does the same job but its NoSQL store is a worse fit for market price history and searching builds. Moving to Vercel only matters if we want server-side pages (for example, share previews generated per build); we can revisit that later without redoing the Supabase work.

**What Jacob needs to create** (this is the only blocker for phases 2, 4 and 5):

1. A Supabase account and one project (free tier). Then add its URL and anon key as repository secrets `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. The anon key is meant to be public; the database rules protect the data.
2. A Discord application at https://discord.com/developers/applications for "Sign in with Discord", with its client ID and secret pasted into Supabase (Authentication → Providers → Discord).
3. Optional but recommended for launch: a custom domain (for example aac-hub.com), which also makes sign-in redirects and sharing links look trustworthy.

## Phase 1: Shareable builds without accounts (unblocked, can start now)

- **(must-have)** Class builder: encode the chosen skill trees, skills and passives in the URL so any build can be shared as a link
- Copy-link button and a readable build summary on the shared page
- "Saved builds" list in the browser, which phase 2 later syncs to the account

## Phase 2: Accounts (needs Supabase)

- **(must-have)** Sign in with Discord or an email magic link; profile with display name, server and main character
- **(must-have)** Sync what is saved in the browser today (checklist progress, timer mutes and alert settings, saved builds) to the account, with a one-time import on first sign-in
- **(must-have)** "My hub" dashboard: pinned tools, favourite guides and wiki pages, tracked timers, saved builds
- Account settings: delete account and export my data
- Privacy policy and terms page (needed once we store accounts)
- Email sending for sign-in links: Supabase's built-in mailer only sends to the project's own team and a few emails an hour, so before launch we connect an email service (for example Resend, free tier) for public sign-ups

## Phase 3: Guides

- **(must-have)** Fill the gaps: a guide for each class role, a new-player start guide, housing and farming, PvP and siege basics, crafting and proficiency, a beginner's money guide per labor budget
- Guide pages get a table of contents, "last verified for patch" tags, and links to related wiki pages and tools
- Favourite and bookmark guides (with accounts)
- **(suggested)** Community-submitted guides: signed-in users draft a guide in a markdown editor, an admin approves it before it goes live

## Phase 4: Builds, create and share (needs accounts)

- **(must-have)** Save builds to the account, name them, mark them public or private
- **(must-have)** Public builds gallery: filter by class, role and PvE or PvP; sort by newest and most liked
- Likes and a short author's note per build; report button for moderation
- **(suggested)** Gear section on a build, using the item database below

## Phase 5: Market tool, beta (needs accounts)

ArcheAge Classic has no public auction house API, so unlike garmoth's market the prices have to come from players.

- **(must-have)** Item list seeded from the wiki mirror (materials, trade pack ingredients, regrade scrolls, popular gear)
- **(must-have)** Signed-in users report a price they saw at the auction house; the site shows the latest price, a median of recent reports and a price history chart
- Outlier filtering, a limit on reports per user, and an admin view to remove bad reports
- Watchlist: track the items that matter to you on "My hub"
- Hook the reported prices into the trade pack, regrade and necklace calculators so their costs fill in automatically
- Clearly labelled "Beta" with a feedback link until the data is reliable

## Phase 6: Suggested extras for 1.0

- **(suggested)** Item and gear database built from the wiki mirror: search, stats, where it drops or how it is crafted
- **(suggested)** Profit calculators: crafting cost versus market price, and farming and gathering per labor
- **(suggested)** Alerts and notifications: timer alerts that keep working with the tab closed (web push), and optional Discord webhook alerts for guilds
- **(suggested)** Mobile pass: navigation, tables and calculators checked on phone sizes; installable as an app (PWA)
- **(suggested)** SEO: page titles and descriptions, share previews (Open Graph images), sitemap and robots.txt
- **(suggested)** Privacy-friendly analytics (for example Plausible or Cloudflare Web Analytics) to see which tools people use
- **(suggested)** Feedback and contact page, plus a "report a mistake" link on every data page
- **(suggested)** Patch notes page that links each patch to the guides and data it changed
- **(suggested)** Error monitoring so broken pages are caught before players report them

## Phase 7: The 0.99 list (final checks before 1.0)

- Verify the daily reset time in game (currently assumed 12 AM UTC)
- Find the regrade break and downgrade odds above Celestial (currently entered by the user)
- Decide the video source: a YouTube API key, or a list of creator channels read from their RSS feeds
- Re-run the wiki import and spot-check boss and event times against the official timers page
- Full pass for broken links, mobile layout and page load speed
- Move Supabase to a plan that does not pause, if traffic needs it
- Connect an email service for sign-in links (see phase 2)

## 1.0 launch

- Custom domain live, sign-in redirects updated
- Announce on the ArcheAge Classic Discord and Reddit
- Feedback channel watched for the first week
