
"use client"

import Link from 'next/link';
import { ShoppingBag, User, Zap, LogOut, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { CartDrawer } from '@/components/cart-drawer';
import { motion } from 'framer-motion';
import { useUser, useAuth } from '@/firebase';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const auth = useAuth();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Access allowed for prototype testing
  const isAdmin = true;

  const iconMotionProps = {
    whileHover: { scale: 1.2, filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))" },
    whileTap: { scale: 0.9 },
    transition: { type: "spring", stiffness: 400, damping: 17 }
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[40] transition-all duration-700 ${scrolled ? 'bg-black/90 backdrop-blur-xl py-4 border-b border-white/5' : 'bg-transparent py-10'}`}>
        <div className="container mx-auto px-10 flex items-center justify-between">
          <div className="flex items-center gap-16">
            <Link href="/" className="text-xl font-black tracking-[0.8em] flex items-center gap-4 group">
              <motion.div {...iconMotionProps}>
                <Zap className="w-4 h-4 group-hover:text-white transition-all duration-700" />
              </motion.div>
              <span className="glow-text">VOID WEAR</span>
            </Link>
            
            <div className="hidden xl:flex items-center gap-12 text-[9px] font-bold tracking-[0.5em]">
              <Link href="/products" className="text-white/30 hover:text-white transition-all duration-500 uppercase">COLLECTION</Link>
              <Link href="/assistant" className="text-white/30 hover:text-white transition-all duration-500 uppercase">AI LAB</Link>
              <Link href="/about" className="text-white/30 hover:text-white transition-all duration-500 uppercase">STORY</Link>
              <Link href="/contact" className="text-white/30 hover:text-white transition-all duration-500 uppercase">CONTACT</Link>
              {mounted && (
                <Link href="/admin" className="text-white border border-white/20 px-4 py-2 hover:bg-white hover:text-black transition-all duration-500 bg-white/5 uppercase flex items-center gap-2">
                  <ShieldAlert className="w-3 h-3 text-red-500 animate-pulse" />
                  COMMAND CENTER
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {mounted && user ? (
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="hover:bg-white/5 h-12 w-12 text-white/40 hover:text-white rounded-none">
                  <Link href="/profile">
                    <motion.div {...iconMotionProps}>
                      <User className="w-4 h-4" />
                    </motion.div>
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => auth.signOut()}
                  className="hover:bg-white/5 h-12 w-12 text-white/40 hover:text-white rounded-none"
                >
                  <motion.div {...iconMotionProps}>
                    <LogOut className="w-4 h-4" />
                  </motion.div>
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="icon" asChild className="hover:bg-white/5 h-12 w-12 text-white/40 hover:text-white rounded-none">
                <Link href="/login">
                  <motion.div {...iconMotionProps}>
                    <User className="w-4 h-4" />
                  </motion.div>
                </Link>
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover:bg-white/5 h-12 w-12 text-white relative group rounded-none"
              onClick={() => setIsCartOpen(true)}
            >
              <motion.div {...iconMotionProps}>
                <ShoppingBag className="w-4 h-4 group-hover:glow-text" />
              </motion.div>
            </Button>
          </div>
        </div>
      </nav>
      <CartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  );
}
