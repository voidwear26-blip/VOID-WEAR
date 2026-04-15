"use client"

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';

export function SpaceBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stars = useMemo(() => {
    // Reduced star count for better performance
    return [...Array(120)].map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * -20,
      opacity: Math.random() * 0.5 + 0.3,
      glow: Math.random() > 0.8
    }));
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-black transform-gpu">
      {/* Deep Space Base */}
      <div className="absolute inset-0 bg-black" />
      
      {/* Optimized Nebula Layer 01 */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.05, 0.1, 0.05]
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] rounded-full bg-blue-900/10 blur-[120px] transform-gpu" 
      />
      
      {/* Optimized Nebula Layer 02 */}
      <motion.div 
        animate={{ 
          scale: [1.1, 1, 1.1],
          opacity: [0.03, 0.08, 0.03]
        }}
        transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] right-[-5%] w-[70%] h-[70%] rounded-full bg-purple-900/10 blur-[150px] transform-gpu" 
      />

      {/* Optimized Starfield */}
      {stars.map((star) => (
        <motion.div 
          key={star.id} 
          className="absolute rounded-full bg-white transform-gpu"
          initial={{ 
            left: `${star.x}%`, 
            top: `${star.y}%`,
            opacity: 0
          }}
          animate={{ 
            y: [0, -60],
            opacity: [0, star.opacity, star.opacity, 0]
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
            boxShadow: star.glow ? '0 0 10px 1px rgba(255,255,255,0.6)' : 'none',
            willChange: 'transform, opacity'
          }}
        />
      ))}

      {/* Global Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_transparent_0%,_rgba(0,0,0,0.6)_100%)]" />
    </div>
  );
}
