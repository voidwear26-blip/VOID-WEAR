
"use client"

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';

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
        {[...Array(30)].map((_, i) => (
          <motion.div 
            key={i} 
            className="particle"
            initial={{ 
              x: `${Math.random() * 100}vw`, 
              y: `${Math.random() * 100}vh`,
              opacity: 0
            }}
            animate={{ 
              y: ['0vh', '100vh'],
              opacity: [0, 0.2, 0],
            }}
            transition={{
              duration: Math.random() * 15 + 15,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 10
            }}
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
            }}
          />
        ))}
      </div>

      {/* Cinematic Solar Eclipse */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 3, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="relative w-[300px] h-[300px] md:w-[600px] md:h-[600px]">
          {/* Breathing Aura */}
          <div className="eclipse-glow" />
          
          {/* Main Eclipse Body */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 eclipse-logo"
          />
          
          {/* Subtle Outer Ring */}
          <div className="absolute inset-[-60px] border border-white/5 rounded-full" />
        </div>
      </motion.div>

      {/* Cinematic Text Content */}
      <div className="relative z-10 text-center space-y-16 max-w-4xl px-6">
        <div className="space-y-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 1.5 }}
          >
            <span className="text-[10px] md:text-xs font-bold tracking-[1em] text-white/40 uppercase">
              VOID WEAR // SYSTEM 01
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.3, duration: 1.5 }}
            className="text-7xl md:text-[10rem] font-black tracking-tighter leading-none glow-text"
          >
            VOID WEAR
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.6, duration: 1.5 }}
            className="text-xs md:text-sm text-white/40 max-w-md mx-auto tracking-[0.8em] uppercase font-light"
          >
            EMBRACE THE UNKNOWN
          </motion.p>
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 2, duration: 1.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8"
        >
          <Button asChild className="bg-white text-black hover:bg-black hover:text-white border-white border px-16 py-8 text-[10px] font-bold tracking-[0.5em] rounded-none transition-all duration-700">
            <Link href="/products">ENTER VOID</Link>
          </Button>
          <Button variant="outline" asChild className="border-white/10 text-white hover:border-white px-16 py-8 text-[10px] font-bold tracking-[0.5em] rounded-none bg-transparent transition-all duration-700">
            <Link href="/assistant">NEURAL LAB</Link>
          </Button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 2 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6"
      >
        <div className="w-px h-24 bg-gradient-to-b from-white/30 to-transparent"></div>
        <span className="text-[8px] tracking-[1.5em] text-white/20 uppercase">DESCEND</span>
      </motion.div>
    </section>
  );
}
