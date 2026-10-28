// Refreshes content/videos/recent.json with the newest ArcheAge Classic videos.
// Sources:
// - the RSS feeds of the channels in channels.txt and of every Community pick (no key needed)
// - with YOUTUBE_API_KEY set, a YouTube-wide search as well
// Every video goes through isClassic, and hidden.txt keeps videos out.
// Run by the "Videos" workflow on a schedule.

import {
  CHANNELS,
  HIDDEN,
  PICKS,
  RECENT,
  apiVideos,
  channelId,
  decodeEntities,
  get,
  isClassic,
  readJson,
  readList,
  writeJson,
} from "./lib.mjs";

const MAX = 48;
const QUERIES = ["ArcheAge Classic", "aa-classic", "AAClassic"];
// Search results older than this are skipped; channel feeds only hold their last 15 uploads anyway.
const SEARCH_DAYS = 120;

const key = process.env.YOUTUBE_API_KEY;

async function fromFeed(id) {
  const xml = await (await get(`https://www.youtube.com/feeds/videos.xml?channel_id=${id}`)).text();
  const channel = decodeEntities(xml.match(/<author>\s*<name>([^<]*)<\/name>/)?.[1] ?? "");
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, e]) => ({
    id: e.match(/<yt:videoId>([^<]*)</)?.[1] ?? "",
    title: decodeEntities(e.match(/<title>([^<]*)</)?.[1] ?? ""),
    channel,
    channelUrl: `https://www.youtube.com/channel/${id}`,
    published: e.match(/<published>([^<]*)</)?.[1] ?? "",
    description: decodeEntities(e.match(/<media:description>([^<]*)</)?.[1] ?? ""),
  }));
}

async function fromSearch() {
  const after = new Date(Date.now() - SEARCH_DAYS * 864e5).toISOString();
  const ids = new Set();
  for (const q of QUERIES) {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.search = new URLSearchParams({
      key,
      part: "id",
      q,
      type: "video",
      order: "date",
      maxResults: "50",
      publishedAfter: after,
      relevanceLanguage: "en",
    }).toString();
    const data = await (await get(url)).json();
    for (const it of data.items ?? []) ids.add(it.id.videoId);
  }
  // Search snippets cut descriptions short, so fetch the full details.
  return apiVideos([...ids], key);
}

const picks = readJson(PICKS);
const refs = [...readList(CHANNELS), ...picks.map((p) => p.channelUrl)];
const channelIds = new Set();
for (const ref of refs) {
  try {
    channelIds.add(await channelId(ref));
  } catch (err) {
    console.warn(`Skipping channel ${ref}: ${err.message}`);
  }
}

const found = new Map();
let sources = 0;
for (const id of channelIds) {
  try {
    const videos = await fromFeed(id);
    sources++;
    for (const v of videos) if (isClassic(v, true)) found.set(v.id, v);
  } catch (err) {
    console.warn(`Could not read the feed for ${id}: ${err.message}`);
  }
}
if (key) {
  try {
    const videos = await fromSearch();
    sources++;
    for (const v of videos) if (isClassic(v, channelIds.has(v.channelUrl.split("/").pop()))) found.set(v.id, v);
  } catch (err) {
    console.warn(`YouTube search failed: ${err.message}`);
  }
} else {
  console.log("No YOUTUBE_API_KEY, so only the channel feeds were read.");
}

if (sources === 0) {
  // Keep the last good list rather than blanking the page.
  console.error("No source could be read; leaving recent.json as it is.");
  process.exit(1);
}

const hidden = new Set(readList(HIDDEN));
const videos = [...found.values()]
  .filter((v) => v.id && !hidden.has(v.id) && !/#shorts/i.test(v.title))
  .sort((a, b) => b.published.localeCompare(a.published))
  .slice(0, MAX)
  .map(({ id, title, channel, channelUrl, published }) => ({ id, title, channel, channelUrl, published }));

const old = readJson(RECENT);
if (JSON.stringify(old.videos) === JSON.stringify(videos)) {
  console.log(`No new videos (${videos.length} listed).`);
} else {
  writeJson(RECENT, { updated: new Date().toISOString(), videos });
  console.log(`Wrote ${videos.length} videos from ${channelIds.size} channels${key ? " and search" : ""}.`);
}
