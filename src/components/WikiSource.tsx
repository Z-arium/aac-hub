export default function WikiSource({ page, label = "AAClassic wiki" }: { page: string; label?: string }) {
  return (
    <a className="underline" href={`https://wiki.aa-classic.com/${page}`}>
      {label}
    </a>
  );
}
