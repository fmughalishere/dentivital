export default function Skeleton({ className = "h-4 w-full" }: { className?: string }) {
  return <div className={`dv-skeleton rounded-lg ${className}`} aria-hidden />;
}
