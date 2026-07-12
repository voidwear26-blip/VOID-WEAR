'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import Image from 'next/image';

export function PromoBanner() {
  const db = useFirestore();
  const [currentIndex, setCurrentIndex] = useState(0);

  const configRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'app_config', 'global');
  }, [db]);

  const { data: config } = useDoc(configRef);
  const images = config?.promoImages || [];

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images]);

  if (images.length === 0) return null;

  return (
    <section className="relative w-full h-[50vh] overflow-hidden bg-black/5 border-y border-black/5">
      <AnimatePresence mode="wait">
        <motion.div
          key={images[currentIndex]}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <Image 
            src={images[currentIndex]} 
            alt="Promotion" 
            fill 
            className="object-cover grayscale opacity-90"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/20 to-transparent pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {images.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setCurrentIndex(i)}
            className={`h-1 transition-all duration-700 ${currentIndex === i ? 'w-12 bg-black' : 'w-4 bg-black/10'}`}
          />
        ))}
      </div>

      <div className="absolute top-10 left-10 z-20 pointer-events-none">
         <span className="text-[10px] font-black tracking-[1.2em] text-black/20 uppercase">PROMOTION_LOG</span>
      </div>
    </section>
  );
}
