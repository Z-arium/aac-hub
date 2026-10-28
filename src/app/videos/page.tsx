import type { Metadata } from "next";
import FeaturedVideo from "@/components/FeaturedVideo";
import PageTitle from "@/components/PageTitle";
import VideoGrid from "@/components/VideoGrid";
import { FEATURED_VIDEOS } from "@/data/videos";
import { getVideos } from "@/lib/youtube";

export const metadata: Metadata = { title: "Videos" };
export const revalidate = 3600;

export default async function VideosPage() {
  const videos = await getVideos(24);
  return (
    <>
      <PageTitle title="Videos" subtitle="The newest ArcheAge Classic videos from YouTube. Refreshed every hour." />
      {FEATURED_VIDEOS.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold">Featured</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {FEATURED_VIDEOS.map((v) => (
              <FeaturedVideo key={v.id} video={v} showGuide />
            ))}
          </div>
        </section>
      )}
      <h2 className="mb-4 text-xl font-bold">Latest</h2>
      <VideoGrid videos={videos} />
    </>
  );
}
