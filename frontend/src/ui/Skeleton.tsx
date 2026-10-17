interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-800/60 relative overflow-hidden ${className}`}
    >
      {/* Üzerinden geçen hafif parlama efekti (Shimmer) */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-slate-700/20 to-transparent" />
    </div>
  );
}