
"use client"

import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate a stable set of stars to avoid hydration issues and excessive re-renders
  const stars = useMemo(() => {
    return [...Array(80)].map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      duration: Math.random() * 20 + 20,
      delay: Math.random() * -20,
      opacity: Math.random() * 0.5 + 0.2
    }));
  }, []);

  if (!mounted) return null;

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-[#000000]">
      {/* Immersive Space Environment */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Deep Space Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.03)_0%,_transparent_70%)]" />
        
        {/* Moving Starfield */}
        {stars.map((star) => (
          <motion.div 
            key={star.id} 
            className="absolute rounded-full bg-white"
            initial={{ 
              left: `${star.x}%`, 
              top: `${star.y}%`,
              opacity: 0,
              scale: 0.5
            }}
            animate={{ 
              top: [`${star.y}%`, `${star.y - 20}%`],
              opacity: [0, star.opacity, 0],
              scale: [0.5, 1, 0.5]
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              ease: "linear",
              delay: star.delay
            }}
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              boxShadow: star.size > 1.5 ? '0 0 10px rgba(255,255,255,0.5)' : 'none'
            }}
          />
        ))}
      </div>

      {/* Cinematic Solar Eclipse */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 flex items-center justify-center z-10"
      >
        <div className="relative w-[280px] h-[280px] md:w-[500px] md:h-[500px]">
          {/* Breathing Aura */}
          <div className="eclipse-glow" />
          
          {/* Main Eclipse Body */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 eclipse-logo"
          />
          
          {/* Subtle Outer Orbital Ring */}
          <div className="absolute inset-[-40px] border border-white/5 rounded-full" />
        </div>
      </motion.div>

      {/* Cinematic Text Content - Adjusted positioning to avoid header collision */}
      <div className="relative z-20 text-center space-y-12 max-w-4xl px-6 mt-20">
        <div className="space-y-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 1.5 }}
          >
            <span className="text-[10px] md:text-xs font-bold tracking-[1.2em] text-white/30 uppercase">
              VOID WEAR // SYSTEM 01
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.3, duration: 1.5 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-[0.2em] leading-tight glow-text uppercase"
          >
            VOID WEAR
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.6, duration: 1.5 }}
            className="text-[10px] md:text-xs text-white/40 max-w-md mx-auto tracking-[0.6em] uppercase font-light"
          >
            EMBRACE THE UNKNOWN
          </motion.p>
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 2, duration: 1.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-12"
        >
          <Button asChild className="bg-white text-black hover:bg-black hover:text-white border-white border px-12 py-7 text-[10px] font-bold tracking-[0.5em] rounded-none transition-all duration-700">
            <Link href="/products">ENTER VOID</Link>
          </Button>
          <Button variant="outline" asChild className="border-white/10 text-white hover:border-white px-12 py-7 text-[10px] font-bold tracking-[0.5em] rounded-none bg-transparent transition-all duration-700">
            <Link href="/assistant">NEURAL LAB</Link>
          </Button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
      >
        <div className="w-px h-16 bg-gradient-to-b from-white/30 to-transparent"></div>
        <span className="text-[8px] tracking-[1.2em] text-white/10 uppercase">DESCEND</span>
      </motion.div>
    </section>
  );
}
