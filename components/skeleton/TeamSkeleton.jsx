import React from "react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
};

const TeamSkeleton = ({ count }) => {
    const skeletons = Array(count).fill(0);

    return (
        <section id="team" className="py-16 min-h-screen">
            <div className="container mx-auto px-6">
                {/* Headline */}
                <div className="text-center space-y-4 mb-12">
                    <Skeleton className="h-10 w-48 mx-auto mb-4" />
                    <Skeleton className="h-6 w-9/12 mx-auto" />
                    <Skeleton className="h-6 w-8/12 mx-auto" />
                    <Skeleton className="h-6 w-1/4 mx-auto" />
                </div>

                {/* Team Cards */}
                <motion.div
                    className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 my-20"
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                >
                    {skeletons.map((_, index) => (
                        <motion.div
                            key={index}
                            className="flex flex-col items-center justify-center space-y-4"
                            variants={fadeIn}
                        >
                            <Skeleton className="w-48 h-48 mb-4" />
                            <Skeleton className="w-32 h-6 mb-1" />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default TeamSkeleton;