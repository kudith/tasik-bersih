"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const pageVariants = {
  initial: {
    opacity: 0,
  },
  in: {
    opacity: 1,
  },
  out: {
    opacity: 0,
  },
};

const pageTransition = {
  duration: 0.5,
  ease: "easeInOut",
};

const PageTransition = ({ children }) => {
  const [displayChildren, setDisplayChildren] = useState(children);
  const { asPath } = useRouter();

  useEffect(() => {
    setDisplayChildren(children);
  }, [children]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={asPath}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        {displayChildren}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;