"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

export function EventCarousel() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/events-api?populate=*`);
                const data = await response.json();
                setEvents(data.data);
                setLoading(false);
                console.log(data.data);
            } catch (error) {
                console.error("Error fetching events:", error);
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    if (loading) return <p className="text-center">Loading events...</p>;
    if (!events.length) return <p className="text-center">No events available.</p>;

    const handleVolunteerClick = (eventName) => {
        router.push(`/volunteer?event=${encodeURIComponent(eventName)}`);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-center">Upcoming Events</h1>
            <Carousel className="w-full max-w-3xl mx-auto overflow-hidden bg-gray-100 rounded-lg shadow-lg">
                <CarouselContent className="flex">
                    {events.map((event, index) => {
                        const imageUrl = `${event.image.url}`;
                        const eventDate = new Date(event.date);
                        const formattedDate = eventDate.toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                        });
                        const eventTime = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                        return (
                            <CarouselItem key={event.id} className="flex-shrink-0 w-full">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <Card className="mx-2 bg-white shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg overflow-hidden">
                                        <div className="relative w-full h-56 md:h-64 lg:h-72 overflow-hidden">
                                            <Image
                                                src={imageUrl}
                                                alt={event.event_name}
                                                layout="fill"
                                                objectFit="cover"
                                                priority={true}
                                                className="hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <CardContent className="p-4 space-y-2">
                                            <h3 className="text-xl font-semibold text-gray-800">{event.event_name}</h3>
                                            <p className="text-sm text-gray-500">
                                                <strong>Location:</strong> {event.location} | <strong>Date:</strong> {formattedDate} | <strong>Time:</strong> {eventTime}
                                            </p>
                                            <p className="text-gray-600 text-sm leading-relaxed">
                                                {event.description}
                                            </p>
                                            <Button
                                                className="mt-4 px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-300"
                                                onClick={() => handleVolunteerClick(event.event_name)}
                                            >
                                                Volunteer Now
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </CarouselItem>
                        );
                    })}
                </CarouselContent>
                <CarouselPrevious className="absolute top-1/2 left-2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-200 transition duration-300">
                    <span className="sr-only">Previous</span>
                    &#9664;
                </CarouselPrevious>
                <CarouselNext className="absolute top-1/2 right-2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-200 transition duration-300">
                    <span className="sr-only">Next</span>
                    &#9654;
                </CarouselNext>
            </Carousel>
        </div>
    );
}

export default EventCarousel;
