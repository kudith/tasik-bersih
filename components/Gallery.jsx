"use client";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Image from "next/legacy/image";
import { useTranslation } from "react-i18next";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { SkeletonGallery } from "@/components/skeleton/SkeletonGallery"; // Import SkeletonGallery

const Gallery = () => {
  const [galleries, setGalleries] = useState([]);
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true); // State for loading

  useEffect(() => {
    const fetchGalleries = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/galleries?populate=*`
        );
        setGalleries(response.data.data);
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error("Error fetching galleries:", error);
        setLoading(false); // Set loading to false in case of error
      }
    };

    fetchGalleries();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(i18n.language, options);
  };

  if (loading) {
    return <SkeletonGallery />; // Show SkeletonGallery while loading
  }

  return (
    <div className="grid grid-cols-1 mx-auto max-w-7xl md:my-10 sm:grid-cols-2 md:grid-cols- gap-6 p-4">
      <div className="col-span-full space-y-6 my-20 mx-auto text-center mb-6">
        <h2 className="text-4xl max-w-2xl mx-auto font-bold">Taking Action to Reduce Pollution and Protect Our Local Ecosystem.</h2>
        <p className="text-gray-600 max-w-5xl">
          Discover the efforts of our community as we join hands to clean our environment. From riverbanks to narrow alleys, these moments reflect our dedication to creating a cleaner and healthier environment for everyone.
        </p>
      </div>
      {galleries.map((gallery) => (
        <div
          key={gallery.id}
          className="bg-white rounded-lg shadow-md my-5 overflow-hidden"
        >
          <EmblaCarousel images={gallery.image} />
          <div className="p-4">
            <h3 className="text-lg font-semibold">{gallery.tittle}</h3>
            <p className="text-gray-500">
              {formatDate(gallery.date)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

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
    <div className="relative overflow-hidden">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="flex">
          {images.map((img, index) => (
            <div
              key={index}
              className="relative flex-[0_0_100%] w-full h-[28rem] p-1"
            >
              <Image
                src={img.url}
                alt={`Slide ${index + 1}`}
                layout="fill"
                loading={index === 0 ? "eager" : "lazy"}
                quality={100}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                objectFit="cover"
                className="rounded-lg"
              />
            </div>
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
    </div>
  );
};

export default Gallery;