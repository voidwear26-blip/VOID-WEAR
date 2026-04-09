
"use client"

import Link from 'next/link';
import { ShoppingBag, Search, User, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { CartDrawer } from '@/components/cart-drawer';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ${scrolled ? 'bg-black/90 backdrop-blur-xl py-4 border-b border-white/5' : 'bg-transparent py-10'}`}>
        <div className="container mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-16">
            <Link href="/" className="text-lg font-black tracking-[0.6em] flex items-center gap-3 group">
              <Zap className="w-4 h-4 group-hover:text-white group-hover:glow-text transition-all duration-500" />
              <span className="glow-text">VOID WEAR</span>
            </Link>
            
            <div className="hidden lg:flex items-center gap-12 text-[9px] font-bold tracking-[0.4em]">
              <Link href="/products" className="text-white/30 hover:text-white transition-all duration-300">COLLECTION</Link>
              <Link href="/assistant" className="text-white/30 hover:text-white transition-all duration-300 flex items-center gap-2">
                AI LAB <span className="text-[7px] border border-white/20 px-1 rounded-none opacity-50">BETA</span>
              </Link>
              <Link href="/about" className="text-white/30 hover:text-white transition-all duration-300">STORY</Link>
              <Link href="/shipping" className="text-white/30 hover:text-white transition-all duration-300">SHIPPING</Link>
              <Link href="/contact" className="text-white/30 hover:text-white transition-all duration-300">CONTACT</Link>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" className="hover:bg-white/5 rounded-none h-12 w-12 text-white/40 hover:text-white">
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-white/5 rounded-none h-12 w-12 text-white/40 hover:text-white">
              <User className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover:bg-white/5 rounded-none h-12 w-12 text-white relative group"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="w-4 h-4 group-hover:glow-text transition-all" />
              <motion.span 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-3 right-3 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_5px_white]"
              ></motion.span>
            </Button>
          </div>
        </div>
      </nav>
      <CartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  );
}
