export default function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
        <span className="text-base font-bold leading-none">方</span>
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-accent" />
      </div>
      <div className="min-w-0 leading-tight">
        <span className="block truncate text-base font-bold text-text">一方二手车论坛</span>
        {!compact && <span className="block text-[10px] text-text-secondary">懂车友，少走弯路</span>}
      </div>
    </div>
  );
}
