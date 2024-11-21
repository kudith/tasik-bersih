"use client";
import * as React from "react";
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
import {
    CalendarIcon,
    MapPinIcon,
    ClockIcon,
} from "@heroicons/react/24/outline";
import { SkeletonEvent } from "@/components/skeleton/SkeletonEvent";
import { useInView } from "react-intersection-observer";
import useSWR from "swr";
import axios from "axios";
import { useTranslation } from "react-i18next";

const fetcher = url => axios.get(url).then(res => res.data);

const headingVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const eventItemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, ease: "easeInOut" },
    },
};


const EventItem = ({ event, index, onVolunteerClick }) => {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });
    const { t } = useTranslation();

    const imageUrls = event.image.map(img => img.url);
    const imageUrl = imageUrls.length > 0 ? imageUrls[0] : '';
    const eventDate = new Date(event.date);
    const eventTime = new Date(Date.parse(event.date));
    const formattedDate = eventDate.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
    const formattedTime = eventTime.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <CarouselItem key={event.id} className="flex-shrink-0 w-full p-6" ref={ref}>
            <motion.div
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                variants={eventItemVariants}
            >
                <Card className="overflow-hidden md:p-8 p-4">
                    <CardContent className="p-1">
                        <div className="flex flex-col md:flex-row">
                            <div className="w-full md:w-1/2 space-y-4 mb-4 md:mb-0">
                                <div className="flex items-center">
                                    <CalendarIcon className="w-5 h-5 mr-2 text-primary" />
                                    <span className="text-lg font-semibold text-primary">{formattedDate}</span>
                                </div>
                                <h3 className="text-xl font-bold text-primary mb-2">
                                    {event.event_name}
                                </h3>
                                <div className="flex items-center text-primary">
                                    <MapPinIcon className="w-5 h-5 mr-2" />
                                    <span>{event.location}</span>
                                </div>
                                <div className="flex items-center text-primary">
                                    <ClockIcon className="w-5 h-5 mr-2" />
                                    <span>{formattedTime} - Selesai</span>
                                </div>
                                <Button
                                    className="mt-4 px-4 py-2 text-white bg-primary hover:bg-black rounded-md"
                                    onClick={() => onVolunteerClick(event.event_name)}
                                >
                                    {t('volunteer_now')}
                                </Button>
                            </div>
                            <div className="w-full md:w-10/12 relative h-48 md:h-56 overflow-hidden rounded-lg">
                                <Image
                                    src={imageUrl}
                                    alt={event.event_name}
                                    fill
                                    sizes="80vw"
                                    style={{ objectFit: "cover" }}
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </CarouselItem>
    );
};

const EventCarousel = React.memo(() => {
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const locale = i18n.language;
    const plugin = React.useRef(
        Autoplay({ delay: 3000, stopOnInteraction: false }) // Set stopOnInteraction to false
    );

    const { data, error } = useSWR(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/events?locale=${locale}&populate=*`, fetcher);

    const handleVolunteerClick = React.useCallback(
        (eventName) => {
            router.push(`/#volunteer`);
        },
        [router]
    );

    if (error) return <p className="text-center text-primary">{error}</p>;
    if (!data) return <SkeletonEvent count={8} />;

    const events = data.data;

    if (!events.length)
        return <p className="text-center text-primary">No events available.</p>;

    return (
        <div id="events" className="flex flex-col items-center justify-center my-20">
            <motion.h1
                className="text-3xl font-bold mb-8 text-center text-primary"
                initial="hidden"
                animate="visible"
                variants={headingVariants}
            >
                {t('upcoming_events')}
            </motion.h1>
            <Carousel
                plugins={[plugin.current]}
                className="w-full max-w-5xl mx-auto overflow-hidden p-6"
            >
                <CarouselContent className="flex px-6">
                    {events.map((event, index) => (
                        <EventItem
                            key={event.id}
                            event={event}
                            index={index}
                            onVolunteerClick={handleVolunteerClick}
                        />
                    ))}
                </CarouselContent>
                <CarouselPrevious
                    className="absolute top-1/2 left-2 -translate-y-1/2 bg-primary text-white rounded-full p-2 shadow-md cursor-pointer hover:bg-black hover:text-white transition duration-300">
                    <span className="sr-only">Previous</span>
                    &#9664;
                </CarouselPrevious>
                <CarouselNext
                    className="absolute top-1/2 right-2 -translate-y-1/2 bg-primary text-white rounded-full p-2 shadow-md cursor-pointer hover:bg-black hover:text-white transition duration-300">
                    <span className="sr-only">Next</span>
                    &#9654;
                </CarouselNext>
            </Carousel>
        </div>
    );
});
export default EventCarousel;