import { Skeleton } from "@/components/ui/skeleton";

export default function ChatLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <Skeleton className="hidden md:block w-64 h-full rounded-none" />
      <div className="flex-1 flex flex-col p-4 space-y-4">
        <Skeleton className="h-8 w-40" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-16 w-3/4 rounded-xl" />
          <Skeleton className="h-12 w-1/2 rounded-xl ml-auto" />
          <Skeleton className="h-20 w-2/3 rounded-xl" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}
