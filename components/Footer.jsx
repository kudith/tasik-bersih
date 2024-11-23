"use client";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone } from "react-icons/fa";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useInView } from 'react-intersection-observer';

export function Footer() {
    const { t } = useTranslation('footer');
    const [ref, inView] = useInView({ triggerOnce: true });

    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                staggerChildren: 0.3,
                duration: 0.8,
                ease: "easeInOut"
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.footer
            ref={ref}
            className="py-12 px-8 bg-black text-white mt-20"
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={containerVariants}
        >
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* About Section */}
                <motion.div variants={itemVariants}>
                    <h2 className="text-2xl font-bold mb-4">kalangsari
                    <span className="text-kalang">Pride</span>
                    </h2>
                    <p className="text-gray-400 mb-4">
                        {t('about_us')}
                    </p>
                    <Link href="/about" passHref>
                        <span className="text-gray-400 hover:text-white underline">{t('learn_more')}</span>
                    </Link>
                </motion.div>

                {/* Navigation Links */}
                <motion.div variants={itemVariants}>
                    <h2 className="text-2xl font-bold mb-4">{t('quick_links')}</h2>
                    <ul className="space-y-2">
                        <li>
                            <Link href="/events" passHref>
                                <span className="hover:underline hover:text-white">{t('upcoming_events')}</span>
                            </Link>
                        </li>
                        <li>
                            <Link href="/volunteer" passHref>
                                <span className="hover:underline hover:text-white">{t('become_volunteer')}</span>
                            </Link>
                        </li>
                        <li>
                            <Link href="/contact" passHref>
                                <span className="hover:underline hover:text-white">{t('contact_us')}</span>
                            </Link>
                        </li>
                    </ul>
                </motion.div>

                {/* Contact Information */}
                <motion.div variants={itemVariants}>
                    <h2 className="text-2xl font-bold mb-4">{t('get_in_touch')}</h2>
                    <p className="text-gray-400">{t('have_questions')}</p>
                    <ul className="mt-4 space-y-2">
                        <li className="flex items-center space-x-2">
                            <FaEnvelope className="text-lg" />
                            <a href="mailto:admin@kalangsaripride.social" className="hover:underline">{t('email')}</a>
                        </li>
                        <li className="flex items-center space-x-2">
                            <FaPhone className="text-lg" />
                            <span>{t('phone')}</span>
                        </li>
                    </ul>
                </motion.div>
            </div>

            {/* Social Media & Donate */}
            <motion.div
                className="mt-12 border-t border-gray-700 pt-8"
                variants={itemVariants}
            >
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    {/* Social Media Icons */}
                    <div className="flex space-x-4">
                        <Link href="https://facebook.com" passHref>
                            <span target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-gray-400">
                                <FaFacebookF className="text-2xl" />
                            </span>
                        </Link>
                        <Link href="https://twitter.com" passHref>
                            <span target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-gray-400">
                                <FaTwitter className="text-2xl" />
                            </span>
                        </Link>
                        <Link href="https://instagram.com" passHref>
                            <span target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-gray-400">
                                <FaInstagram className="text-2xl" />
                            </span>
                        </Link>
                        <Link href="https://linkedin.com" passHref>
                            <span target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-gray-400">
                                <FaLinkedin className="text-2xl" />
                            </span>
                        </Link>
                    </div>

                    {/* Donate Button */}
                    <motion.div className="mt-4 md:mt-0">
                        <Link href="/donate" passHref>
                            <span>
                                <Button className="bg-secondary text-primary py-6 rounded-lg text-lg font-semibold shadow-lg hover:bg-gray-300 transition-colors duration-300">
                                    {t('contribute_now')}
                                </Button>
                            </span>
                        </Link>
                    </motion.div>
                </div>

                {/* Footer Bottom Text */}
                <div className="mt-8 text-center text-gray-400 text-sm">
                    &copy; {new Date().getFullYear()} kalangsariPride. {t('all_rights_reserved')}
                </div>
            </motion.div>
        </motion.footer>
    );
}