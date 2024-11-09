"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { FaLeaf, FaHandsHelping } from "react-icons/fa";
import { useRouter } from "next/navigation";
import {SkeletonHero} from "@/components/skeleton/SkeletonHero";

// Framer Motion variants for smooth animations
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
  const router = useRouter();

  // Fetching data from Strapi
  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:1337/api/hero?populate=*"
        );
        setHeroData(response.data.data);
      } catch (error) {
        console.error("Error fetching hero data:", error);
      }
    };
    fetchHeroData();
  }, []);

  if (!heroData) return <SkeletonHero/>;

  // Destructure data
  const { tittle, subtittle } = heroData;

  const handleDonateClick = () => {
    router.push("/donate");
  };

  return (
    <section className="relative h-screen flex items-center justify-center px-4 md:px-8 ">
      <motion.div
        className="container max-w-3xl mx-auto flex flex-col items-center text-center space-y-6"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        {/* Title */}
        <motion.h1
          className="text-4xl md:text-6xl font-bold tracking-tight text-black leading-tight"
          variants={slideUp}
        >
          {tittle}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl"
          variants={slideUp}
        >
          {subtittle}
        </motion.p>

        {/* Buttons */}
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