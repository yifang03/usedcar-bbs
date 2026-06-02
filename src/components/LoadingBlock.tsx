export default function LoadingBlock({ text = "加载中..." }: { text?: string }) {
  return (
    <div className="surface rounded-xl p-4">
      <div className="space-y-3">
        <div className="h-4 w-24 animate-pulse rounded-full bg-border" />
        <div className="h-24 animate-pulse rounded-xl bg-bg" />
        <div className="h-24 animate-pulse rounded-xl bg-bg" />
        <p className="text-center text-xs text-text-secondary">{text}</p>
      </div>
    </div>
  );
}
