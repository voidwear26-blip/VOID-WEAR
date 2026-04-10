
"use client"

import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const cursorX = useSpring(0, { damping: 25, stiffness: 200 });
  const cursorY = useSpring(0, { damping: 25, stiffness: 200 });
  
  const followerX = useSpring(0, { damping: 20, stiffness: 100 });
  const followerY = useSpring(0, { damping: 20, stiffness: 100 });

  useEffect(() => {
    setMounted(true);
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 4);
      cursorY.set(e.clientY - 4);
      followerX.set(e.clientX - 20);
      followerY.set(e.clientY - 20);
    };

    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, [cursorX, cursorY, followerX, followerY]);

  if (!mounted) return null;

  return (
    <>
      <motion.div 
        className="custom-cursor" 
        style={{ x: cursorX, y: cursorY }} 
      />
      <motion.div 
        className="custom-cursor-follower" 
        style={{ x: followerX, y: followerY }} 
      />
    </>
  );
}
