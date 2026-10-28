import type { Metadata } from "next";
import FeaturedVideo from "@/components/FeaturedVideo";
import PageTitle from "@/components/PageTitle";
import VideoGrid from "@/components/VideoGrid";
import { FEATURED_VIDEOS } from "@/data/videos";
import { getVideos } from "@/lib/youtube";

export const metadata: Metadata = { title: "Videos" };

const SUGGEST_URL = "https://github.com/Z-arium/aac-hub/issues/new?template=videos.yml";

export default function VideosPage() {
  const videos = getVideos(48, FEATURED_VIDEOS.map((v) => v.id));
  return (
    <>
      <PageTitle
        title="Videos"
        subtitle="Hand-picked ArcheAge Classic videos, and the newest uploads from YouTube."
      />
      {FEATURED_VIDEOS.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-1 text-xl font-bold">Community picks</h2>
          <p className="mb-4 text-sm text-muted">The videos most worth your time, chosen for the community.</p>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {FEATURED_VIDEOS.map((v) => (
              <FeaturedVideo key={v.id} video={v} showGuide />
            ))}
          </div>
        </section>
      )}
      <section>
        <h2 className="mb-1 text-xl font-bold">Recent uploads</h2>
        <p className="mb-4 text-sm text-muted">
          New ArcheAge Classic videos, checked every 6 hours. Videos about official ArcheAge, Unchained or ArcheAge War
          are left out.
        </p>
        <VideoGrid videos={videos} />
      </section>
      <p className="mt-8 text-sm text-muted">
        Know a great video?{" "}
        <a href={SUGGEST_URL} target="_blank" rel="noreferrer" className="text-accent-2 hover:underline">
          Suggest it
        </a>
        .
      </p>
    </>
  );
}
