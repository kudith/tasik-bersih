'use client'

import { motion } from 'framer-motion';
import ChatMessage from '@/components/chat';
import { useEffect } from 'react';

export default function ChatMe() {
  // Hide footer when this page mounts
  useEffect(() => {
    // Hide footer when component mounts
    const footer = document.querySelector('footer');
    if (footer) {
      footer.style.display = 'none';
    }
    
    // Show footer when component unmounts
    return () => {
      const footer = document.querySelector('footer');
      if (footer) {
        footer.style.display = '';
      }
    };
  }, []);

  return (
    <main className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-teal-50 via-blue-50/10 to-emerald-50/50 dark:from-gray-950 dark:via-blue-950/5 dark:to-teal-950/20 mt-20">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 text-center"
        >
        <ChatMessage />
        </motion.div>
      </div>
    </main>
  )
}