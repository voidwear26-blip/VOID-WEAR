
"use client"

import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

export function Hero() {
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const db = useFirestore();

  const configRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'app_config', 'global');
  }, [db]);

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: config } = useDoc(configRef);
  const { data: profile } = useDoc(profileRef);

  useEffect(() => {
    setMounted(true);
  }, []);

  const greeting = useMemo(() => {
    if (!user) return 'CUSTOMER';
    const profileName = profile?.displayName;
    const authName = user.displayName;
    const emailPrefix = user.email?.split('@')[0]?.toUpperCase() || 'CUSTOMER';
    return (profileName || authName || emailPrefix).toUpperCase();
  }, [user, profile]);
  
  const content = useMemo(() => ({
    title: config?.heroTitle || "VOID WEAR",
    subtitle: greeting,
    tagline: 'EMBRACE THE KNOWN'
  }), [config, greeting]);

  if (!mounted) return null;

  return (
    <section className="relative min-h-[90vh] md:min-h-screen w-full flex items-center justify-center overflow-hidden bg-background">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 flex items-center justify-center z-10"
      >
        <div className="relative w-[300px] h-[300px] md:w-[600px] md:h-[600px]">
          <div className="eclipse-glow" />
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 eclipse-logo border border-black/[0.05]"
          />
        </div>
      </motion.div>

      <div className="relative z-20 text-center space-y-6 w-full max-w-7xl px-6 flex flex-col items-center">
        <div className="space-y-4 flex flex-col items-center w-full">
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
          >
            <span className="text-[10px] md:text-xs font-bold tracking-[1em] text-black/60 uppercase">
              VOID WEAR // {content.subtitle}
            </span>
          </motion.div>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="flex flex-col items-center gap-4 w-full"
          >
            <div className="relative h-[100px] md:h-[18vh] w-auto aspect-square">
              <Image 
                src="/logo.png" 
                alt="VOID WEAR LOGO" 
                fill
                className="object-contain grayscale opacity-100"
                priority
                unoptimized
              />
            </div>
            <div className="w-full overflow-hidden">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-[0.4em] uppercase leading-none whitespace-nowrap inline-block text-black font-headline">
                {content.title}
              </h1>
            </div>
          </motion.div>
          
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.4, duration: 1 }}
            className="text-[10px] md:text-xs text-black/80 max-w-2xl mx-auto tracking-[0.6em] uppercase font-light"
          >
            {content.tagline}
          </motion.p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1 }}
        className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 hidden md:flex"
      >
        <div className="w-px h-12 md:h-16 bg-gradient-to-b from-black/20 to-transparent"></div>
        <span className="text-[8px] tracking-[1.2em] text-black/60 uppercase font-bold">SCROLL</span>
      </motion.div>
    </section>
  );
}
