
"use client"

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
      {/* Dynamic Background Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <motion.div 
            key={i} 
            className="particle"
            initial={{ 
              x: `${Math.random() * 100}vw`, 
              y: `${Math.random() * 100}vh`,
              opacity: 0,
              scale: 0 
            }}
            animate={{ 
              y: ['0vh', '100vh'],
              opacity: [0, 0.3, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 10
            }}
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
            }}
          />
        ))}
      </div>

      {/* Immersive Eclipse Logo */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="relative w-[280px] h-[280px] md:w-[500px] md:h-[500px]">
          {/* Main Eclipse Body */}
          <div className="absolute inset-0 eclipse-logo"></div>
          
          {/* Pulsing Corona */}
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute -inset-10 bg-white/5 rounded-full blur-[80px]"
          />
          
          {/* Orbiting Ring */}
          <div className="absolute inset-[-40px] border border-white/5 rounded-full animate-rotate-slow">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_10px_white]"></div>
          </div>
        </div>
      </motion.div>

      {/* Cinematic Text Content */}
      <div className="relative z-10 text-center space-y-12 max-w-4xl px-6">
        <div className="space-y-6">
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="text-[10px] md:text-xs font-medium wide-tracking text-white/40 uppercase"
          >
            VOID WEAR / SERIES 01
          </motion.h2>
          
          <motion.h1 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2, duration: 1.2 }}
            className="text-6xl md:text-9xl font-black tracking-tighter leading-none glow-text font-headline"
          >
            VOID WEAR
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.4, duration: 1 }}
            className="text-xs md:text-sm text-white/40 max-w-md mx-auto thin-tracking uppercase font-light leading-relaxed"
          >
            EMBRACE THE UNKNOWN
          </motion.p>
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.8, duration: 1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8"
        >
          <Button asChild className="bg-white text-black hover:bg-black hover:text-white border-white border px-12 py-8 text-[10px] font-bold tracking-[0.4em] rounded-none transition-all duration-500">
            <Link href="/products">ENTER VOID</Link>
          </Button>
          <Button variant="outline" asChild className="border-white/20 text-white hover:bg-white hover:text-black px-12 py-8 text-[10px] font-bold tracking-[0.4em] rounded-none bg-transparent transition-all duration-500">
            <Link href="/assistant">NEURAL LAB</Link>
          </Button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
      >
        <div className="w-[1px] h-16 bg-gradient-to-b from-white/40 to-transparent"></div>
        <span className="text-[8px] tracking-[1em] text-white/20 uppercase">DESCEND</span>
      </motion.div>
    </section>
  );
}
