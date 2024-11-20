import {Skeleton} from "@/components/ui/skeleton";

export function SkeletonGallery() {
    return (
        <div className="max-w-7xl my-20 mx-auto">
            <div
                className="col-span-full space-y-6 mt-20 mx-auto text-center mb-6">
                <Skeleton className="h-8 w-3/6 mx-auto mt-20"/>
                <Skeleton className="h-6 w-3/6 mx-auto"/>
                <Skeleton className="h-6 w-5/6 mx-auto"/>
            </div>
            <div
                className="grid grid-cols-1 mx-auto max-w-7xl my-20 sm:grid-cols-2 md:grid-cols- gap-6 p-4">
                {[...Array(4)].map((_, index) => (
                    <div key={index}
                         className="bg-white rounded-lg shadow-md my-5 overflow-hidden">
                        <Skeleton className="w-full h-[28rem]"/>
                        <div className="p-4">
                            <Skeleton className="h-6 w-3/4 mb-2"/>
                            <Skeleton className="h-4 w-1/2"/>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}