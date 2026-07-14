'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductCard } from '@/components/product-card';
import { cn } from '@/lib/utils';

interface TopItems3DCarouselProps {
  products: any[];
}

export function TopItems3DCarousel({ products }: TopItems3DCarouselProps) {
  const [rotation, setRotate] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const n = products.length;
  
  // Radius calculation for the 3D ring
  const radius = useMemo(() => {
    if (typeof window === 'undefined') return 400;
    const width = window.innerWidth < 768 ? 280 : 350;
    return Math.round(width / (2 * Math.tan(Math.PI / n))) + 100;
  }, [n]);

  useEffect(() => {
    if (isHovering) return;
    
    const interval = setInterval(() => {
      setRotate(prev => prev - 0.2); // Slow, continuous rotation
    }, 16);
    
    return () => clearInterval(interval);
  }, [isHovering]);

  if (n === 0) return null;

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center overflow-hidden">
      {/* 3D Scene Container */}
      <div 
        className="relative w-full h-full flex items-center justify-center"
        style={{ perspective: '2000px' }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* The Carousel Ring */}
        <div 
          className="relative w-[300px] md:w-[380px] h-[450px] transition-transform duration-1000 ease-out"
          style={{ 
            transformStyle: 'preserve-3d',
            transform: `rotateY(${rotation}deg)`
          }}
        >
          {products.map((product, idx) => {
            const angle = (idx / n) * 360;
            
            return (
              <div
                key={product.id}
                className="absolute inset-0 transition-opacity duration-1000"
                style={{
                  transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                  backfaceVisibility: 'hidden',
                }}
              >
                {/* Visual Depth Wrapper */}
                <div className="relative w-full h-full group">
                  <div className="w-full h-full shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.15)] transition-all duration-700 bg-white border border-black/5">
                    <ProductCard product={product} />
                  </div>
                  
                  {/* Atmospheric Depth Mask */}
                  <div 
                    className="absolute inset-0 bg-white/40 pointer-events-none transition-opacity duration-700 opacity-0 group-hover:opacity-0"
                    style={{ 
                      // This part would ideally be calculated based on the current rotation 
                      // relative to the "front", but CSS transforms handle basic occlusion.
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Center Shadow Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-radial-gradient from-black/[0.02] to-transparent pointer-events-none z-0" />
    </div>
  );
}
