import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonDonationForm() {
  return (
    <div className="flex md:px-0 px-4 items-center my-20 justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-xl p-4 shadow-lg">
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-10 w-full mb-4" />
          <div className="grid grid-cols-2 gap-2">
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}