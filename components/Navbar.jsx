"use client";
import Link from "next/link";
import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBars,
  FaTimes,
  FaHome,
  FaInfoCircle,
  FaCalendarAlt,
} from "react-icons/fa";
import { RiTeamFill } from "react-icons/ri";
import { MdVolunteerActivism } from "react-icons/md";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Home", path: "/", icon: <FaHome /> },
  { name: "About", path: "#about", icon: <FaInfoCircle /> },
  { name: "Events", path: "/events", icon: <FaCalendarAlt /> },
  { name: "Volunteer", path: "/volunteer", icon: <MdVolunteerActivism /> },
  { name: "Team", path: "/team", icon: <RiTeamFill /> },
];

const Navbar = React.memo(() => {
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();

  const toggleMenu = React.useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleLinkClick = React.useCallback((path) => {
    router.push(path);
    setIsOpen(false);
  }, [router]);

  const handleDonateClick = React.useCallback(() => {
    router.push("/donate");
  }, [router]);

  return (
    <nav className="fixed top-0 left-0 w-full bg-white bg-opacity-30 backdrop-blur-md md:py-2 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <h1 className="text-2xl font-bold text-primary font-inknut">
                kalangsariPride
              </h1>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 items-center">
            {navItems.map((item) => (
              <Link key={item.name} href={item.path}>
                <p className="flex items-center space-x-1 text-black hover:text-gray-500 font-inknut transition-colors duration-300">
                  {item.icon}
                  <span>{item.name}</span>
                </p>
              </Link>
            ))}
            <Button onClick={handleDonateClick}>Contribute Now</Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={toggleMenu} className="text-black focus:outline-none">
              {isOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu with AnimatePresence */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring", stiffness: 80, damping: 20 }}
              className="md:hidden"
            >
              {navItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -100, opacity: 0 }}
                  transition={{ delay: index * 0.1, type: "spring", stiffness: 80 }}
                >
                  <p
                    className="flex items-center py-2 px-4 text-sm text-black hover:bg-gray-100 font-inknut cursor-pointer transition-colors duration-300"
                    onClick={() => handleLinkClick(item.path)}
                  >
                    {item.icon}
                    <span className="ml-2">{item.name}</span>
                  </p>
                </motion.div>
              ))}
              <div className="py-2 px-4">
                <Button className="w-full" onClick={handleDonateClick}>Contribute Now</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
});

export default Navbar;