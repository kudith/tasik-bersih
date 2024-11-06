"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
export default function AboutUs() {
    const { locale } = useRouter(); // Dapatkan locale saat ini
    const [aboutData, setAboutData] = useState(null);

    useEffect(() => {
        // Mengambil data dari API Strapi sesuai locale yang dipilih
        const fetchAboutData = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/about-us`
                );
                const data = await response.json();
                setAboutData(data.data);
            } catch (error) {
                console.error('Error fetching About Us data:', error);
            }
        };

        fetchAboutData();
    }, [locale]);

    if (!aboutData) return <p>Loading...</p>;

    return (
        <section className="p-6 max-w-3xl mx-auto bg-white shadow-md rounded-lg text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">{aboutData.title || 'Who We Are'}</h2>
            <p className="text-gray-700 mb-6">{aboutData.who_we_are}</p>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">{aboutData.vision_title || 'Our Vision'}</h3>
            <p className="text-gray-700 mb-6">{aboutData.vision}</p>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">{aboutData.mission_title || 'Our Mission'}</h3>
            <p className="text-gray-700">{aboutData.mission}</p>
        </section>
    );
}
