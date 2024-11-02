import EventCarousel from "@/components/Events";

export default function EventPage() {
    return (
        <main
            className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <p>Event page</p>
            <EventCarousel/>
        </main>
    );
}
