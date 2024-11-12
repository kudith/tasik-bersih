"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { FaLeaf, FaHandsHelping } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { SkeletonHero } from "@/components/skeleton/SkeletonHero";

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

const Hero = () => {
  const [heroData, setHeroData] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/hero?populate=*`
        );
        setHeroData(response.data.data);
      } catch (error) {
        setError("Failed to fetch hero data. Please try again later.");
      }
    };
    fetchHeroData();
  }, []);

  if (error) return Error(error);

  if (!heroData) return <SkeletonHero />;

  const { tittle, subtittle } = heroData;

  const handleDonateClick = () => {
    router.push("/donate");
  };

  return (
    <section id="home" className="relative h-screen flex items-center justify-center px-4 md:px-8">
      <motion.div
        className="container max-w-3xl mx-auto flex flex-col items-center text-center space-y-6"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <motion.h1
          className="text-4xl md:text-6xl font-bold tracking-tight text-black leading-tight"
          variants={slideUp}
        >
          {tittle}
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-gray-60 leading-relaxed max-w-xl"
          variants={slideUp}
        >
          {subtittle}
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 mt-6 justify-center"
          variants={slideUp}
        >
          <motion.button
            className="flex items-center justify-center py-3 px-6 bg-black text-white rounded-md shadow-lg hover:bg-gray-900 transition-all duration-300"
            onClick={handleDonateClick}
            whileTap={buttonClick.tap}
          >
            <FaHandsHelping className="mr-2" />
            Contribute Now
          </motion.button>
          <motion.button
            className="flex items-center justify-center py-3 px-6 bg-gray-100 text-black border border-gray-300 rounded-md shadow-lg hover:bg-gray-200 transition-all duration-300"
            whileTap={buttonClick.tap}
          >
            <FaLeaf className="mr-2" />
            Learn More
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;