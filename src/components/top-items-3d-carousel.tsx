'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductCard } from '@/components/product-card';
import { cn } from '@/lib/utils';
import { Zap, Info, ChevronRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface TopItems3DCarouselProps {
  products: any[];
}

/**
 * STACKED CARD INTERFACE
 * Layered module configuration with physical offsets and 5-second timed transitions.
 * Enhanced tilt and proportions to prevent subject cropping.
 */
export function TopItems3DCarousel({ products }: TopItems3DCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const n = products.length;

  useEffect(() => {
    if (isHovering || n <= 1) return;
    
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % n);
    }, 5000); 
    
    return () => clearInterval(interval);
  }, [isHovering, n]);

  if (n === 0) return null;

  const activeProduct = products[activeIndex];

  // Logic to determine stack order
  const getStackIndex = (idx: number) => {
    return (idx - activeIndex + n) % n;
  };

  return (
    <div className="grid lg:grid-cols-12 gap-16 md:gap-24 items-center">
      {/* Left Node: Stacked Interaction */}
      <div className="lg:col-span-7 relative h-[700px] flex items-center justify-center overflow-visible">
        <div 
          className="relative w-[300px] md:w-[400px] h-[600px]"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <AnimatePresence initial={false}>
            {products.map((product, idx) => {
              const stackIdx = getStackIndex(idx);
              // Only show the top 3 cards to keep the UI clean
              const isVisible = stackIdx < 3;
              
              if (!isVisible) return null;

              return (
                <motion.div
                  key={product.id}
                  initial={false}
                  animate={{
                    scale: 1 - stackIdx * 0.08,
                    y: stackIdx * 15,
                    x: stackIdx * 60,
                    rotate: stackIdx * 12,
                    zIndex: n - stackIdx,
                    opacity: 1 - stackIdx * 0.25,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 25
                  }}
                  style={{
                    transformStyle: 'preserve-3d',
                    transformOrigin: 'bottom center',
                  }}
                  onClick={() => setActiveIndex(idx)}
                  className={cn(
                    "absolute inset-0 cursor-pointer transition-shadow duration-500",
                    stackIdx === 0 ? "shadow-[0_40px_120px_rgba(0,0,0,0.15)]" : "shadow-md"
                  )}
                >
                  <div className={cn(
                    "w-full h-full bg-white border border-black/5 overflow-hidden",
                    stackIdx !== 0 && "pointer-events-none" // Only the top card allows internal interaction
                  )}>
                    <ProductCard product={product} className="h-full" />
                  </div>
                  
                  {/* Interaction Overlay for back cards */}
                  {stackIdx !== 0 && (
                    <div className="absolute inset-0 bg-transparent z-50" />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        
        {/* Ground Depth Glow */}
        <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 w-[600px] h-[120px] bg-black/[0.03] blur-3xl rounded-full pointer-events-none" />
      </div>

      {/* Right Node: Narrative */}
      <div className="lg:col-span-5 space-y-12">
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeProduct.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none font-headline break-words text-black">
                  {activeProduct.name}
                </h2>
                <p className="text-[10px] font-bold tracking-[0.4em] text-black/60 uppercase">
                  {activeProduct.category}
                </p>
              </div>

              <div className="h-px bg-black/10 w-24" />

              <div className="space-y-6">
                <div className="flex items-center gap-3 text-black/40">
                   <Info className="w-3.5 h-3.5" />
                   <span className="text-[9px] font-bold tracking-[0.4em] uppercase">DESCRIPTION</span>
                </div>
                <p className="text-lg md:text-xl font-light tracking-widest leading-relaxed uppercase text-black/80">
                  {activeProduct.topItemDescription || activeProduct.description}
                </p>
              </div>

              <div className="pt-6">
                <Link href={`/products/${activeProduct.id}`}>
                  <motion.button 
                    whileHover={{ x: 10 }}
                    className="group flex items-center gap-4 text-[10px] font-black tracking-[0.8em] text-black uppercase"
                  >
                    VIEW PRODUCT
                    <div className="w-12 h-[1px] bg-black/20 group-hover:w-20 transition-all duration-500" />
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Stack Navigation Control */}
        <div className="flex items-center gap-8 pt-12 border-t border-black/5">
          <div className="flex gap-3">
            {products.map((_, i) => (
              <button 
                key={i}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  "h-[2px] transition-all duration-700",
                  activeIndex === i ? "w-12 bg-black" : "w-4 bg-black/10 hover:bg-black/30"
                )}
              />
            ))}
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
             <button 
               onClick={() => setActiveIndex(prev => (prev - 1 + n) % n)}
               className="p-2 text-black/20 hover:text-black transition-colors"
             >
                <ChevronLeft className="w-5 h-5" />
             </button>
             <button 
               onClick={() => setActiveIndex(prev => (prev + 1) % n)}
               className="p-2 text-black/20 hover:text-black transition-colors"
             >
                <ChevronRight className="w-5 h-5" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
