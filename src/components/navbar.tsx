
"use client"

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { CartDrawer } from '@/components/cart-drawer';
import { motion } from 'framer-motion';
import { useUser, useAuth, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { initiateSignOut } from '@/firebase/non-blocking-login';
import { collection } from 'firebase/firestore';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();

  const cartQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'carts', 'active_cart', 'items');
  }, [db, user]);

  const { data: cartItems } = useCollection(cartQuery);
  const itemCount = cartItems?.reduce((acc, item) => acc + (item.quantity || 0), 0) || 0;

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!mounted) return null;

  const iconMotionProps = {
    whileHover: { scale: 1.1, filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))" },
    whileTap: { scale: 0.95 },
    transition: { type: "spring", stiffness: 400, damping: 17 }
  };

  const handleLogout = async () => {
    try {
      await initiateSignOut(auth);
    } catch (err) {
      console.error('[LOGOUT_FAILURE]', err);
    }
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[40] transition-all duration-700 ${scrolled ? 'bg-black/90 backdrop-blur-xl py-4 border-b border-white/10' : 'bg-transparent py-10'}`}>
        <div className="container mx-auto px-10 flex items-center justify-between">
          <div className="flex items-center gap-16">
            <Link href="/" className="group flex items-center gap-4">
              <motion.div {...iconMotionProps} className="flex items-center gap-4">
                <Image 
                  src="/logo.png" 
                  alt="VOID WEAR" 
                  width={40} 
                  height={40} 
                  className="h-8 w-auto object-contain brightness-200 grayscale"
                  priority
                  unoptimized
                />
                <span className="text-[11px] font-black tracking-[0.4em] uppercase text-white glow-text hidden sm:block">VOID WEAR</span>
              </motion.div>
            </Link>
            
            <div className="hidden xl:flex items-center gap-12 text-[9px] font-bold tracking-[0.5em]">
              <Link href="/products" className="text-white/80 hover:text-white transition-all duration-500 uppercase font-bold">COLLECTION</Link>
              <Link href="/story" className="text-white/80 hover:text-white transition-all duration-500 uppercase font-bold">TRENDS</Link>
              <Link href="/contact" className="text-white/80 hover:text-white transition-all duration-500 uppercase font-bold">CONTACT</Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="hover:bg-white/10 h-12 w-12 text-white/80 hover:text-white rounded-none">
                  <Link href="/profile">
                    <motion.div {...iconMotionProps}>
                      <User className="w-4 h-4" />
                    </motion.div>
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout}
                  className="hover:bg-white/10 h-12 w-12 text-white/80 hover:text-white rounded-none"
                >
                  <motion.div {...iconMotionProps}>
                    <LogOut className="w-4 h-4" />
                  </motion.div>
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="icon" asChild className="hover:bg-white/10 h-12 w-12 text-white/80 hover:text-white rounded-none">
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
              className="hover:bg-white/10 h-12 w-12 text-white relative group rounded-none"
              onClick={() => setIsCartOpen(true)}
            >
              <motion.div {...iconMotionProps}>
                <ShoppingBag className="w-4 h-4 group-hover:glow-text" />
                {itemCount > 0 && (
                  <span className="absolute top-2 right-2 w-4 h-4 bg-white text-black text-[9px] font-bold rounded-full flex items-center justify-center animate-in zoom-in-50">
                    {itemCount}
                  </span>
                )}
              </motion.div>
            </Button>
          </div>
        </div>
      </nav>
      <CartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  );
}
