// Recent ArcheAge Classic uploads, from content/videos/recent.json.
// The Videos workflow refreshes that file every 6 hours (scripts/videos/refresh.mjs).

import recent from "../../content/videos/recent.json";

export interface Video {
  id: string;
  title: string;
  channel: string;
  channelUrl: string;
  published: string;
}

export const VIDEOS_UPDATED: string | null = recent.updated;

export function getVideos(max = 12, skip: string[] = []): Video[] {
  return (recent.videos as Video[]).filter((v) => !skip.includes(v.id)).slice(0, max);
}

export const thumbnail = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
