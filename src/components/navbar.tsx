
"use client"

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, User, Heart, ShieldCheck, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useMemo } from 'react';
import { CartDrawer } from '@/components/cart-drawer';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, useAuth, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();
  const db = useFirestore();

  const userRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile } = useDoc(userRef);

  const isAdmin = useMemo(() => {
    if (!user) return false;
    return user.email?.toLowerCase() === 'voidwear26@gmail.com' || 
           user.uid === 'A9vsqn10oddfmouKiKjWpTcFqZB2' ||
           profile?.role === 'ADMIN';
  }, [user, profile]);

  const cartQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'carts', 'active_cart', 'items');
  }, [db, user]);

  const wishlistQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'wishlist');
  }, [db, user]);

  const { data: cartItems } = useCollection(cartQuery);
  const { data: wishlistItems } = useCollection(wishlistQuery);
  
  const itemCount = cartItems?.reduce((acc, item) => acc + (item.quantity || 0), 0) || 0;
  const wishlistCount = wishlistItems?.length || 0;

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!mounted) return null;

  const iconMotionProps = {
    whileHover: { scale: 1.1, filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))" },
    whileTap: { scale: 0.95 },
    transition: { type: "spring", stiffness: 400, damping: 17 }
  };

  const navLinks = [
    { name: 'COLLECTION', href: '/products' },
    { name: 'TRENDS', href: '/story' },
    { name: 'CONTACT', href: '/contact' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[40] transition-all duration-700 ${scrolled ? 'bg-black/90 backdrop-blur-xl py-4 border-b border-white/10 shadow-[0_0_50px_rgba(0,0,0,1)]' : 'bg-transparent py-10'}`}>
        <div className="container mx-auto px-6 md:px-10 flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-16">
            {/* Mobile Menu Trigger */}
            <div className="lg:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-none w-10 h-10">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-black/95 border-r border-white/10 text-white p-0 backdrop-blur-2xl w-[300px]">
                  <div className="p-10 space-y-16 pt-24">
                    <SheetTitle className="sr-only">NAVIGATION_MENU</SheetTitle>
                    <div className="space-y-4">
                       {/* BRAND LINK INSIDE MOBILE MENU: CLOSES DRAWER ON CLICK */}
                       <Link 
                         href="/" 
                         onClick={() => setIsMobileMenuOpen(false)}
                         className="flex items-center gap-4 mb-12 group"
                       >
                         <Image src="/logo.png" alt="VOID WEAR" width={32} height={32} className="h-6 w-auto object-contain brightness-200 grayscale" unoptimized />
                         <span className="text-lg font-black tracking-[0.4em] uppercase text-white glow-text font-header">VOID WEAR</span>
                       </Link>

                       <span className="text-[8px] font-black tracking-[0.5em] text-white/20 uppercase">SYSTEM_NODES</span>
                       <div className="flex flex-col gap-8">
                         {navLinks.map((link) => (
                           <Link 
                             key={link.name} 
                             href={link.href}
                             onClick={() => setIsMobileMenuOpen(false)}
                             className="text-lg font-black tracking-[0.4em] hover:text-white transition-all uppercase font-header"
                           >
                             {link.name}
                           </Link>
                         ))}
                       </div>
                    </div>

                    <div className="pt-16 border-t border-white/5 space-y-8">
                       <div className="space-y-2">
                          <p className="text-[8px] font-black tracking-[0.5em] text-white/20 uppercase">UPLINK_STATUS</p>
                          <div className="flex items-center gap-3">
                             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                             <span className="text-[10px] font-bold tracking-widest text-white/60 uppercase">SYSTEM_STABLE</span>
                          </div>
                       </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <Link href="/" className="group flex items-center gap-4">
              <motion.div {...iconMotionProps} className="flex items-center gap-4">
                <Image src="/logo.png" alt="VOID WEAR" width={40} height={40} className="h-8 w-auto object-contain brightness-200 grayscale" priority unoptimized />
                <span className="text-[14px] font-black tracking-[0.4em] uppercase text-white glow-text hidden sm:block font-header">VOID WEAR</span>
              </motion.div>
            </Link>

            {/* Desktop Links */}
            <div className="hidden lg:flex items-center gap-12 text-[10px] font-bold tracking-[0.5em] font-header">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  className="text-white/80 hover:text-white transition-all duration-500 uppercase relative group/link"
                >
                  {link.name}
                  <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-white transition-all duration-500 group-hover/link:w-full" />
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1 md:gap-4">
            <Link href="/wishlist">
              <Button variant="ghost" size="icon" className="hover:bg-white/10 h-10 w-10 md:h-12 md:w-12 text-white/80 hover:text-white rounded-none relative">
                <motion.div {...iconMotionProps}>
                  <Heart className="w-4 h-4 md:w-5 md:h-5" />
                  {wishlistCount > 0 && <span className="absolute -top-1 -right-1 md:top-2 md:right-2 w-3 h-3 bg-white text-black text-[7px] font-black rounded-full flex items-center justify-center">{wishlistCount}</span>}
                </motion.div>
              </Button>
            </Link>

            <Link href={user ? "/profile" : "/login"}>
              <Button variant="ghost" size="icon" className={`h-10 w-10 md:h-12 md:w-12 rounded-none transition-all ${isAdmin ? 'text-white border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'text-white/80 hover:text-white'}`}>
                <motion.div {...iconMotionProps}>
                  {isAdmin ? <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-white" /> : <User className="w-4 h-4 md:w-5 md:h-5" />}
                </motion.div>
              </Button>
            </Link>
            
            <Button variant="ghost" size="icon" className="hover:bg-white/10 h-10 w-10 md:h-12 md:w-12 text-white relative group rounded-none" onClick={() => setIsCartOpen(true)}>
              <motion.div {...iconMotionProps}>
                <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
                {itemCount > 0 && <span className="absolute -top-1 -right-1 md:top-2 md:right-2 w-4 h-4 bg-white text-black text-[9px] font-bold rounded-full flex items-center justify-center animate-in zoom-in-50">{itemCount}</span>}
              </motion.div>
            </Button>
          </div>
        </div>
      </nav>
      <CartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  );
}
