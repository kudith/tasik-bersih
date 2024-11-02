"use client"
import { useEffect, useState } from 'react';

export default function AboutUs() {
    const [aboutData, setAboutData] = useState(null);

    useEffect(() => {
        // Fetching data from Strapi's About Us API
        const fetchAboutData = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/about-us`);
                const data = await response.json();
                setAboutData(data.data);
                console.log(data)
                console.log(data.data)
            } catch (error) {
                console.error('Error fetching About Us data:', error);
            }
        };

        fetchAboutData();
    }, []);

    if (!aboutData) return <p>Loading...</p>;

    return (
        <section className="p-6 max-w-3xl mx-auto bg-white shadow-md rounded-lg text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Who We Are</h2>
            <p className="text-gray-700 mb-6">{aboutData.who_we_are}</p>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Vision</h3>
            <p className="text-gray-700 mb-6">{aboutData.vision}</p>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h3>
            <p className="text-gray-700">{aboutData.mission}</p>
        </section>
    );
}
