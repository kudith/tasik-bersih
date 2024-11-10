import Hero from "@/components/Hero";
import AboutUs from "@/components/About";
import EventCarousel from "@/components/Events";
import {VolunteerForm} from "@/components/VolunteerForm";


export default function Home() {
    return (
        <div>
            <Hero/>
            <AboutUs/>
            <EventCarousel/>
            <VolunteerForm/>
        </div>
    );
}
