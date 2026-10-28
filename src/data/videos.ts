// Videos picked by hand to feature on the site, with credit to their creators.

export interface FeaturedVideo {
  id: string;
  title: string;
  creator: string;
  channelUrl: string;
  published: string;
  /** Slug of the guide the video goes with. */
  guide?: string;
  blurb: string;
}

export const FEATURED_VIDEOS: FeaturedVideo[] = [
  {
    id: "mugI8Trhrcw",
    title: "Archeage Classic Gearing Guide 2025",
    creator: "Thranaerttv",
    channelUrl: "https://www.youtube.com/channel/UCzmV5UoMXUEMGzpFWAJ4y_Q",
    published: "2025-08-03",
    guide: "gearing-path",
    blurb: "The best walkthrough of the ArcheAge Classic gearing path for new and returning players.",
  },
];

export const getFeaturedVideo = (id: string) => FEATURED_VIDEOS.find((v) => v.id === id);
