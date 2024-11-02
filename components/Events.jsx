"use client";
import {useState, useEffect} from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import {motion} from "framer-motion";

const EventCarousel = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch event data from Strapi
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/events-api`);
                const data = await response.json();
                setEvents(data.data);
                setLoading(false);
                console.log(data.data)
            } catch (error) {
                console.error("Error fetching events:", error);
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    if (loading) return <p>Loading events...</p>;
    if (!events.length) return <p>No events available.</p>;

    return (
        <Carousel
            className="relative w-full overflow-hidden bg-gray-100 shadow-lg rounded-md">
            <CarouselContent className="flex">
                {events.map((event, index) => (
                    <CarouselItem key={event.id}
                                  className="flex-shrink-0 w-full">
                        <motion.div
                            className="p-6 md:p-10 flex flex-col md:flex-row bg-white rounded-lg shadow-lg space-y-4 md:space-y-0 md:space-x-8"
                            initial={{opacity: 0, scale: 0.95}}
                            animate={{opacity: 1, scale: 1}}
                            transition={{duration: 0.5, delay: index * 0.1}}
                        >
                            <Image
                                src={event.event_img}
                                alt={event.event_name}
                                width={500}
                                height={300}
                                className="rounded-lg object-cover w-full h-48 md:w-1/2 md:h-auto"
                            />
                            <div
                                className="flex flex-col justify-between w-full">
                                <h3 className="text-xl font-semibold text-primary">{event.event_name}</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    <strong>Location:</strong> {event.location} | <strong>Date:</strong>{" "}
                                    {new Date(event.date).toLocaleDateString()}
                                </p>
                                <p className="mt-2 text-gray-700">{event.description}</p>
                                <button
                                    className="mt-4 self-start px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700">
                                    Learn More
                                </button>
                            </div>
                        </motion.div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious
                className="absolute top-1/2 left-0 p-2 transform -translate-y-1/2 text-gray-700 bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-200">
                <span className="sr-only">Previous</span>
                &#9664;
            </CarouselPrevious>
            <CarouselNext
                className="absolute top-1/2 right-0 p-2 transform -translate-y-1/2 text-gray-700 bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-200">
                <span className="sr-only">Next</span>
                &#9654;
            </CarouselNext>
        </Carousel>
    );
};

export default EventCarousel;
