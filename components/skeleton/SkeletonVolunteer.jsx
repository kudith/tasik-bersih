// kalangsaripride-next/components/skeleton/SkeletonVolunteerForm.jsx
import {Skeleton} from "@/components/ui/skeleton";

export function SkeletonVolunteerForm() {
    return (
        <div
            className="flex flex-col md:flex-row items-center justify-start max-w-7xl mx-auto md:px-0 px-4 overflow-hidden">
            <div className="w-full max-w-xl p-4">
                <div className="shadow-lg p-6 space-y-4">
                    <Skeleton className="h-6 w-44 mb-2"/>
                    <Skeleton className="h-6 w-36 mb-2"/>
                    <Skeleton className="h-6 w-32 mb-2"/>
                    <Skeleton className="h-10 w-full mb-4"/>
                    <Skeleton className="h-6 w-32 mb-2"/>
                    <Skeleton className="h-10 w-full mb-4"/>
                    <Skeleton className="h-6 w-32 mb-2"/>
                    <Skeleton className="h-10 w-full mb-4"/>
                    <Skeleton className="h-6 w-32 mb-2"/>
                    <Skeleton className="h-10 w-full mb-4"/>
                    <Skeleton className="h-6 w-32 mb-2"/>
                    <Skeleton className="h-10 w-full mb-4"/>
                    <Skeleton className="h-12 w-full"/>
                </div>
            </div>
        </div>
    );
}