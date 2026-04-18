
"use client"

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type Star = {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  glow: boolean;
};

export function SpaceBackground() {
  const [mounted, setMounted] = useState(false);
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    // Generate stars only on the client to avoid hydration mismatch
    const generatedStars = [...Array(100)].map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.5 + 1,
      duration: Math.random() * 25 + 20,
      delay: Math.random() * -25,
      opacity: Math.random() * 0.4 + 0.2,
      glow: Math.random() > 0.9
    }));
    setStars(generatedStars);
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-black transform-gpu">
      <div className="absolute inset-0 bg-black" />
      
      <motion.div 
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.04, 0.08, 0.04]
        }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] rounded-full bg-blue-900/10 blur-[120px] transform-gpu" 
      />
      
      <motion.div 
        animate={{ 
          scale: [1.05, 1, 1.05],
          opacity: [0.02, 0.06, 0.02]
        }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] right-[-5%] w-[70%] h-[70%] rounded-full bg-purple-900/10 blur-[150px] transform-gpu" 
      />

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
            y: [0, -40],
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
            boxShadow: star.glow ? '0 0 8px 1px rgba(255,255,255,0.4)' : 'none',
            willChange: 'transform, opacity'
          }}
        />
      ))}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_transparent_0%,_rgba(0,0,0,0.6)_100%)]" />
    </div>
  );
}
