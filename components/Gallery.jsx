"use client";
import React, { useEffect, useState, useRef, memo } from "react";
import axios from "axios";
import Image from "next/legacy/image";
import { useTranslation } from "react-i18next";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import useSWR from "swr";
import { SkeletonGallery } from "@/components/skeleton/SkeletonGallery";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const fetcher = url => axios.get(url).then(res => res.data);

const Gallery = () => {
  const { t, i18n } = useTranslation();
  const { data, error } = useSWR(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/galleries?populate=*`, fetcher);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(i18n.language, options);
  };

  if (error) {
    return <div>Error loading galleries</div>;
  }

  if (!data) {
    return <SkeletonGallery />;
  }

  const galleries = data.data;

  return (
    <motion.div
      className="grid grid-cols-1 mx-auto max-w-7xl md:my-10 sm:grid-cols-2 md:grid-cols- gap-6 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <HeaderSection t={t} />
      {galleries.map((gallery) => (
        <MemoizedGalleryItem key={gallery.id} gallery={gallery} formatDate={formatDate} />
      ))}
    </motion.div>
  );
};

const HeaderSection = ({ t }) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <motion.div
      ref={ref}
      className="col-span-full space-y-6 my-20 mx-auto text-center mb-6"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : -50 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h2
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : -50 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-4xl max-w-2xl mx-auto font-bold"
      >
        {t('headline_galleries')}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : -50 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-gray-600 max-w-5xl"
      >
        {t('headline_galleries_text')}
      </motion.p>
    </motion.div>
  );
};

const GalleryItem = ({ gallery, formatDate }) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 50 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-md my-5 overflow-hidden"
    >
      <EmblaCarousel images={gallery.image} />
      <motion.div
        className="p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <h3 className="text-lg font-semibold">{gallery.tittle}</h3>
        <p className="text-gray-500">
          {formatDate(gallery.date)}
        </p>
      </motion.div>
    </motion.div>
  );
};

const MemoizedGalleryItem = memo(GalleryItem);

const EmblaCarousel = ({ images }) => {
  const autoplay = useRef(Autoplay({ delay: 3000, stopOnInteraction: false }));
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, slidesToScroll: "auto" }, [autoplay.current]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = () => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  };

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
  }, [emblaApi]);

  return (
    <motion.div
      className="relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="embla__viewport" ref={emblaRef}>
        <div className="flex">
          {images.map((img, index) => (
            <motion.div
              key={index}
              className="relative flex-[0_0_100%] w-full h-[40rem] p-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Image
                src={img.url}
                alt={`Slide ${index + 1}`}
                layout="fill"
                loading="lazy"
                quality={100}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                objectFit="cover"
                className="rounded-lg"
              />
            </motion.div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full ${index === selectedIndex ? 'bg-gray-800' : 'bg-gray-400'}`}
            onClick={() => emblaApi && emblaApi.scrollTo(index)}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default Gallery;