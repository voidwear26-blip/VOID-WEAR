'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductCard } from '@/components/product-card';
import { cn } from '@/lib/utils';
import { Zap, Info } from 'lucide-react';
import Link from 'next/link';

interface TopItems3DCarouselProps {
  products: any[];
}

export function TopItems3DCarousel({ products }: TopItems3DCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const n = products.length;

  // Geometric calculations for the 3D ring
  const theta = n > 0 ? 360 / n : 0;
  const radius = useMemo(() => {
    if (typeof window === 'undefined') return 400;
    const width = window.innerWidth < 768 ? 240 : 320;
    return Math.round(width / (2 * Math.tan(Math.PI / n))) + 40;
  }, [n]);

  useEffect(() => {
    if (isHovering || n <= 1) return;
    
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % n);
    }, 5000); // 5-second interval
    
    return () => clearInterval(interval);
  }, [isHovering, n]);

  if (n === 0) return null;

  const activeProduct = products[activeIndex];

  return (
    <div className="grid lg:grid-cols-12 gap-16 md:gap-24 items-center">
      {/* Left Node: 3D Scene */}
      <div className="lg:col-span-7 relative h-[500px] flex items-center justify-center overflow-visible">
        <div 
          className="relative w-full h-full flex items-center justify-center"
          style={{ perspective: '2000px' }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* The Carousel Ring */}
          <div 
            className="relative w-[280px] md:w-[320px] h-[420px] transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ 
              transformStyle: 'preserve-3d',
              transform: `rotateY(${-activeIndex * theta}deg)`
            }}
          >
            {products.map((product, idx) => {
              const angle = idx * theta;
              const isActive = idx === activeIndex;
              
              return (
                <div
                  key={product.id}
                  className="absolute inset-0 transition-opacity duration-1000"
                  style={{
                    transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                    backfaceVisibility: 'hidden',
                  }}
                >
                  <div className={cn(
                    "relative w-full h-full transition-all duration-1000 transform-gpu",
                    isActive ? "scale-100 opacity-100" : "scale-90 opacity-40 blur-[1px]"
                  )}>
                    <div className="w-full h-full shadow-[0_40px_100px_rgba(0,0,0,0.15)] bg-white border border-black/5">
                      <ProductCard product={product} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Ground Shadow Glow */}
        <div className="absolute bottom-[-50px] left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-radial-gradient from-black/[0.05] to-transparent pointer-events-none z-0 blur-3xl opacity-50" />
      </div>

      {/* Right Node: Narrative */}
      <div className="lg:col-span-5 space-y-12">
        <div className="space-y-6">
          <div className="flex items-center gap-4 text-[10px] font-black tracking-[0.5em] text-black/40 uppercase">
             <Zap className="w-4 h-4" />
             <span>SELECTED_ITEM_0{activeIndex + 1}</span>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeProduct.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none font-headline break-words">
                  {activeProduct.name}
                </h2>
                <p className="text-[10px] font-bold tracking-[0.4em] text-black/60 uppercase">
                  {activeProduct.category} // SEASON 01
                </p>
              </div>

              <div className="h-px bg-black/10 w-24" />

              <div className="space-y-6">
                <div className="flex items-center gap-3 text-black/40">
                   <Info className="w-3.5 h-3.5" />
                   <span className="text-[9px] font-bold tracking-[0.4em] uppercase">SYSTEM ANALYSIS</span>
                </div>
                <p className="text-lg md:text-xl font-light tracking-widest leading-relaxed uppercase text-black/80">
                  {activeProduct.topItemDescription || activeProduct.description}
                </p>
              </div>

              <div className="pt-6">
                <motion.button 
                  whileHover={{ x: 10 }}
                  className="group flex items-center gap-4 text-[10px] font-black tracking-[0.8em] text-black uppercase"
                >
                  <Link href={`/products/${activeProduct.id}`}>INSPECT MODULE</Link>
                  <div className="w-12 h-[1px] bg-black/20 group-hover:w-20 transition-all duration-500" />
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel Pagination Progress */}
        <div className="flex gap-3 pt-12 border-t border-black/5">
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
      </div>
    </div>
  );
}
