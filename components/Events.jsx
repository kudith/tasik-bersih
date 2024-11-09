"use client";
import * as React from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { motion } from "framer-motion";
import { CalendarIcon, MapPinIcon, ClockIcon } from "@heroicons/react/24/outline";
import { SkeletonEvent } from "@/components/skeleton/SkeletonEvent";

const fetcher = (url) => fetch(url).then((res) => res.json());

const EventCarousel = React.memo(() => {
  const router = useRouter();
  const plugin = React.useRef(Autoplay({ delay: 3000, stopOnInteraction: true }));
  const { data, error } = useSWR(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/events-api?populate=*`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const handleVolunteerClick = React.useCallback((eventName) => {
    router.push(`/volunteer?event=${encodeURIComponent(eventName)}`);
  }, [router]);

  if (error) return <p className="text-center">Failed to load events.</p>;
  if (!data) return <SkeletonEvent />;

  const events = data.data;
  if (!events.length) return <p className="text-center">No events available.</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-teal-700 text-center">Upcoming Events</h1>
      <Carousel
        plugins={[plugin.current]}
        className="w-full max-w-4xl mx-auto overflow-hidden"
        onMouseEnter={() => plugin.current.stop()}
        onMouseLeave={() => plugin.current.reset()}
      >
        <CarouselContent className="flex px-4">
          {events.map((event, index) => {
            const imageUrl = `${event.image.url}`;
            const eventDate = new Date(event.date);
            const formattedDate = eventDate.toLocaleDateString("en-US", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            });
            const eventTime = eventDate.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <CarouselItem key={event.id} className="flex-shrink-0 w-full p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: "easeInOut", delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-1/2 space-y-4 mb-4 md:mb-0">
                          <div className="flex items-center text-teal-700">
                            <CalendarIcon className="w-5 h-5 mr-2" />
                            <span className="text-lg font-semibold">{formattedDate}</span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-800 mb-2">{event.event_name}</h3>
                          <div className="flex items-center text-gray-600">
                            <MapPinIcon className="w-5 h-5 mr-2" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <ClockIcon className="w-5 h-5 mr-2" />
                            <span>{eventTime} - Selesai</span>
                          </div>
                          <Button
                            className="mt-4 px-4 py-2 text-white bg-teal-700 hover:bg-teal-800 rounded-md"
                            onClick={() => handleVolunteerClick(event.event_name)}
                          >
                            Volunteer Now
                          </Button>
                        </div>
                        <div className="w-full md:w-1/2 relative h-48 md:h-auto overflow-hidden rounded-lg">
                          <Image
                            src={imageUrl}
                            alt={event.event_name}
                            fill
                            sizes="50vw"
                            priority={index === 0}
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="absolute top-1/2 left-2 -translate-y-1/2 bg-teal-700 text-white rounded-full p-2 shadow-md cursor-pointer hover:bg-teal-800 transition duration-300">
          <span className="sr-only">Previous</span>
          &#9664;
        </CarouselPrevious>
        <CarouselNext className="absolute top-1/2 right-2 -translate-y-1/2 bg-teal-700 text-white rounded-full p-2 shadow-md cursor-pointer hover:bg-teal-800 transition duration-300">
          <span className="sr-only">Next</span>
          &#9654;
        </CarouselNext>
      </Carousel>
    </div>
  );
});

export default EventCarousel;