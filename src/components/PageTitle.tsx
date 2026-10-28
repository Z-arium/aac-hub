export default function PageTitle({ title, subtitle }: { title: string; subtitle?: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
      {subtitle && <p className="mt-2 max-w-3xl text-muted">{subtitle}</p>}
    </div>
  );
}
