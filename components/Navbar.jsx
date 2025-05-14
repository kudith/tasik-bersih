"use client";
import Link from "next/link";
import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { FaBars, FaTimes } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import ToggleLanguage from "@/components/ToggleLanguage";
import { useTranslation } from "react-i18next";
import { FaHandsHelping } from "react-icons/fa";

const navItems = [
  { name: "home", path: "#home" },
  { name: "about", path: "#about" },
  { name: "events", path: "#events" },
  { name: "volunteer", path: "#volunteer" },
  { name: "chatMe", path: "/chatMe" },
  { name: "report", path: "/report" },
  { name: "contact", path: "/contact" },
];

const Navbar = React.memo(() => {
  const { t } = useTranslation('navbar');
  const [isOpen, setIsOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Track scroll position for navbar styling
  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          }, 100);
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

  const isActive = (path) => {
    if (path.startsWith('#') && (pathname === '/' || pathname === '/id')) {
      return window.location.hash === path;
    }
    return pathname === path;
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full transition-all duration-300 z-50 ${
        scrolled 
          ? "bg-white border-b border-gray-200 shadow-sm py-4" 
          : "bg-white py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <h1 className="text-2xl font-bold font-inknut bg-clip-text text-transparent bg-gradient-to-r from-kalang to-primary">
                TasikBersih
              </h1>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            {navItems.map((item) => (
              <div 
                key={item.name}
                className="relative group"
              >
                <p
                  className={`text-sm font-medium tracking-wide hover:cursor-pointer ${
                    isActive(item.path) ? 'text-primary' : 'text-gray-800 hover:text-primary'
                  } transition-colors duration-200`}
                  onClick={() => handleScrollOrNavigate(item.path)}
                >
                  {t(item.name)}
                </p>
                <div className={`absolute bottom-0 left-0 w-0 h-0.5 bg-primary transform transition-all duration-300 ease-in-out group-hover:w-full ${
                  isActive(item.path) ? 'w-full' : 'w-0'
                }`}></div>
              </div>
            ))}
            <div className="ml-2">
              <ToggleLanguage />
            </div>
            <Button 
              onClick={handleDonateClick}
              className="ml-2 bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-md transition-all duration-300 shadow-sm hover:shadow"
            >
              <FaHandsHelping className="mr-2" />
              {t('contribute_now')}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <ToggleLanguage />
            <button 
              onClick={toggleMenu}
              className="text-gray-800 focus:outline-none p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
            >
              {isOpen ? 
                <FaTimes className="w-5 h-5" /> : 
                <FaBars className="w-5 h-5" />
              }
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-[500px] opacity-100 border-t border-gray-100 mt-4" : "max-h-0 opacity-0"
          }`}
        >
          <div className="py-4 space-y-2">
            {navItems.map((item) => (
              <div
                key={item.name}
                className="transform transition-all duration-200 ease-in-out"
              >
                <p
                  className={`block py-3 px-1 text-sm font-medium ${
                    isActive(item.path) 
                      ? 'text-primary border-l-2 border-primary pl-3' 
                      : 'text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md'
                  } transition-colors duration-200`}
                  onClick={() => handleScrollOrNavigate(item.path)}
                >
                  {t(item.name)}
                </p>
              </div>
            ))}
            <div className="pt-4 pb-2 px-1">
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-white py-2.5"
                onClick={handleDonateClick}
              >
                <FaHandsHelping className="mr-2" />
                {t('contribute_now')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
});

Navbar.displayName = "Navbar";

export default Navbar;