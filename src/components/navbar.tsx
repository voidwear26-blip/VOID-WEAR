"use client"

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, User, Heart, ShieldCheck, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useMemo } from 'react';
import { CartDrawer } from '@/components/cart-drawer';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

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

  const navLinks = [
    { name: 'COLLECTION', href: '/products' },
    { name: 'STORIES', href: '/story' },
    { name: 'CONTACT', href: '/contact' },
  ];

  const iconBaseClass = "text-black/60 hover:text-black bg-transparent hover:bg-transparent transition-all duration-500 transform active:scale-90";

  return (
    <>
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-[40] transition-all duration-700",
          scrolled ? "bg-background/90 backdrop-blur-xl py-3 border-b border-black/5 shadow-sm" : "bg-transparent py-8"
        )}
      >
        <div className="w-full px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-1 md:gap-8">
            <div className="lg:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className={cn(iconBaseClass, "w-10 h-10 p-0")}>
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-background/95 border-r border-black/5 text-black p-0 backdrop-blur-3xl w-[320px]">
                  <div className="p-8 flex flex-col h-full pt-20">
                    <SheetTitle className="sr-only">MENU</SheetTitle>
                    
                    <div className="flex flex-col items-center mb-16 text-center">
                       <Link 
                         href="/" 
                         onClick={() => setIsMobileMenuOpen(false)}
                         className="flex flex-col items-center gap-4 group"
                       >
                         <div className="relative w-24 h-24">
                           <Image src="/logo.png" alt="VOID WEAR" fill className="object-contain grayscale" unoptimized />
                         </div>
                         <h2 className="text-[12px] font-black tracking-[0.8em] uppercase text-black font-headline whitespace-nowrap">VOID WEAR</h2>
                       </Link>
                    </div>

                    <div className="space-y-12">
                       <div className="space-y-4">
                          <span className="text-[8px] font-black tracking-[0.5em] text-black/20 uppercase px-4 text-center block">NAVIGATION</span>
                          <div className="flex flex-col items-center">
                            {navLinks.map((link, idx) => (
                              <motion.div
                                key={link.name}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.1 * idx }}
                                className="w-full text-center"
                              >
                                <Link 
                                  href={link.href}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className="text-[11px] font-bold tracking-[0.6em] hover:text-black/60 transition-all uppercase font-body block py-5 px-4"
                                >
                                  {link.name}
                                </Link>
                              </motion.div>
                            ))}
                          </div>
                       </div>
                    </div>

                    <div className="mt-auto pt-16 border-t border-black/5 pb-8 px-4 text-center">
                       <div className="space-y-2">
                          <p className="text-[8px] font-black tracking-[0.5em] text-black/20 uppercase">SYSTEM STATUS</p>
                          <div className="flex items-center justify-center gap-3">
                             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                             <span className="text-[9px] font-bold tracking-widest text-black/60 uppercase font-body">ACTIVE_LINK</span>
                          </div>
                       </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center"
            >
              <Link href="/" className="group flex items-center gap-3">
                <Image src="/logo.png" alt="VOID WEAR" width={40} height={40} className="h-8 md:h-9 w-auto object-contain grayscale" priority unoptimized />
                <span className="text-[13px] md:text-[15px] font-black tracking-[0.4em] uppercase text-black font-headline pt-1">VOID WEAR</span>
              </Link>
            </motion.div>

            <div className="hidden lg:flex items-center gap-10 text-[9px] font-bold tracking-[0.5em] font-body ml-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  className="text-black/60 hover:text-black transition-all duration-500 uppercase relative group/link"
                >
                  {link.name}
                  <motion.span 
                    className="absolute -bottom-1 left-0 w-0 h-[1px] bg-black"
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-black transition-all duration-500 group-hover/link:w-full" />
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Link href="/wishlist">
                <Button variant="ghost" size="icon" className={iconBaseClass}>
                  <div className="relative">
                    <Heart className="w-5 h-5" />
                    <AnimatePresence>
                      {wishlistCount > 0 && (
                        <motion.span 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-black text-white text-[7px] font-black rounded-full flex items-center justify-center"
                        >
                          {wishlistCount}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </Button>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Link href={user ? "/profile" : "/login"}>
                <Button variant="ghost" size="icon" className={cn(iconBaseClass, isAdmin && "border border-black/10")}>
                  {isAdmin ? <ShieldCheck className="w-5 h-5 text-black" /> : <User className="w-5 h-5" />}
                </Button>
              </Link>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button 
                variant="ghost" 
                size="icon" 
                className={iconBaseClass} 
                onClick={() => setIsCartOpen(true)}
              >
                <div className="relative">
                  <ShoppingBag className="w-5 h-5" />
                  <AnimatePresence>
                    {itemCount > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-[8px] font-bold rounded-full flex items-center justify-center"
                      >
                        {itemCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.nav>
      <CartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  );
}
