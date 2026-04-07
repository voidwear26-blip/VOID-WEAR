
"use client"

import Link from 'next/link';
import { ShoppingBag, Search, User, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { CartDrawer } from '@/components/cart-drawer';

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
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-black/80 backdrop-blur-md py-4 border-b border-white/10' : 'bg-transparent py-8'}`}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold tracking-[0.4em] flex items-center gap-2 group">
              <Zap className="w-5 h-5 group-hover:text-white transition-colors" />
              <span>VOID WEAR</span>
            </Link>
            <div className="hidden md:flex items-center gap-8 text-xs font-medium opacity-60 hover:opacity-100 transition-opacity">
              <Link href="/products" className="hover:text-white transition-colors tracking-widest">COLLECTION</Link>
              <Link href="/about" className="hover:text-white transition-colors tracking-widest">STORY</Link>
              <Link href="/assistant" className="hover:text-white transition-colors tracking-widest flex items-center gap-1">
                AI LAB <span className="text-[10px] bg-white text-black px-1 rounded">BETA</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="hover:bg-white/10">
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-white/10">
              <User className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover:bg-white/10 relative"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-white rounded-full"></span>
            </Button>
          </div>
        </div>
      </nav>
      <CartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  );
}
