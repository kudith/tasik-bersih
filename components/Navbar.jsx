"use client";
import Link from "next/link";
import * as React from "react";
import {useRouter, usePathname} from "next/navigation";
import {motion, AnimatePresence} from "framer-motion";
import {
    FaBars,
    FaTimes,
} from "react-icons/fa";
import {Button} from "@/components/ui/button";
import ToggleLanguage from "@/components/ToggleLanguage";
import {useTranslation} from "react-i18next";
import {FaHandsHelping} from "react-icons/fa";

const navItems = [
    {name: "home", path: "#home"},
    {name: "about", path: "#about"},
    {name: "events", path: "#events"},
    {name: "volunteer", path: "#volunteer"},
    {name: "team", path: "/team"},
    {name: "contact", path: "/contact"},
];

const Navbar = React.memo(() => {
    const {t} = useTranslation('navbar');
    const [isOpen, setIsOpen] = React.useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const toggleMenu = React.useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);

    const handleScrollOrNavigate = React.useCallback(
        (path) => {
            const offset = 100; // Adjust offset as needed for your header height
            const basePath = pathname.startsWith("/id") ? "/id" : "";

            if (path.startsWith("#")) {
                // Smooth scroll for links on the landing page
                if (pathname === "/" || pathname === "/id") {
                    const element = document.querySelector(path);
                    if (element) {
                        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
                        const offsetPosition = elementPosition - offset;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: "smooth",
                        });
                    }
                } else {
                    // Navigate to home with language prefix first, then scroll with offset
                    router.push(`${basePath}/`);
                    setTimeout(() => {
                        const element = document.querySelector(path);
                        if (element) {
                            const elementPosition = element.getBoundingClientRect().top + window.scrollY;
                            const offsetPosition = elementPosition - offset;

                            window.scrollTo({
                                top: offsetPosition,
                                behavior: "smooth",
                            });
                        }
                    }, 100); // Adjust the timeout duration as needed
                }
            } else {
                // Navigate normally for other pages, including prefixed paths
                router.push(`${basePath}${path}`);
            }
            setIsOpen(false);
        },
        [router, pathname]
    );

    const handleDonateClick = React.useCallback(() => {
        router.push("/donate");
    }, [router]);

    return (
        <nav
            className="fixed top-0 left-0 w-full bg-white bg-opacity-30 backdrop-blur-md md:py-2 shadow-lg z-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center py-4">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/">
                            <h1 className="text-2xl font-bold text-primary font-inknut">
                                kalangsari
                                <span
                                    className="text-kalang font-bold">Pride</span>
                            </h1>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex space-x-6 items-center">
                        {navItems.map((item) => (
                            <p
                                key={item.name}
                                className="relative hover:cursor-pointer hover:no-underline after:absolute after:left-0 after:-bottom-[3px] after:h-[2px] after:w-0 after:bg-current after:transition-width after:duration-300 after:ease-in-out hover:after:w-full"
                                onClick={() => handleScrollOrNavigate(item.path)}
                            >
                                <span>{t(item.name)}</span>
                            </p>
                        ))}
                        <ToggleLanguage/>
                        <Button onClick={handleDonateClick}>
                            <FaHandsHelping className="mr-2"/>
                            {t('contribute_now')}
                        </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden gap-6 flex items-center">
                        <ToggleLanguage/>
                        <button onClick={toggleMenu}
                                className="text-black focus:outline-none">
                            {isOpen ? <FaTimes className="w-6 h-6"/> :
                                <FaBars className="w-6 h-6"/>}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu with AnimatePresence */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{opacity: 0, height: 0}}
                            animate={{opacity: 1, height: "auto"}}
                            exit={{opacity: 0, height: 0}}
                            transition={{
                                type: "spring",
                                stiffness: 80,
                                damping: 20
                            }}
                            className="md:hidden"
                        >
                            {navItems.map((item, index) => (
                                <motion.div
                                    key={item.name}
                                    initial={{x: -100, opacity: 0}}
                                    animate={{x: 0, opacity: 1}}
                                    exit={{x: -100, opacity: 0}}
                                    transition={{
                                        delay: index * 0.1,
                                        type: "spring",
                                        stiffness: 80
                                    }}
                                >
                                    <p
                                        className="flex items-center py-2 px-4 text-sm text-black hover:bg-gray-100 font-inknut cursor-pointer transition-colors duration-300"
                                        onClick={() => handleScrollOrNavigate(item.path)}
                                    >
                                        <span
                                            className="ml-2">{t(item.name)}</span>
                                    </p>
                                </motion.div>
                            ))}
                            <div className="py-2 px-4">
                                <Button className="w-full"
                                        onClick={handleDonateClick}>
                                    <FaHandsHelping className="mr-2"/>
                                    {t('contribute_now')}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
});

export default Navbar;