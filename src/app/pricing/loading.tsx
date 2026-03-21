import { Skeleton } from "@/components/ui/skeleton";

export default function PricingLoading() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 space-y-8">
      <Skeleton className="h-10 w-48 mx-auto" />
      <Skeleton className="h-5 w-72 mx-auto" />
      <div className="grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );
}
