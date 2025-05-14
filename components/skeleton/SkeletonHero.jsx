import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 md:px-8">
      <div className="container max-w-3xl mx-auto flex flex-col items-center text-center space-y-6">
        {/* Title */}
        <Skeleton className="h-16 md:h-24 w-3/4 md:w-full" />

        {/* Subtitle */}
        <Skeleton className="h-6 md:h-8 w-5/6 md:w-2/3" />

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6 justify-center">
          <Skeleton className="h-12 w-40" />
          <Skeleton className="h-12 w-40" />
        </div>
      </div>
    </section>
  );
}