'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Hero } from '@/components/hero';
import { PromoBanner } from '@/components/promo-banner';
import { ProductCard } from '@/components/product-card';
import Link from 'next/link';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, limit, query, where } from 'firebase/firestore';
import { Package, ArrowRight, Star, User, Loader2 } from 'lucide-react';
import { motion, useAnimationFrame, useMotionValue } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function Home() {
  const db = useFirestore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const reviewScrollRef = useRef<HTMLDivElement>(null);
  
  const [isPaused, setIsPaused] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [reviewContainerWidth, setReviewContainerWidth] = useState(0);
  
  const latestProductsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'products'), limit(8));
  }, [db]);

  const topProductsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'products'), limit(3));
  }, [db]);

  const featuredReviewsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, 'reviews'),
      where('isFeatured', '==', true),
      limit(6)
    );
  }, [db]);

  const { data: latestProducts, isLoading: latestLoading } = useCollection(latestProductsQuery);
  const { data: topProducts, isLoading: topLoading } = useCollection(topProductsQuery);
  const { data: featuredReviews, isLoading: reviewsLoading } = useCollection(featuredReviewsQuery);

  const displayProducts = latestProducts ? [...latestProducts, ...latestProducts] : [];

  useEffect(() => {
    if (scrollRef.current) {
      setContainerWidth(scrollRef.current.scrollWidth / 2);
    }
  }, [latestProducts]);

  useEffect(() => {
    if (reviewScrollRef.current && featuredReviews) {
      setReviewContainerWidth(reviewScrollRef.current.scrollWidth - reviewScrollRef.current.offsetWidth);
    }
  }, [featuredReviews]);

  const x = useMotionValue(0);

  useAnimationFrame((time, delta) => {
    if (!latestLoading && containerWidth > 0) {
      let currentX = x.get();
      if (currentX <= -containerWidth) {
        x.set(currentX + containerWidth);
      } else if (currentX > 0) {
        x.set(currentX - containerWidth);
      }

      if (!isPaused) {
        const pixelsPerSecond = 30; 
        const moveBy = (pixelsPerSecond * delta) / 1000;
        x.set(x.get() - moveBy);
      }
    }
  });

  return (
    <div className="space-y-0 bg-background text-black">
      <Hero />
      
      <div className="mt-8">
        <PromoBanner />
      </div>

      <section className="py-16 flex justify-center bg-black/[0.01]">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Button asChild className="bg-black text-white hover:bg-black/80 px-16 py-8 text-[11px] font-bold tracking-[0.6em] rounded-none transition-all duration-500 shadow-sm uppercase">
            <Link href="/products">VIEW COLLECTION</Link>
          </Button>
        </motion.div>
      </section>
      
      <section className="py-8 bg-transparent relative overflow-hidden">
        <div className="container mx-auto px-6 mb-8">
          <div className="flex items-end justify-between">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none text-black font-headline">
              ARRIVALS
            </h2>
            <Link href="/products" className="text-[9px] font-bold tracking-[0.4em] text-black/60 hover:text-black transition-all border-b border-black/10 hover:border-black pb-1 uppercase flex items-center gap-2">
              VIEW ALL
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div 
          className="relative cursor-grab active:cursor-grabbing overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <motion.div 
            ref={scrollRef}
            style={{ x }}
            className="flex gap-6 md:gap-10 whitespace-nowrap px-6 md:px-0"
          >
            {latestLoading ? (
              [1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-[260px] md:w-[300px] aspect-[3/4] bg-black/[0.03] border border-black/5 animate-pulse flex items-center justify-center">
                   <div className="space-y-4 w-full px-6">
                      <div className="w-full h-48 bg-black/5" />
                      <div className="w-3/4 h-4 bg-black/5" />
                      <div className="w-1/2 h-3 bg-black/5" />
                   </div>
                </div>
              ))
            ) : displayProducts.length > 0 ? (
              displayProducts.map((product, idx) => (
                <div key={`${product.id}-${idx}`} className="w-[260px] md:w-[300px] shrink-0">
                  <ProductCard product={product as any} />
                </div>
              ))
            ) : (
              <div className="py-20 text-center opacity-20 border border-dashed border-black/20 w-screen flex flex-col items-center justify-center">
                <Package className="w-12 h-12 stroke-[0.5px]" />
                <p className="text-[10px] tracking-[1em] uppercase font-black mt-4">EMPTY</p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <section className="py-8 bg-black/[0.01] border-y border-black/5">
        <div className="container mx-auto px-6 mb-8">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase leading-none text-black font-headline">FEEDBACK</h2>
        </div>

        <div className="relative overflow-hidden cursor-grab active:cursor-grabbing px-6 md:px-0">
          <motion.div 
            ref={reviewScrollRef}
            drag="x"
            dragConstraints={{ right: 0, left: -reviewContainerWidth }}
            dragElastic={0.1}
            className="flex gap-6 md:container md:mx-auto"
          >
             {reviewsLoading ? (
               [1, 2, 3].map(i => (
                 <div key={i} className="min-w-[300px] md:min-w-[380px] h-60 bg-black/[0.03] animate-pulse border border-black/5 p-8 space-y-6">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-black/5" />
                      <div className="space-y-2 flex-1">
                        <div className="w-1/2 h-2 bg-black/5" />
                        <div className="w-1/3 h-2 bg-black/5" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full h-2 bg-black/5" />
                      <div className="w-full h-2 bg-black/5" />
                      <div className="w-2/3 h-2 bg-black/5" />
                    </div>
                 </div>
               ))
             ) : featuredReviews && featuredReviews.length > 0 ? (
               featuredReviews.map((review, idx) => (
                 <Link key={review.id} href={`/products/${review.productId}`} className="w-[300px] md:w-[380px] shrink-0 block">
                   <div className="p-8 border border-black/10 bg-background flex flex-col h-[350px] hover:border-black/30 transition-all shadow-sm">
                      <div className="space-y-6 flex-1 overflow-hidden">
                        <div className="flex justify-between items-start">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 border border-black/10 flex items-center justify-center bg-black/5">
                                 <User className="w-3 h-3 text-black/40" />
                              </div>
                              <div>
                                 <p className="text-[9px] font-black tracking-widest uppercase text-black">{review.userName}</p>
                                 <p className="text-[7px] tracking-widest text-black/40 uppercase font-bold">VERIFIED</p>
                              </div>
                           </div>
                           <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-2 h-2 ${i < review.rating ? 'text-[#facc15] fill-current' : 'text-black/5'}`} />
                              ))}
                           </div>
                        </div>
                        <p className="text-[10px] tracking-widest leading-relaxed uppercase text-black/80 font-medium line-clamp-4">
                           "{review.comment}"
                        </p>
                      </div>
                   </div>
                 </Link>
               ))
             ) : (
               <div className="w-full py-12 text-center opacity-20 border border-dashed border-black/10">
                  <p className="text-[10px] tracking-[1em] uppercase font-bold text-black">NO REPORTS</p>
               </div>
             )}
          </motion.div>
        </div>
      </section>

      <section className="py-20 md:py-32 bg-transparent">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight uppercase leading-none text-black font-headline">TOP ITEMS</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {topLoading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="aspect-[3/4] bg-black/[0.03] animate-pulse border border-black/5 flex items-center justify-center">
                   <div className="space-y-4 w-full px-10">
                      <div className="w-full h-64 bg-black/5" />
                      <div className="w-3/4 h-4 bg-black/5" />
                      <div className="w-1/2 h-3 bg-black/5" />
                   </div>
                </div>
              ))
            ) : topProducts && topProducts.length > 0 ? (
              topProducts.map((product, idx) => (
                <div key={product.id} className="relative">
                  <ProductCard product={product as any} />
                  <div className="absolute -top-3 -left-3 w-10 h-10 border border-black/10 bg-background flex items-center justify-center text-[10px] font-black tracking-widest text-black/40 z-30 shadow-sm">
                    0{idx + 1}
                  </div>
                </div>
              ))
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
