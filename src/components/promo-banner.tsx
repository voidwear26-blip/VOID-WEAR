'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Banner = {
  url: string;
  title?: string;
  subtitle?: string;
  alignment?: 'left' | 'center' | 'right';
  textColor?: string;
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
    return [];
  }, [config]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [banners.length, nextSlide]);

  if (banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  const alignmentStyles = {
    left: 'items-start text-left pl-12 md:pl-32',
    center: 'items-center text-center',
    right: 'items-end text-right pr-12 md:pr-32',
  };

  return (
    <section className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden bg-black/5 border-y border-black/5 group/banner">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <div className="relative w-full h-full">
            <Image 
              src={currentBanner.url} 
              alt={currentBanner.title || "Promotion"} 
              fill 
              className="object-cover"
              unoptimized
              priority
            />
            {/* Minimal Subsurface Gradients for Readability */}
            <div className="absolute inset-0 bg-black/10 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

            {/* Text Content Layer */}
            <div className={cn(
              "absolute inset-0 flex flex-col justify-center px-6 transition-all duration-1000",
              alignmentStyles[currentBanner.alignment || 'center']
            )}>
              <div className="space-y-6 max-w-4xl">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="space-y-2"
                >
                  {currentBanner.subtitle && (
                    <span 
                      className="text-[10px] md:text-xs font-bold tracking-[0.8em] uppercase drop-shadow-sm"
                      style={{ color: currentBanner.textColor || '#FFFFFF' }}
                    >
                      {currentBanner.subtitle}
                    </span>
                  )}
                  {currentBanner.title && (
                    <h2 
                      className="text-4xl md:text-7xl font-black tracking-tight uppercase leading-none drop-shadow-md font-headline"
                      style={{ color: currentBanner.textColor || '#FFFFFF' }}
                    >
                      {currentBanner.title}
                    </h2>
                  )}
                </motion.div>
                
                {currentBanner.title && (
                  <motion.div 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.6, duration: 1 }}
                    className="h-[1px] w-24 opacity-60"
                    style={{ backgroundColor: currentBanner.textColor || '#FFFFFF' }}
                  />
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Manual Navigation Nodes */}
      {banners.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-40 p-4 border border-white/20 bg-white/10 backdrop-blur-md text-white opacity-0 group-hover/banner:opacity-100 transition-all hover:bg-white hover:text-black"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-40 p-4 border border-white/20 bg-white/10 backdrop-blur-md text-white opacity-0 group-hover/banner:opacity-100 transition-all hover:bg-white hover:text-black"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Progress Indicators */}
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