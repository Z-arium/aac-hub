// Community picks: videos Jacob features on the site, with credit to their creators.
// The list lives in content/videos/picks.json and is changed through the
// "Videos" issue form on GitHub (see the Videos workflow).

import picks from "../../content/videos/picks.json";

export interface FeaturedVideo {
  id: string;
  title: string;
  creator: string;
  channelUrl: string;
  published: string;
  /** Slug of the guide the video goes with. */
  guide?: string;
  blurb: string;
  added?: string;
}

export const FEATURED_VIDEOS: FeaturedVideo[] = picks;

export const getFeaturedVideo = (id: string) => FEATURED_VIDEOS.find((v) => v.id === id);
