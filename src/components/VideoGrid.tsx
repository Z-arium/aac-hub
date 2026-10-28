import { thumbnail, type Video } from "@/lib/youtube";

export default function VideoGrid({ videos }: { videos: Video[] }) {
  if (videos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line p-6 text-sm text-muted">
        New ArcheAge Classic videos show up here a few hours after they are posted.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {videos.map((v) => (
        <a
          key={v.id}
          href={`https://www.youtube.com/watch?v=${v.id}`}
          target="_blank"
          rel="noreferrer"
          className="group overflow-hidden rounded-xl border border-line bg-panel hover:border-accent"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumbnail(v.id)} alt="" className="aspect-video w-full object-cover" loading="lazy" />
          <div className="p-3">
            <p className="line-clamp-2 text-sm font-medium group-hover:text-accent">{v.title}</p>
            <p className="mt-1 text-xs text-muted">
              {v.channel} · {new Date(v.published).toLocaleDateString("en-US", { dateStyle: "medium" })}
            </p>
          </div>
        </a>
      ))}
    </div>
  );
}
