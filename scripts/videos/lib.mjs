// Shared helpers for the video scripts. They run in GitHub Actions, which can
// reach YouTube (the dev container can't).

import fs from "node:fs";
import path from "node:path";

export const DIR = path.join(process.cwd(), "content/videos");
export const PICKS = path.join(DIR, "picks.json");
export const RECENT = path.join(DIR, "recent.json");
export const CHANNELS = path.join(DIR, "channels.txt");
export const HIDDEN = path.join(DIR, "hidden.txt");

const UA = "Mozilla/5.0 (compatible; aac-hub video refresh)";

export const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
export const writeJson = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");

/** Non-empty, non-comment lines of a text list. */
export const readList = (file) =>
  fs
    .readFileSync(file, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));

export async function get(url, init = {}) {
  const res = await fetch(url, { ...init, headers: { "user-agent": UA, "accept-language": "en", ...init.headers } });
  if (!res.ok) throw new Error(`${res.status} for ${url.toString().replace(/key=[^&]+/, "key=***")}`);
  return res;
}

export function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

/** Every YouTube video ID in a block of text (watch, youtu.be, shorts, embed and live links). */
export function videoIds(text) {
  const re = /(?:youtube\.com\/(?:watch\?(?:[^\s#]*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/g;
  return [...new Set([...text.matchAll(re)].map((m) => m[1]))];
}

// "ArcheAge Classic" is the aa-classic.com server. Official ArcheAge, Unchained,
// ArcheAge War, ArcheAge 2 and the Korean classic servers are other games.
const CLASSIC = /archeage\s*classic|\baa\s*-?\s*classic\b|aa-classic\.com/i;
const ARCHEAGE = /archeage|\baa\b/i;
const OTHER = /unchained|archeage\s*(?:war|2\b|ii\b|chronicles|begins|mobile)|aa\s*war|\bkakao\b|[가-힯]/i;

/**
 * Whether a video is about ArcheAge Classic. A video from a known Classic
 * channel only has to mention ArcheAge; anything else has to say Classic.
 */
export function isClassic({ title, description = "" }, fromKnownChannel = false) {
  const text = `${title}\n${description}`;
  if (OTHER.test(title)) return false;
  if (CLASSIC.test(text)) return !OTHER.test(text) || CLASSIC.test(title);
  return fromKnownChannel && ARCHEAGE.test(title) && !OTHER.test(text);
}

/** Resolves a channel link, @handle or UC... id to a channel id. */
export async function channelId(ref) {
  const direct = ref.match(/UC[\w-]{22}/);
  if (direct) return direct[0];
  const url = ref.startsWith("http") ? ref : `https://www.youtube.com/${ref.startsWith("@") ? ref : `@${ref}`}`;
  const html = await (await get(url)).text();
  const id =
    html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/channel\/(UC[\w-]{22})"/)?.[1] ??
    html.match(/"(?:externalId|channelId)":"(UC[\w-]{22})"/)?.[1];
  if (!id) throw new Error(`No channel id found at ${url}`);
  return id;
}

/** Details for one video, without an API key: oEmbed plus the watch page. */
export async function videoDetails(id, key) {
  if (key) {
    const [v] = await apiVideos([id], key);
    if (v) return v;
  }
  const watch = `https://www.youtube.com/watch?v=${id}`;
  const o = await (await get(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(watch)}`)).json();
  let published = "";
  let channelUrl = o.author_url;
  try {
    const html = await (await get(watch)).text();
    published = html.match(/"(?:uploadDate|publishDate)":"([^"]+)"/)?.[1] ?? "";
    const cid = html.match(/"channelId":"(UC[\w-]{22})"/)?.[1];
    if (cid) channelUrl = `https://www.youtube.com/channel/${cid}`;
  } catch (err) {
    console.warn(`Could not read the watch page for ${id}: ${err.message}`);
  }
  return {
    id,
    title: o.title,
    channel: o.author_name,
    channelUrl,
    published: published.slice(0, 10),
    description: "",
  };
}

/** Video details from the YouTube Data API (1 quota unit per 50 videos). */
export async function apiVideos(ids, key) {
  const out = [];
  for (let i = 0; i < ids.length; i += 50) {
    const url = new URL("https://www.googleapis.com/youtube/v3/videos");
    url.search = new URLSearchParams({ key, part: "snippet", id: ids.slice(i, i + 50).join(",") }).toString();
    const data = await (await get(url)).json();
    for (const it of data.items ?? []) {
      out.push({
        id: it.id,
        title: it.snippet.title,
        channel: it.snippet.channelTitle,
        channelUrl: `https://www.youtube.com/channel/${it.snippet.channelId}`,
        published: it.snippet.publishedAt,
        description: it.snippet.description ?? "",
      });
    }
  }
  return out;
}
