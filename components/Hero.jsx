"use client";
import { Suspense } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { FaLeaf, FaHandsHelping } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { SkeletonHero } from "@/components/skeleton/SkeletonHero";
import { useCurrentLocale } from "next-i18n-router/client";
import i18nConfig from "@/i18nConfig";
import { useTranslation } from "react-i18next";
import useSWR from "swr";

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1, ease: "easeOut" } },
};

const slideUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 1, ease: "easeOut" } },
};

const buttonClick = {
  tap: { scale: 0.95 },
};

const fetcher = url => axios.get(url).then(res => res.data);

const Hero = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const locale = useCurrentLocale(i18nConfig);

  const { data, error } = useSWR(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/hero?locale=${locale}`, fetcher);

  if (error) return <div className="text-center text-red-500">Failed to fetch hero data. Please try again later.</div>;

  if (!data) return <SkeletonHero />;

  const { tittle, subtittle } = data.data;

  const handleDonateClick = () => {
    router.push("/donate");
  };
  const handleLearnMoreClick = () => {
    router.push("/#about");
  }

  return (
    <section id="home" className="relative w-full h-screen overflow-hidden">
      {/* Background image with proper sizing */}
      <div 
        className="absolute inset-0 w-full bg-cover bg-center bg-no-repeat z-0"
        style={{ 
          backgroundImage: `url('/images/hero.png')`,
          backgroundSize: 'cover',
          filter: 'brightness(0.5)' // Added to make the background dimmer
        }}
      ></div>
      
      {/* Optional dark overlay for better text contrast */}
      <div className="absolute inset-0 w-full h-full bg-black bg-opacity-40 z-10"></div>
      
      {/* Content container */}
      <div className="relative z-20 w-full h-full flex items-center justify-center px-4 md:px-8">
        <Suspense>
          <motion.div
            className="container max-w-4xl mx-auto flex flex-col items-center text-center space-y-6"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <motion.h1
              className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight" // Changed to a softer white
              variants={slideUp}
            >
              {tittle}
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-4xl" // Changed to a softer gray
              variants={slideUp}
            >
              {subtittle}
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 mt-6 justify-center"
              variants={slideUp}
            >
              <motion.button
                className="flex items-center justify-center py-3 px-6 bg-white text-black rounded-md shadow-lg hover:bg-gray-100 transition-all duration-300"
                onClick={handleDonateClick}
                whileTap={buttonClick.tap}
              >
                <FaHandsHelping className="mr-2" />
                {t('contribute_now')}
              </motion.button>
              <motion.button
                className="flex items-center justify-center py-3 px-6 border-2 border-white text-white rounded-md shadow-lg hover:bg-white hover:bg-opacity-10 transition-all duration-300"
                onClick={handleLearnMoreClick}
                whileTap={buttonClick.tap}
              >
                <FaLeaf className="mr-2" />
                {t('learn_more')}
              </motion.button>
            </motion.div>
          </motion.div>
        </Suspense>
      </div>
    </section>
  );
};

export default Hero;