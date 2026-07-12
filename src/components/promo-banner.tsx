'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type Banner = {
  url: string;
  title?: string;
  subtitle?: string;
  alignment?: 'left' | 'center' | 'right';
};

export function PromoBanner() {
  const db = useFirestore();
  const [currentIndex, setCurrentIndex] = useState(0);

  const configRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'app_config', 'global');
  }, [db]);

  const { data: config } = useDoc(configRef);
  
  const banners: Banner[] = useMemo(() => {
    if (config?.promoBanners) return config.promoBanners;
    if (config?.promoImages) {
      return config.promoImages.map((url: string) => ({
        url,
        title: '',
        subtitle: '',
        alignment: 'center'
      }));
    }
    return [];
  }, [config]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners]);

  if (banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  const alignmentStyles = {
    left: 'items-start text-left pl-12 md:pl-32',
    center: 'items-center text-center',
    right: 'items-end text-right pr-12 md:pr-32',
  };

  return (
    <section className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden bg-black/5 border-y border-black/5">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <div className="relative w-full h-full">
            <Image 
              src={currentBanner.url} 
              alt={currentBanner.title || "Promotion"} 
              fill 
              className="object-cover grayscale brightness-75 md:brightness-90"
              unoptimized
              priority
            />
            {/* Cinematic Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-background/40 pointer-events-none" />

            {/* Text Content Layer */}
            <div className={cn(
              "absolute inset-0 flex flex-col justify-center px-6 transition-all duration-1000",
              alignmentStyles[currentBanner.alignment || 'center']
            )}>
              <div className="space-y-6 max-w-4xl">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="space-y-2"
                >
                  {currentBanner.subtitle && (
                    <span className="text-[10px] md:text-xs font-bold tracking-[0.8em] text-white uppercase drop-shadow-lg">
                      {currentBanner.subtitle}
                    </span>
                  )}
                  {currentBanner.title && (
                    <h2 className="text-4xl md:text-7xl font-black tracking-tight text-white uppercase leading-none drop-shadow-2xl font-headline">
                      {currentBanner.title}
                    </h2>
                  )}
                </motion.div>
                
                {currentBanner.title && (
                  <motion.div 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8, duration: 1 }}
                    className="h-[1px] w-24 bg-white/60"
                  />
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
        {banners.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setCurrentIndex(i)}
            className={`h-1 transition-all duration-700 ${currentIndex === i ? 'w-16 bg-white' : 'w-6 bg-white/20'}`}
          />
        ))}
      </div>

      <div className="absolute top-10 left-10 z-30 pointer-events-none hidden md:block">
         <span className="text-[10px] font-black tracking-[1.2em] text-white/30 uppercase">SYSTEM_BROADCAST</span>
      </div>
    </section>
  );
}
