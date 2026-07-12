
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

  const iconBaseClass = "text-black/60 hover:text-black hover:scale-110 bg-transparent hover:bg-transparent transition-all duration-300 transform active:scale-95";

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[40] transition-all duration-700 ${scrolled ? 'bg-background/90 backdrop-blur-xl py-4 border-b border-black/5 shadow-sm' : 'bg-transparent py-10'}`}>
        <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-12">
            <div className="lg:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className={cn(iconBaseClass, "rounded-none w-8 h-8")}>
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-background/95 border-r border-black/5 text-black p-0 backdrop-blur-2xl w-[300px]">
                  <div className="p-10 space-y-16 pt-24">
                    <SheetTitle className="sr-only">MENU</SheetTitle>
                    <div className="space-y-4">
                       <Link 
                         href="/" 
                         onClick={() => setIsMobileMenuOpen(false)}
                         className="flex items-center gap-4 mb-12 group"
                       >
                         <Image src="/logo.png" alt="VOID WEAR" width={32} height={32} className="h-6 w-auto object-contain grayscale" unoptimized />
                         <span className="text-lg font-black tracking-[0.4em] uppercase text-black font-headline">VOID WEAR</span>
                       </Link>

                       <span className="text-[8px] font-black tracking-[0.5em] text-black/20 uppercase">NAVIGATION</span>
                       <div className="flex flex-col gap-8">
                         {navLinks.map((link) => (
                           <Link 
                             key={link.name} 
                             href={link.href}
                             onClick={() => setIsMobileMenuOpen(false)}
                             className="text-lg font-bold tracking-[0.4em] hover:text-black/60 transition-all uppercase font-body"
                           >
                             {link.name}
                           </Link>
                         ))}
                       </div>
                    </div>

                    <div className="pt-16 border-t border-black/5 space-y-8">
                       <div className="space-y-2">
                          <p className="text-[8px] font-black tracking-[0.5em] text-black/20 uppercase">STATUS</p>
                          <div className="flex items-center gap-3">
                             <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                             <span className="text-[10px] font-bold tracking-widest text-black/60 uppercase font-body">ONLINE</span>
                          </div>
                       </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <Link href="/" className="group flex items-center gap-2">
              <div className="flex items-center gap-4 hover:scale-[1.02] transition-transform duration-500">
                <Image src="/logo.png" alt="VOID WEAR" width={40} height={40} className="h-8 w-auto object-contain grayscale" priority unoptimized />
                <span className="text-[14px] font-black tracking-[0.4em] uppercase text-black hidden sm:block font-headline">VOID WEAR</span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-12 text-[10px] font-bold tracking-[0.5em] font-body">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  className="text-black/60 hover:text-black transition-all duration-500 uppercase relative group/link"
                >
                  {link.name}
                  <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-black transition-all duration-500 group-hover/link:w-full" />
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1 md:gap-4">
            <Link href="/wishlist">
              <Button variant="ghost" size="icon" className={iconBaseClass}>
                <div className="relative">
                  <Heart className="w-4 h-4 md:w-5 md:h-5" />
                  {wishlistCount > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-black text-white text-[7px] font-black rounded-full flex items-center justify-center">{wishlistCount}</span>}
                </div>
              </Button>
            </Link>

            <Link href={user ? "/profile" : "/login"}>
              <Button variant="ghost" size="icon" className={cn(iconBaseClass, isAdmin && "border border-black/10")}>
                {isAdmin ? <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-black" /> : <User className="w-4 h-4 md:w-5 md:h-5" />}
              </Button>
            </Link>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className={iconBaseClass} 
              onClick={() => setIsCartOpen(true)}
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
                {itemCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-[9px] font-bold rounded-full flex items-center justify-center">{itemCount}</span>}
              </div>
            </Button>
          </div>
        </div>
      </nav>
      <CartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  );
}
