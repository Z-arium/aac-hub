# Roadmap to 1.0

This is the plan for what AA Classic Hub needs before it launches to the public as 1.0. It is also shown on the site at /roadmap, so tick items off here (`- [x]`) in the same change that ships them. Each `## 0.x` heading is a version; the site's version is the last one with every item ticked, and its "Released" line is the changelog date.

Items marked **(must-have)** are Jacob's 1.0 requirements. Items marked **(suggested)** are extras we think belong in 1.0 for parity with garmoth.com; any of them can move to after launch.

## 0.1: The hub goes live

Released 2026-10-28.

- [x] Home page with featured guides, upcoming timers and tools
- [x] Live timers for world bosses and events, with browser alerts
- [x] Calculators: regrade (with Resplendent scrolls), labor, trade packs, Halcyona necklace planner
- [x] Database pages: world bosses, festivals, gliders, ships, currencies, races
- [x] First guides: leveling, gearing, regrading, trade packs, fishing, taming, larceny and more
- [x] Full mirror of the AAClassic wiki: every page, redirect and image, searchable, refreshed weekly
- [x] Hosting on GitHub Pages, deployed on every change

## 0.2: Daily tools and shareable builds

Released 2026-10-28.

- [x] **(must-have)** Class builder: pick skill trees, skills and passives, and share any build as a link
- [x] Copy-link button, a readable build summary and a saved builds list
- [x] Daily and weekly checklist rebuilt, with a "perfect day" route and a step-by-step guide for every task
- [x] Crimson and Grimgast Rift countdowns on the in-game clock
- [x] Videos page: hand-picked community picks and auto-refreshed ArcheAge Classic uploads
- [x] **(must-have)** Beginner's money guide: ranked gold methods and the best life skill to level
- [x] Guide to earning Vocation Badges and Honor Points, ranked by source
- [x] Design pass: mobile menu, active nav, home intro, footer links, card styles
- [x] Site-wide search (Ctrl+K or /) across pages, tools, guides, timers and wiki titles
- [x] Broken links, mobile layout and page speed pass

## 0.3: Accounts and My hub

Released 2026-10-29.

- [x] Backend set up: Supabase for sign-in and saved data
- [x] **(must-have)** Sign in with an emailed link
- [x] **(must-have)** Profile with display name, server and main character
- [x] **(must-have)** Checklist progress, timer alert settings and saved builds sync to the account, with a one-time import on first sign-in
- [x] **(must-have)** "My hub" page: pinned tools, saved guides and wiki pages, your upcoming timers, today's checklist and saved builds
- [x] Save button on guides and wiki pages
- [x] Account settings: download my data and delete my account
- [x] Privacy page

## 0.4: Builds gallery

- [ ] **(must-have)** Sign in with Discord
- [ ] **(must-have)** Save builds to the account, name them, mark them public or private
- [ ] **(must-have)** Public builds gallery: filter by class, role and PvE or PvP; sort by newest and most liked
- [ ] Likes, a short author's note per build, and a report button

## 0.5: Guides

- [ ] **(must-have)** New-player start guide
- [ ] **(must-have)** A guide for each class role
- [ ] **(must-have)** Housing and farming guide
- [ ] **(must-have)** PvP and siege basics
- [ ] **(must-have)** Crafting and proficiency guide
- [ ] "Last verified for patch" tags, and links to related wiki pages and tools on every guide
- [ ] **(suggested)** Community-submitted guides, approved by an admin before they go live

## 0.6: Market tool (beta)

ArcheAge Classic has no public auction house feed, so prices come from players reporting what they see.

- [ ] **(must-have)** Item list from the wiki mirror: materials, trade pack ingredients, regrade scrolls, popular gear
- [ ] **(must-have)** Signed-in players report prices; each item shows the latest price, a recent median and a price history chart
- [ ] Outlier filtering, a daily report limit per player, and an admin view to remove bad reports
- [ ] Watchlist on "My hub" for the items you care about
- [ ] Clearly labelled "Beta" with a feedback link

## 0.7: Prices everywhere

- [ ] Calculators fill in their costs from reported prices
- [ ] Live auction house prices for gold methods (gold per labor worked out from real prices)
- [ ] **(suggested)** Profit calculators: crafting cost against market price, and gathering per labor

## 0.8: Item database and alerts

- [ ] **(suggested)** Item and gear database: search, stats, where it drops or how it is made
- [ ] **(suggested)** Gear section on a build, using the item database
- [ ] **(suggested)** Timer alerts that work with the tab closed, and Discord alerts for guilds
- [ ] **(suggested)** Installable as an app on phones
- [ ] **(suggested)** Patch notes page linked to the guides and data each patch changed

## 0.9: Ready for the public

- [ ] Email service for sign-in emails, so anyone can sign up (Supabase's built-in mailer only sends to the site owner) and emails can carry a sign-in code
- [ ] Terms of use
- [ ] **(suggested)** SEO: page descriptions, share previews, sitemap
- [ ] **(suggested)** Privacy-friendly visitor stats
- [ ] **(suggested)** Feedback page and a "report a mistake" link on every data page
- [ ] **(suggested)** Error monitoring

## 0.99: Final checks

- [x] Daily reset time set to 12 AM UTC (Jacob's call; still worth a final in-game check)
- [x] Video source decided: community picks added through a GitHub form, and recent uploads from creator channels every 6 hours (plus a YouTube-wide search once an API key is added)
- [ ] Find the regrade break and downgrade odds above Celestial (players enter them for now)
- [ ] Re-run the wiki import and spot-check boss and event times against the official timers page
- [ ] Check the rift countdowns against the in-game clock (anchored to one reading on 2026-10-28)
- [ ] Check in game the checklist dailies marked "not confirmed" in the Gilda Stars guide: Farmhouse quests; Tradesman's, Apothecary's and Armorer's Manor quests; Workstation cooking quests; the "50K proficiency" Gilda quests; the login reward path; the Ahnimar "watering the Darus" daily (not found in game on 2026-10-28, so it's off the checklist until confirmed)
- [ ] Final pass for broken links, mobile layout and page speed
- [ ] Move Supabase to a plan that doesn't pause, if traffic needs it

## 1.0: Public launch

- [ ] Custom domain live, with sign-in redirects updated
- [ ] Announce on the ArcheAge Classic Discord and Reddit
- [ ] Watch feedback closely for the first week

## Notes

- **Backend:** the site stays a static export on GitHub Pages and talks to Supabase (Postgres, sign-in, row-level security) from the browser. The "Supabase setup" GitHub Action runs database migrations from `supabase/migrations` and applies sign-in settings; "Supabase diagnose" prints sign-in health for debugging.
- **Cost:** Supabase's free tier pauses a project after a week with no activity; the Pro plan is about $25 a month.
- **Discord sign-in** needs a Discord application with the redirect `https://dtbkmcesdiwueqhpsyzh.supabase.co/auth/v1/callback`, and the repository secrets `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET`.
