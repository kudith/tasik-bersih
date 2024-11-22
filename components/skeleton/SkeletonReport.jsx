import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonReportPolluted() {
  return (
    <div id="report-polluted" className="flex flex-col items-center justify-start max-w-7xl mx-auto px-4 overflow-hidden">
      <div className="flex flex-col md:gap-32 items-center md:flex-row w-full">
        <div className="md:w-1/2 p-4">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-4" />
        </div>
        <div className="shadow-lg w-full my-20 max-w-xl p-4">
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/2 mb-4" />
            <Skeleton className="h-6 w-3/4 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-10 w-full mb-4" />
            </div>
            <Skeleton className="h-20 w-full mb-4" />
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}