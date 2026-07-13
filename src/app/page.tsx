
'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Hero } from '@/components/hero';
import { PromoBanner } from '@/components/promo-banner';
import { ProductCard } from '@/components/product-card';
import Link from 'next/link';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, limit, query, where } from 'firebase/firestore';
import { Package, ArrowRight, Star, User, Loader2, Sparkles } from 'lucide-react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Home() {
  const db = useFirestore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const reviewScrollRef = useRef<HTMLDivElement>(null);
  const arrivalsContainerRef = useRef<HTMLDivElement>(null);
  
  const [arrivalsWidth, setArrivalsWidth] = useState(0);
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

  useEffect(() => {
    if (scrollRef.current) {
      setArrivalsWidth(scrollRef.current.scrollWidth - scrollRef.current.offsetWidth);
    }
  }, [latestProducts]);

  useEffect(() => {
    if (reviewScrollRef.current && featuredReviews) {
      setReviewContainerWidth(reviewScrollRef.current.scrollWidth - reviewScrollRef.current.offsetWidth);
    }
  }, [featuredReviews]);

  // Reorder topProducts for 3-1-2 layout: Rank 3, Rank 1, Rank 2
  const rankedTopItems = useMemo(() => {
    if (!topProducts || topProducts.length < 3) return topProducts || [];
    // Assuming 0 is 1st, 1 is 2nd, 2 is 3rd
    return [topProducts[2], topProducts[0], topProducts[1]];
  }, [topProducts]);

  return (
    <div className="space-y-0 bg-background text-black">
      <Hero />
      
      <div className="mt-8">
        <PromoBanner />
      </div>

      <section className="py-16 md:py-24 flex justify-center bg-transparent">
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
      
      <section className="py-8 md:py-12 bg-transparent relative overflow-hidden" ref={arrivalsContainerRef}>
        <div className="container mx-auto px-6 mb-8">
          <div className="flex items-end justify-between">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none text-black font-headline">
              ARRIVALS
            </h2>
            <Link href="/products" className="text-[9px] font-bold tracking-[0.4em] text-black/60 hover:text-black transition-all border-b border-black/10 hover:border-black pb-1 uppercase flex items-center gap-2">
              EXPLORE ALL
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="relative cursor-grab active:cursor-grabbing px-6 md:px-10 overflow-visible">
          <motion.div 
            ref={scrollRef}
            drag="x"
            dragConstraints={{ right: 0, left: -arrivalsWidth }}
            className="flex gap-6 md:gap-10"
          >
            {latestLoading || !latestProducts ? (
              [1, 2, 3, 4, 5].map(i => (
                <div key={i} className="min-w-[260px] md:min-w-[320px] aspect-[3/4] bg-black/[0.03] border border-black/5 animate-pulse flex items-center justify-center">
                   <div className="space-y-4 w-full px-6">
                      <div className="w-full h-48 bg-black/5" />
                      <div className="w-3/4 h-4 bg-black/5" />
                      <div className="w-1/2 h-3 bg-black/5" />
                   </div>
                </div>
              ))
            ) : latestProducts.length > 0 ? (
              latestProducts.map((product) => (
                <div key={product.id} className="min-w-[260px] md:min-w-[320px] shrink-0">
                  <ProductCard product={product as any} />
                </div>
              ))
            ) : (
              <div className="py-20 text-center opacity-20 border border-dashed border-black/20 w-full flex flex-col items-center justify-center">
                <Package className="w-12 h-12 stroke-[0.5px]" />
                <p className="text-[10px] tracking-[1em] uppercase font-black mt-4">EMPTY</p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <section className="py-8 md:py-12 bg-black/[0.01] border-y border-black/5">
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
             {reviewsLoading || !featuredReviews ? (
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
             ) : featuredReviews.length > 0 ? (
               featuredReviews.map((review) => (
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

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4 lg:gap-12 px-6">
            {topLoading || !topProducts ? (
              [1, 2, 3].map(i => (
                <div key={i} className="w-full max-w-[320px] aspect-[3/4] bg-black/[0.03] animate-pulse border border-black/5 flex items-center justify-center">
                   <div className="space-y-4 w-full px-10">
                      <div className="w-full h-64 bg-black/5" />
                   </div>
                </div>
              ))
            ) : rankedTopItems.length >= 3 ? (
              rankedTopItems.map((product, idx) => {
                // idx 0 = Rank 3 (Left), idx 1 = Rank 1 (Center), idx 2 = Rank 2 (Right)
                const isCenter = idx === 1;
                const isLeft = idx === 0;
                const isRight = idx === 2;

                return (
                  <motion.div 
                    key={product.id} 
                    className={cn(
                      "relative w-full max-w-[380px] shrink-0 transition-all duration-700",
                      isCenter ? "scale-110 z-20 order-2" : isRight ? "scale-100 z-10 order-3" : "scale-90 z-0 order-1"
                    )}
                    whileHover={{ scale: isCenter ? 1.15 : isRight ? 1.05 : 0.95 }}
                  >
                    <ProductCard product={product as any} />
                    <div className={cn(
                      "absolute -top-4 -left-4 w-12 h-12 border bg-background flex items-center justify-center text-xs font-black tracking-widest z-30 shadow-xl",
                      isCenter ? "border-black text-black" : "border-black/10 text-black/20"
                    )}>
                      {isCenter ? "01" : isRight ? "02" : "03"}
                    </div>
                    {isCenter && (
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-1.5 text-[8px] font-black tracking-[0.4em] uppercase z-30">
                        TOP_ASSEMBLAGE
                      </div>
                    )}
                  </motion.div>
                );
              })
            ) : topProducts.map((product, idx) => (
              <div key={product.id} className="relative w-full max-w-[320px]">
                <ProductCard product={product as any} />
                <div className="absolute -top-3 -left-3 w-10 h-10 border border-black/10 bg-background flex items-center justify-center text-[10px] font-black tracking-widest text-black/40 z-30 shadow-sm">
                  0{idx + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
