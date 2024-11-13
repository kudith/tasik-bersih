"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Image from "next/legacy/image";
import TeamSkeleton from "@/components/skeleton/TeamSkeleton";
import { useTranslation } from "react-i18next";

const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
};

const Team = () => {
    const { t } = useTranslation('team');
    const [teamData, setTeamData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeamData = async () => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/teams?populate=*`
                );
                setTeamData(response.data.data);
                localStorage.setItem("teamData", JSON.stringify(response.data.data));
            } catch (error) {
                setError("Failed to fetch team data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        const storedTeamData = localStorage.getItem("teamData");
        if (storedTeamData) {
            setTeamData(JSON.parse(storedTeamData));
            setLoading(false);
        } else {
            fetchTeamData();
        }
    }, []);

    if (error) return <div className="text-center text-red-500">{error}</div>;

    if (loading) return <TeamSkeleton count={teamData.length > 0 ? teamData.length : 8} />;

    return (
        <section id="team" className="py-16 min-h-screen">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-semibold text-gray-800 mb-4">{t('headline')}</h2>
                    <p className="text-lg text-gray-600 max-w-xl mx-auto">
                        {t('description')}
                    </p>
                </div>

                <motion.div
                    className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 my-20"
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                >
                    {teamData.map(({ id, name, image }) => (
                        <motion.div
                            key={id}
                            className="flex flex-col items-center justify-center space-y-4"
                            variants={fadeIn}
                        >
                            <div className="w-48 h-48 relative overflow-hidden full shadow-lg">
                                <Image
                                    src={image.url}
                                    alt={name}
                                    sizes={500}
                                    priority={true}
                                    layout="fill"
                                    objectFit="cover"
                                    className="transition-transform duration-300 ease-in-out transform hover:scale-105"
                                />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800">{name}</h3>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default Team;