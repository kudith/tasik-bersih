import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonEvent() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-10 px-4">
      <Skeleton className="h-8 w-48 mb-8" />
      <div className="w-full max-w-4xl mx-auto overflow-hidden">
        <div className="flex px-4 space-x-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex-shrink-0 w-full p-4">
              <div className="overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/2 space-y-4 mb-4 md:mb-0">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-8 w-48" />
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-10 w-32 mt-4" />
                    </div>
                    <div className="w-full md:w-1/2 relative h-48 md:h-auto overflow-hidden rounded-lg">
                      <Skeleton className="h-full w-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}