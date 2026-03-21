import { Skeleton } from "@/components/ui/skeleton";

export default function CompatibilityLoading() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-8">
      <Skeleton className="h-10 w-72 mx-auto" />
      <Skeleton className="h-5 w-56 mx-auto" />
      <div className="grid gap-6 sm:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
      <Skeleton className="h-12 w-48 rounded-lg mx-auto" />
    </div>
  );
}
