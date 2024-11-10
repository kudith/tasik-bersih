// components/skeleton/TeamSkeleton.jsx
import React from "react";
import { motion } from "framer-motion";

const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
};

const TeamSkeleton = ({ count }) => {
    const skeletons = Array(count).fill(0);

    return (
        <section id="team" className="py-16 min-h-screen">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-800 mb-4">Meet Our Team</h2>
                    <p className="text-lg text-gray-600 max-w-xl mx-auto">
                        Dedicated individuals who contribute to making a difference.
                    </p>
                </div>
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2"
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                >
                    {skeletons.map((_, index) => (
                        <motion.div
                            key={index}
                            className="transform hover:scale-105 transition duration-300 flex flex-col items-center justify-center"
                            variants={fadeIn}
                        >
                            <div className="w-48 h-48 bg-gray-300 mb-4 flex justify-center items-center"></div>
                            <div className="w-32 h-6 bg-gray-300 mb-1"></div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default TeamSkeleton;