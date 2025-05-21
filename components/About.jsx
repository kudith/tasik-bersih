"use client";
import { motion } from "framer-motion";
import { useInView } from 'react-intersection-observer';
import * as React from "react";
import { useTranslation } from "react-i18next";
import { 
  FaUsers, 
  FaBullseye, 
  FaLightbulb, 
  FaHandsHelping,
  FaLeaf,
  FaRecycle,
  FaWater,
  FaMapMarkedAlt,
  FaHandHoldingHeart,
  FaCalendarAlt,
  FaImages,
  FaRobot
} from "react-icons/fa";
import { useRouter } from "next/navigation";

const AboutUs = React.memo(() => {
    const { t } = useTranslation();
    const router = useRouter();

    // Animasi untuk setiap bagian
    const [refHeader, inViewHeader] = useInView({ triggerOnce: true, threshold: 0.1 });
    const [refWhoWeAre, inViewWhoWeAre] = useInView({ triggerOnce: true, threshold: 0.1 });
    const [refMission, inViewMission] = useInView({ triggerOnce: true, threshold: 0.1 });
    const [refVision, inViewVision] = useInView({ triggerOnce: true, threshold: 0.1 });
    const [refFeatures, inViewFeatures] = useInView({ triggerOnce: true, threshold: 0.1 });

    // Data konten TasikBersih
    const tasikBersihData = {
        who_we_are: "TasikBersih adalah platform digital yang didedikasikan untuk meningkatkan kesadaran dan partisipasi masyarakat dalam menjaga kebersihan lingkungan Kota Tasikmalaya. Melalui website ini, masyarakat, terutama mahasiswa dan relawan, dapat berkolaborasi dalam berbagai kegiatan kebersihan yang diselenggarakan, seperti pembersihan sampah di area umum, sungai, dan danau.",
        
        mission: "Misi kami adalah memfasilitasi kolaborasi masyarakat dalam menjaga kebersihan Kota Tasikmalaya melalui teknologi digital. Kami bertujuan untuk menyediakan platform yang memudahkan pelaporan lokasi tercemar, koordinasi kegiatan kebersihan, dan pengelolaan sumber daya untuk aksi nyata pelestarian lingkungan.",
        
        vision: "Kami memimpikan Kota Tasikmalaya yang bersih, hijau, dan berkelanjutan melalui partisipasi aktif generasi muda. TasikBersih bertujuan menciptakan ekosistem digital yang menghubungkan relawan, donatur, dan masyarakat umum dalam gerakan peduli lingkungan yang terkoordinasi dan berdampak nyata."
    };

    // Fitur utama website
    const features = [
        {
            icon: <FaUsers />,
            title: "Pendaftaran Relawan",
            description: "Mendaftar dan berpartisipasi dalam kegiatan kebersihan yang diselenggarakan di berbagai lokasi."
        },
        {
            icon: <FaMapMarkedAlt />,
            title: "Laporan Lokasi Tercemar",
            description: "Melaporkan lokasi yang tercemar dengan detail dan gambar untuk tindak lanjut."
        },
        {
            icon: <FaHandHoldingHeart />,
            title: "Sistem Donasi",
            description: "Berkontribusi melalui donasi uang atau barang untuk mendukung kegiatan kebersihan."
        },
        {
            icon: <FaCalendarAlt />,
            title: "Jadwal Kegiatan",
            description: "Informasi lengkap tentang kegiatan kebersihan mendatang yang dapat diikuti."
        },
        {
            icon: <FaImages />,
            title: "Dokumentasi Kegiatan",
            description: "Galeri foto dan laporan kegiatan yang telah dilaksanakan sebelumnya."
        },
        {
            icon: <FaRobot />,
            title: "Chatbot Bantuan",
            description: "Asisten virtual untuk menjawab pertanyaan dan membantu navigasi website."
        }
    ];

    return (
        <section id="tentang" className="py-20">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header Section */}
                <motion.div
                    ref={refHeader}
                    initial={{ opacity: 0, y: 30 }}
                    animate={inViewHeader ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <div className="inline-block mb-3">
                        <span className="text-sm font-medium px-4 py-1 rounded-full">Tentang Platform Kami</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Mengenal <span>TasikBersih</span>
                    </h2>
                    <div className="w-24 h-1 mx-auto mb-8 rounded-full"></div>
                </motion.div>

                {/* Siapa Kami */}
                <motion.div
                    className="bg-white rounded-xl shadow-xl overflow-hidden mb-20"
                    ref={refWhoWeAre}
                    initial={{ opacity: 0, y: 40 }}
                    animate={inViewWhoWeAre ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="p-8 md:p-12 flex flex-col justify-center">
                            <h3 className="text-2xl md:text-3xl font-bold mb-6">Siapa Kami?</h3>
                            <p className="leading-relaxed">{tasikBersihData.who_we_are}</p>
                            <div className="flex flex-wrap gap-3 mt-6">
                                <span className="text-xs font-medium px-3 py-1 rounded-full flex items-center">
                                    <FaLeaf className="mr-1" size={12} /> Pelestarian Lingkungan
                                </span>
                                <span className="text-xs font-medium px-3 py-1 rounded-full flex items-center">
                                    <FaUsers className="mr-1" size={12} /> Partisipasi Komunitas
                                </span>
                                <span className="text-xs font-medium px-3 py-1 rounded-full flex items-center">
                                    <FaHandsHelping className="mr-1" size={12} /> Kolaborasi Digital
                                </span>
                            </div>
                        </div>
                        <div className="p-12 flex items-center justify-center">
                            <div className="text-center">
                                <FaWater className="w-24 h-24 mx-auto mb-6" />
                                <h4 className="text-xl font-semibold">Kebersihan Kota Tasikmalaya</h4>
                                <p className="mt-2">Bersama-sama untuk lingkungan yang lebih baik</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Misi & Visi */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                    {/* Misi Card */}
                    <motion.div
                        className="bg-white rounded-xl shadow-xl overflow-hidden h-full"
                        ref={refMission}
                        initial={{ opacity: 0, x: -40 }}
                        animate={inViewMission ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        <div className="py-6 px-8">
                            <div className="flex items-center">
                                <div className="p-3 rounded-lg mr-4">
                                    <FaBullseye className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold">Misi Kami</h3>
                            </div>
                        </div>
                        <div className="p-8">
                            <p className="leading-relaxed">
                                {tasikBersihData.mission}
                            </p>
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <div className="flex items-center mb-4">
                                    <div className="p-2 rounded-md mr-4">
                                        <FaHandsHelping className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Kolaborasi Aktif</h4>
                                        <p className="text-sm">Menghubungkan relawan dan komunitas</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <div className="p-2 rounded-md mr-4">
                                        <FaLeaf className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Aksi Nyata</h4>
                                        <p className="text-sm">Kegiatan kebersihan yang berdampak</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Visi Card */}
                    <motion.div
                        className="bg-white rounded-xl shadow-xl overflow-hidden h-full"
                        ref={refVision}
                        initial={{ opacity: 0, x: 40 }}
                        animate={inViewVision ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        <div className="py-6 px-8">
                            <div className="flex items-center">
                                <div className="p-3 rounded-lg mr-4">
                                    <FaLightbulb className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold">Visi Kami</h3>
                            </div>
                        </div>
                        <div className="p-8">
                            <p className="leading-relaxed">
                                {tasikBersihData.vision}
                            </p>
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <div className="flex items-center mb-4">
                                    <div className="p-2 rounded-md mr-4">
                                        <FaRecycle className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Kota Berkelanjutan</h4>
                                        <p className="text-sm">Tasikmalaya yang bersih dan hijau</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <div className="p-2 rounded-md mr-4">
                                        <FaUsers className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Generasi Peduli</h4>
                                        <p className="text-sm">Melibatkan anak muda dalam aksi lingkungan</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Fitur Kami */}
                <motion.div
                    ref={refFeatures}
                    initial={{ opacity: 0, y: 40 }}
                    animate={inViewFeatures ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="mb-12"
                >
                    <div className="text-center mb-12">
                        <h3 className="text-3xl font-bold mb-4">
                            Layanan Kami di <span>TasikBersih</span>
                        </h3>
                        <p className="max-w-2xl mx-auto">
                            TasikBersih menawarkan berbagai layanan interaktif yang dirancang untuk mendorong partisipasi masyarakat dalam menjaga kebersihan dan kelestarian lingkungan. Bergabunglah dengan kami untuk menciptakan dampak positif di Kota Tasikmalaya.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={inViewFeatures ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 group"
                            >
                                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                                    {React.cloneElement(feature.icon, { className: "w-6 h-6" })}
                                </div>
                                <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                                <p>{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="text-center mt-16 rounded-2xl p-8 md:p-12 shadow-xl"
                >
                    <h3 className="text-2xl md:text-3xl font-bold mb-4">Bergabunglah dengan Gerakan TasikBersih</h3>
                    <p className="mb-8 max-w-2xl mx-auto">
                        Jadilah bagian dari perubahan positif. Daftarkan diri Anda sebagai relawan, laporkan lokasi tercemar, atau berikan donasi untuk mendukung kegiatan kebersihan Kota Tasikmalaya.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button 
                        onClick={() => {
                            router.push("/volunteer");
                        }}
                        className="font-medium px-6 py-3 rounded-lg transition-colors duration-300 shadow-md">
                            Daftar Sebagai Relawan
                        </button>
                        <button 
                        onClick={() => {
                            router.push("/report");
                        }}
                        className="border font-medium px-6 py-3 rounded-lg transition-colors duration-300 shadow-md">
                            Laporkan Lokasi
                        </button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
});

AboutUs.displayName = "AboutUs";

export default AboutUs;