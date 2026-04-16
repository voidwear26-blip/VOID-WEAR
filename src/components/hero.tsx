"use client"

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
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

  // Personalize greeting: use user email prefix if logged in
  const userGreeting = user ? (user.email?.split('@')[0].toUpperCase() || 'OPERATOR') : 'WELCOME';
  
  const content = {
    title: config?.heroTitle || 'VOID WEAR',
    subtitle: userGreeting,
    tagline: config?.heroTagline || 'EMBRACE THE UNKNOWN'
  };

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-transparent">
      {/* Cinematic Solar Eclipse */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 flex items-center justify-center z-10"
      >
        <div className="relative w-[280px] h-[280px] md:w-[450px] md:h-[450px]">
          <div className="eclipse-glow" />
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 eclipse-logo"
          />
          <div className="absolute inset-[-40px] border border-white/5 rounded-full" />
        </div>
      </motion.div>

      {/* Hero Content - significant padding-top for mobile overlap fix */}
      <div className="relative z-20 text-center space-y-12 max-w-4xl px-6 pt-64 md:pt-20">
        <div className="space-y-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 1.5 }}
          >
            <span className="text-[10px] md:text-xs font-bold tracking-[1.2em] text-white/30 uppercase">
              VOID WEAR // {content.subtitle}
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.3, duration: 1.5 }}
            className="text-4xl md:text-7xl lg:text-8xl font-black tracking-[0.2em] leading-tight glow-text uppercase"
          >
            {content.title}
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.6, duration: 1.5 }}
            className="text-[10px] md:text-xs text-white/40 max-w-md mx-auto tracking-[0.6em] uppercase font-light"
          >
            {content.tagline}
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

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 hidden md:flex"
      >
        <div className="w-px h-16 bg-gradient-to-b from-white/30 to-transparent"></div>
        <span className="text-[8px] tracking-[1.2em] text-white/10 uppercase">DESCEND</span>
      </motion.div>
    </section>
  );
}