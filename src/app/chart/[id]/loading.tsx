import { Skeleton } from "@/components/ui/skeleton";

export default function ChartLoading() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-6">
      <Skeleton className="h-10 w-56" />
      <Skeleton className="h-6 w-40" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="aspect-square rounded-xl" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
