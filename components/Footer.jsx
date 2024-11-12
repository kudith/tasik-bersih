"use client";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone } from "react-icons/fa";
import { motion } from "framer-motion";
import Link from "next/link";
import {Button} from "@/components/ui/button";

export function Footer() {
    return (
        <footer className="py-12 px-8 bg-black text-white mt-20">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* About Section */}
                <div>
                    <h2 className="text-2xl font-bold mb-4">kalangsari
                    <span className="text-kalang">Pride</span>
                    </h2>
                    <p className="text-gray-400 mb-4">
                        We are committed to making a positive impact in the community by bringing people together for meaningful causes. Join us in our mission to create a better world through service, support, and kindness.
                    </p>
                    <Link href="/about" passHref>
                        <p className="text-gray-400 hover:text-white underline">Learn more about our mission</p>
                    </Link>
                </div>

                {/* Navigation Links */}
                <div>
                    <h2 className="text-2xl font-bold mb-4">Quick Links</h2>
                    <ul className="space-y-2">
                        <li>
                            <Link href="/events" passHref>
                                <p className="hover:underline hover:text-white">Upcoming Events</p>
                            </Link>
                        </li>
                        <li>
                            <Link href="/volunteer" passHref>
                                <p className="hover:underline hover:text-white">Become a Volunteer</p>
                            </Link>
                        </li>
                        <li>
                            <Link href="/blog" passHref>
                                <p className="hover:underline hover:text-white">Our Blog</p>
                            </Link>
                        </li>
                        <li>
                            <Link href="/contact" passHref>
                                <p className="hover:underline hover:text-white">Contact Us</p>
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Contact Information */}
                <div>
                    <h2 className="text-2xl font-bold mb-4">Get In Touch</h2>
                    <p className="text-gray-400">Have questions or want to know more about our work? We’re here to help.</p>
                    <ul className="mt-4 space-y-2">
                        <li className="flex items-center space-x-2">
                            <FaEnvelope className="text-lg" />
                            <span>info@ourorganization.org</span>
                        </li>
                        <li className="flex items-center space-x-2">
                            <FaPhone className="text-lg" />
                            <span>+1 234 567 890</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Social Media & Donate */}
            <div className="mt-12 border-t border-gray-700 pt-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    {/* Social Media Icons */}
                    <div className="flex space-x-4">
                        <Link href="https://facebook.com" passHref>
                            <p target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-gray-400">
                                <FaFacebookF className="text-2xl" />
                            </p>
                        </Link>
                        <Link href="https://twitter.com" passHref>
                            <p target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-gray-400">
                                <FaTwitter className="text-2xl" />
                            </p>
                        </Link>
                        <Link href="https://instagram.com" passHref>
                            <p target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-gray-400">
                                <FaInstagram className="text-2xl" />
                            </p>
                        </Link>
                        <Link href="https://linkedin.com" passHref>
                            <p target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-gray-400">
                                <FaLinkedin className="text-2xl" />
                            </p>
                        </Link>
                    </div>

                    {/* Donate Button */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="mt-4 md:mt-0"
                    >
                        <Link href="/donate" passHref>
                            <Button className="bg-secondary text-primary py-6 rounded-lg text-lg font-semibold shadow-lg hover:bg-gray-300 transition-colors duration-300">
                                Contribute Now
                            </Button>
                        </Link>
                    </motion.div>
                </div>

                {/* Footer Bottom Text */}
                <div className="mt-8 text-center text-gray-400 text-sm">
                    &copy; {new Date().getFullYear()} kalangsariPride. All rights reserved.
                </div>
            </div>
        </footer>
    );
}