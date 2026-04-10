
"use client"

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';

export function SpaceBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stars = useMemo(() => {
    return [...Array(150)].map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      duration: Math.random() * 8 + 6, // Faster movement
      delay: Math.random() * -15,
      opacity: Math.random() * 0.6 + 0.4, // Brighter
      glow: Math.random() > 0.8
    }));
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-black">
      {/* Deep Space Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.05)_0%,_transparent_80%)]" />
      
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
            top: [`${star.y}%`, `${star.y - 30}%`], // More vertical movement
            opacity: [0, star.opacity, 0],
            scale: [0.5, 1.2, 0.5]
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
            boxShadow: star.glow ? '0 0 15px 2px rgba(255,255,255,0.6)' : '0 0 8px rgba(255,255,255,0.3)',
            filter: star.glow ? 'blur(0.5px)' : 'none'
          }}
        />
      ))}

      {/* Subtle Nebula Clouds */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-white/[0.03] blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
    </div>
  );
}
