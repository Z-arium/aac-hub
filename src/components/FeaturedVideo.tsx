import Link from "next/link";
import type { FeaturedVideo as Video } from "@/data/videos";

export default function FeaturedVideo({ video, showGuide = false }: { video: Video; showGuide?: boolean }) {
  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-panel">
      <div className="aspect-video w-full">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${video.id}`}
          title={video.title}
          className="h-full w-full"
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <figcaption className="p-4">
        <p className="font-semibold">{video.title}</p>
        <p className="mt-1 text-sm text-muted">
          By{" "}
          <a href={video.channelUrl} target="_blank" rel="noreferrer" className="underline hover:text-text">
            {video.creator}
          </a>{" "}
          ·{" "}
          <a
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-text"
          >
            Watch on YouTube
          </a>
          {showGuide && video.guide && (
            <>
              {" "}
              ·{" "}
              <Link href={`/guides/${video.guide}`} className="text-accent-2 hover:underline">
                Read the written guide
              </Link>
            </>
          )}
        </p>
        <p className="mt-2 text-sm text-muted">{video.blurb}</p>
      </figcaption>
    </figure>
  );
}
