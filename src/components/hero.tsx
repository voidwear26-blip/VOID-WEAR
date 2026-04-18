"use client"

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useFirestore, useDoc, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';

export function Hero() {
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const db = useFirestore();

  const configRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'app_config', 'global');
  }, [db]);

  const { data: config } = useDoc(configRef);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const greeting = user 
    ? (user.email?.split('@')[0].toUpperCase() || 'OPERATOR') 
    : 'OPERATOR';
  
  const content = {
    title: config?.heroTitle || "VOID WEAR",
    subtitle: greeting,
    tagline: config?.heroTagline || 'EMBRACE THE UNKNOWN'
  };

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-transparent">
      {/* Background Eclipse Effect */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 flex items-center justify-center z-10"
      >
        <div className="relative w-[300px] h-[300px] md:w-[600px] md:h-[600px]">
          <div className="eclipse-glow" />
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 eclipse-logo"
          />
        </div>
      </motion.div>

      <div className="relative z-20 text-center space-y-12 w-full max-w-7xl px-6 pt-32 flex flex-col items-center">
        <div className="space-y-8 flex flex-col items-center w-full">
          {/* Subtitle / Operator Tag */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 1.5 }}
          >
            <span className="text-[10px] md:text-xs font-bold tracking-[1.2em] text-white/60 uppercase">
              VOID WEAR // {content.subtitle}
            </span>
          </motion.div>
          
          {/* Massive Logo and Title */}
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.3, duration: 1.5 }}
            className="flex flex-col items-center gap-6 w-full"
          >
            <div className="relative h-[45vh] w-auto aspect-square">
              <Image 
                src="/logo.png" 
                alt="VOID WEAR LOGO" 
                fill
                className="object-contain brightness-200 grayscale opacity-90"
                priority
                unoptimized
              />
            </div>
            <div className="glow-text w-full overflow-hidden">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-[0.4em] uppercase leading-none whitespace-nowrap inline-block">
                {content.title}
              </h1>
            </div>
          </motion.div>
          
          {/* Slogan */}
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.6, duration: 1.5 }}
            className="text-[10px] md:text-xs text-white/70 max-w-2xl mx-auto tracking-[0.8em] uppercase font-light"
          >
            {content.tagline}
          </motion.p>
        </div>

        {/* Action Button */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 2, duration: 1.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8"
        >
          <Button asChild className="bg-white text-black hover:bg-black hover:text-white border-white border px-16 py-8 text-[11px] font-bold tracking-[0.6em] rounded-none transition-all duration-700 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            <Link href="/products">ENTER SYSTEM</Link>
          </Button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 hidden md:flex"
      >
        <div className="w-px h-16 bg-gradient-to-b from-white/60 to-transparent"></div>
        <span className="text-[8px] tracking-[1.2em] text-white/40 uppercase font-bold">DESCEND</span>
      </motion.div>
    </section>
  );
}
