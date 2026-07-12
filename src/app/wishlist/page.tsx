'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { ProductCard } from '@/components/product-card';
import { Heart, Loader2, Package, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function WishlistPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const wishlistQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'wishlist');
  }, [db, user]);

  const { data: wishlistItems, isLoading } = useCollection(wishlistQuery);

  if (isUserLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-black/20" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-8 bg-white">
        <h2 className="text-xl font-bold tracking-[0.5em] text-black uppercase">ACCESS DENIED</h2>
        <p className="text-[10px] text-black/60 tracking-[0.3em] font-bold uppercase">PLEASE LOGIN TO VIEW YOUR WISHLIST</p>
        <Link href="/login">
          <button className="px-12 py-4 border border-black/20 text-[10px] tracking-[0.5em] hover:bg-black hover:text-white transition-all font-bold uppercase">
            LOGIN
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-48 pb-32 bg-transparent min-h-screen text-black">
      <div className="container mx-auto px-6 md:px-10">
        <div className="space-y-6 mb-24 max-w-3xl">
          <span className="text-[10px] font-bold tracking-[0.8em] text-black/60 uppercase">MY SAVED ITEMS</span>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none uppercase text-black">The <br /> Wishlist</h1>
          <p className="text-black/80 tracking-[0.3em] text-xs uppercase leading-relaxed font-light">
            ITEMS YOU HAVE SAVED FOR LATER.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-80">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-black/20" />
            <p className="text-[10px] tracking-[1em] uppercase text-black/60">Syncing...</p>
          </div>
        ) : wishlistItems && wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
            {wishlistItems.map((item) => (
              <ProductCard 
                key={item.id} 
                product={{
                  id: item.productId,
                  name: item.name,
                  basePrice: item.price,
                  imageUrls: [item.image],
                  category: item.category,
                  description: '',
                  slug: ''
                } as any} 
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-48 text-center space-y-8 opacity-80 border border-dashed border-black/10">
            <Heart className="w-16 h-16 stroke-[0.5px] text-black/20" />
            <div className="space-y-4">
              <p className="text-[10px] tracking-[1em] uppercase font-bold text-black/60">YOUR WISHLIST IS EMPTY</p>
              <Link href="/products" className="group flex items-center justify-center gap-4 text-[9px] font-bold tracking-[0.4em] text-black/60 hover:text-black transition-all uppercase">
                EXPLORE ITEMS
                <ArrowRight className="w-3 h-3 group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
