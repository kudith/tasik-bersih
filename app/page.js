import Image from "next/image";
import AboutUs from "@/components/About";

export default function Home() {
    return (
        <main
            className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <AboutUs/>
        </main>
    );
}
