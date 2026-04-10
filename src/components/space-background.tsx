
"use client"

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';

export function SpaceBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stars = useMemo(() => {
    return [...Array(200)].map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * -20,
      opacity: Math.random() * 0.7 + 0.3,
      glow: Math.random() > 0.7
    }));
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-black">
      {/* Deep Space Base */}
      <div className="absolute inset-0 bg-black" />
      
      {/* Animated Nebula Layer 01 */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] rounded-full bg-blue-900/10 blur-[150px]" 
      />
      
      {/* Animated Nebula Layer 02 */}
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.05, 0.15, 0.05]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] right-[-5%] w-[70%] h-[70%] rounded-full bg-purple-900/10 blur-[180px]" 
      />

      {/* Dynamic Starfield */}
      {stars.map((star) => (
        <motion.div 
          key={star.id} 
          className="absolute rounded-full bg-white"
          initial={{ 
            left: `${star.x}%`, 
            top: `${star.y}%`,
            opacity: 0,
            scale: 0.5
          }}
          animate={{ 
            y: [0, -100], // Smooth upward drift
            opacity: [0, star.opacity, star.opacity, 0],
            scale: [0.5, 1.1, 1.1, 0.5]
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
            boxShadow: star.glow ? '0 0 20px 3px rgba(255,255,255,0.8)' : '0 0 10px 1px rgba(255,255,255,0.4)',
            filter: star.glow ? 'blur(0.5px)' : 'none'
          }}
        />
      ))}

      {/* Global Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_transparent_0%,_rgba(0,0,0,0.4)_100%)]" />
    </div>
  );
}
