import type { Metadata } from "next";
import PageTitle from "@/components/PageTitle";
import VideoGrid from "@/components/VideoGrid";
import { getVideos } from "@/lib/youtube";

export const metadata: Metadata = { title: "Videos" };
export const revalidate = 3600;

export default async function VideosPage() {
  const videos = await getVideos(24);
  return (
    <>
      <PageTitle title="Videos" subtitle="The newest ArcheAge Classic videos from YouTube. Refreshed every hour." />
      <VideoGrid videos={videos} />
    </>
  );
}
