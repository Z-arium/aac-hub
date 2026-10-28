// Pulls recent ArcheAge Classic videos.
// With YOUTUBE_API_KEY set, it searches YouTube. Otherwise it reads the public
// RSS feeds of the channels in YOUTUBE_CHANNEL_IDS (comma separated).
// Results are cached and refreshed every hour.

export interface Video {
  id: string;
  title: string;
  channel: string;
  published: string;
  thumbnail: string;
}

interface ApiItem {
  id: { videoId: string };
  snippet: { title: string; channelTitle: string; publishedAt: string; thumbnails?: { high?: { url: string } } };
}

const SEARCH_QUERY = "ArcheAge Classic";
const REVALIDATE = 3600;

async function fromApi(key: string, max: number): Promise<Video[]> {
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.search = new URLSearchParams({
    key,
    part: "snippet",
    q: SEARCH_QUERY,
    type: "video",
    order: "date",
    maxResults: String(max),
    relevanceLanguage: "en",
  }).toString();
  const res = await fetch(url, { next: { revalidate: REVALIDATE } });
  if (!res.ok) throw new Error(`YouTube API ${res.status}`);
  const data: { items: ApiItem[] } = await res.json();
  return data.items.map((it) => ({
    id: it.id.videoId,
    title: decodeEntities(it.snippet.title),
    channel: it.snippet.channelTitle,
    published: it.snippet.publishedAt,
    thumbnail: it.snippet.thumbnails?.high?.url ?? `https://i.ytimg.com/vi/${it.id.videoId}/hqdefault.jpg`,
  }));
}

async function fromRss(channelId: string): Promise<Video[]> {
  const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`, {
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) return [];
  const xml = await res.text();
  const channel = decodeEntities(xml.match(/<author>\s*<name>([^<]*)<\/name>/)?.[1] ?? "");
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, e]) => {
    const id = e.match(/<yt:videoId>([^<]*)</)?.[1] ?? "";
    return {
      id,
      title: decodeEntities(e.match(/<title>([^<]*)</)?.[1] ?? ""),
      channel,
      published: e.match(/<published>([^<]*)</)?.[1] ?? "",
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    };
  });
}

function decodeEntities(s: string) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export async function getVideos(max = 12): Promise<Video[]> {
  try {
    const key = process.env.YOUTUBE_API_KEY;
    if (key) return await fromApi(key, max);
    const ids = (process.env.YOUTUBE_CHANNEL_IDS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    const lists = await Promise.all(ids.map(fromRss));
    return lists
      .flat()
      .sort((a, b) => b.published.localeCompare(a.published))
      .slice(0, max);
  } catch (err) {
    console.error("Could not load videos", err);
    return [];
  }
}
