import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonFooter() {
  return (
    <footer className="py-12 px-8 bg-black text-white mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* About Section */}
        <div>
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-full mb-4" />
          <Skeleton className="h-4 w-5/6 mb-4" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Navigation Links */}
        <div>
          <Skeleton className="h-8 w-1/2 mb-4" />
          <ul className="space-y-2">
            <li><Skeleton className="h-4 w-3/4" /></li>
            <li><Skeleton className="h-4 w-3/4" /></li>
            <li><Skeleton className="h-4 w-3/4" /></li>
            <li><Skeleton className="h-4 w-3/4" /></li>
          </ul>
        </div>

        {/* Contact Information */}
        <div>
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-4 w-full mb-4" />
          <ul className="mt-4 space-y-2">
            <li className="flex items-center space-x-2">
              <Skeleton className="h-4 w-3/4" />
            </li>
            <li className="flex items-center space-x-2">
              <Skeleton className="h-4 w-3/4" />
            </li>
          </ul>
        </div>
      </div>

      {/* Social Media & Donate */}
      <div className="mt-12 border-t border-gray-700 pt-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Social Media Icons */}
          <div className="flex space-x-4">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>

          {/* Donate Button */}
          <Skeleton className="h-12 w-40 mt-4 md:mt-0" />
        </div>

        {/* Footer Bottom Text */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <Skeleton className="h-4 w-1/2 mx-auto" />
        </div>
      </div>
    </footer>
  );
}