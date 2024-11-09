import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonAboutUs() {
  return (
    <div className="py-16 px-4 md:px-8 bg-gray-50 text-gray-900">
      <div className="container max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-lg shadow-lg mb-12">
          <Skeleton className="w-full h-96" />
        </div>
        <div className="text-center space-y-8">
          <Skeleton className="h-10 w-48 mx-auto mb-4" />
          <Skeleton className="h-6 w-3/4 mx-auto" />
        </div>
        <div className="my-8 border-t border-gray-300"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <div className="flex flex-col justify-center">
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-6 w-3/4" />
          </div>
          <div className="relative overflow-hidden rounded-lg shadow-lg">
            <Skeleton className="w-full h-80" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <div className="relative overflow-hidden rounded-lg shadow-lg order-2 md:order-1">
            <Skeleton className="w-full h-80" />
          </div>
          <div className="flex flex-col justify-center order-1 md:order-2">
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
}