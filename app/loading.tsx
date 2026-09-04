import Skeleton from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="dv-container py-16">
      <Skeleton className="h-8 w-52" />
      <Skeleton className="mt-4 h-4 w-full max-w-lg" />
      <Skeleton className="mt-2 h-4 w-full max-w-md" />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-72 w-full" />
        ))}
      </div>
    </div>
  );
}
