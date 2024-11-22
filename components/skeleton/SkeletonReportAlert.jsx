import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonReportAlert() {
  return (
    <div className="p-4 md:p-10 max-w-4xl mx-auto flex items-center justify-center flex-col text-center">
      {/* Title */}
      <Skeleton className="h-8 md:h-12 w-3/4 md:w-full mb-2" />

      {/* Text */}
      <Skeleton className="h-6 md:h-8 w-5/6 md:w-2/3 mb-4" />

      {/* Button */}
      <Skeleton className="h-12 w-40" />
    </div>
  );
}