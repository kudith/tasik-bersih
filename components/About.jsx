"use client";
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import * as React from "react";
import { SkeletonAboutUs } from "@/components/skeleton/SkeletonAboutUs";
import { useTranslation } from "react-i18next";
import { useCurrentLocale } from "next-i18n-router/client";
import i18nConfig from "@/i18nConfig";

const AboutUs = React.memo(() => {
    const { t } = useTranslation();
    const locale = useCurrentLocale(i18nConfig);
    const [aboutData, setAboutData] = useState(null);
    const [error, setError] = useState(null);

    const [ref1, inView1] = useInView({ triggerOnce: true });
    const [ref2, inView2] = useInView({ triggerOnce: true });
    const [ref3, inView3] = useInView({ triggerOnce: true });
    const [ref4, inView4] = useInView({ triggerOnce: true });
    const [ref5, inView5] = useInView({ triggerOnce: true });
    const [ref6, inView6] = useInView({ triggerOnce: true });

    const fetchAboutData = useCallback(async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/about-us?locale=${locale}&populate=*`
            );
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const result = await response.json();
            setAboutData(result.data);
        } catch (error) {
            setError(error);
        }
    }, [locale]);

    useEffect(() => {
        fetchAboutData();
    }, [fetchAboutData]);

    if (error) return <p>Error loading data: {error.message}</p>;
    if (!aboutData) return <SkeletonAboutUs />;

    const { image_1, image_2, image_3, who_we_are, vision, mission } = aboutData;
    return (
        <section id="about" className="py-16 px-4 md:px-8 bg-gray-50 text-gray-900">
            <div className="container max-w-6xl mx-auto">
                <motion.div
                    className="relative overflow-hidden rounded-lg shadow-lg mb-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: inView1 ? 1 : 0 }}
                    transition={{ duration: 1 }}
                    ref={ref1}
                >
                    <Image
                        src={image_1.url}
                        alt="About Us Image 1"
                        width={700}
                        height={400}
                        quality={100}
                        className="w-full h-96 object-cover transition-transform duration-500 ease-in-out hover:scale-105"
                        loading="lazy"
                    />
                </motion.div>

                <motion.div
                    className="text-center space-y-8"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: inView2 ? 1 : 0, y: inView2 ? 0 : 50 }}
                    transition={{ duration: 1, delay: 0.3 }}
                    ref={ref2}
                >
                    <h2 className="text-5xl font-extrabold text-gray-800 mb-4">{t('about_us')}</h2>
                    <p className="text-xl text-gray-700 leading-relaxed">{who_we_are}</p>
                </motion.div>

                <div className="my-8 border-t border-gray-300"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                    <motion.div
                        className="flex flex-col justify-center"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: inView3 ? 1 : 0, y: inView3 ? 0 : 50 }}
                        transition={{ duration: 1, delay: 0.7 }}
                        ref={ref3}
                    >
                        <h3 className="text-4xl font-bold text-gray-800 mb-4">{t('our_mission')}</h3>
                        <p className="text-lg text-gray-700 leading-relaxed">{mission}</p>
                    </motion.div>

                    <motion.div
                        className="relative overflow-hidden rounded-lg shadow-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: inView4 ? 1 : 0 }}
                        transition={{ duration: 1, delay: 0.7 }}
                        ref={ref4}
                    >
                        <Image
                            src={image_3?.url}
                            alt="Our Mission Image"
                            width={700}
                            height={400}
                            quality={100}
                            className="w-full h-80 object-cover transition-transform duration-500 ease-in-out hover:scale-105"
                            loading="lazy"
                        />
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                    <motion.div
                        className="relative overflow-hidden rounded-lg shadow-lg order-2 md:order-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: inView5 ? 1 : 0 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        ref={ref5}
                    >
                        <Image
                            src={image_2[0]?.url}
                            alt="Our Vision Image"
                            width={700}
                            height={400}
                            quality={100}
                            className="w-full h-80 object-cover transition-transform duration-500 ease-in-out hover:scale-105"
                            loading="lazy"
                        />
                    </motion.div>

                    <motion.div
                        className="flex flex-col justify-center order-1 md:order-2"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: inView6 ? 1 : 0, y: inView6 ? 0 : 50 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        ref={ref6}
                    >
                        <h3 className="text-4xl font-bold text-gray-800 mb-4">{t('our_vision')}</h3>
                        <p className="text-lg text-gray-700 leading-relaxed">{vision}</p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
});

export default AboutUs;