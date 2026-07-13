
'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Hero } from '@/components/hero';
import { PromoBanner } from '@/components/promo-banner';
import { ProductCard } from '@/components/product-card';
import Link from 'next/link';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, limit, query, where } from 'firebase/firestore';
import { Package, ArrowRight, Star, User, Loader2, Sparkles, Zap, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Home() {
  const db = useFirestore();
  const reviewScrollRef = useRef<HTMLDivElement>(null);
  
  const [reviewContainerWidth, setReviewContainerWidth] = useState(0);
  const [activeTopIndex, setActiveTopIndex] = useState(1); // Rank 1 is middle
  
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
    if (reviewScrollRef.current && featuredReviews) {
      setReviewContainerWidth(reviewScrollRef.current.scrollWidth - reviewScrollRef.current.offsetWidth);
    }
  }, [featuredReviews]);

  // Elite Rank Narratives
  const rankReasons = [
    "Maximum urban resilience via Grade-A ballistic materials.",
    "Integrated neural thermal regulation for adaptive environments.",
    "Geometric architectural modularity for the modern explorer."
  ];

  // Reorder topProducts for 3-1-2 layout: Rank 3, Rank 1, Rank 2
  const rankedTopItems = useMemo(() => {
    if (!topProducts || topProducts.length < 3) return [];
    return [
      { ...topProducts[2], reason: rankReasons[2], rank: "03" },
      { ...topProducts[0], reason: rankReasons[0], rank: "01" },
      { ...topProducts[1], reason: rankReasons[1], rank: "02" }
    ];
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
      
      <section className="py-8 md:py-12 bg-transparent relative overflow-hidden">
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

        <div className="relative overflow-hidden w-full py-4">
          <motion.div 
            className="flex gap-8 whitespace-nowrap"
            animate={{ x: ["0%", "-100%"] }}
            transition={{
              duration: 30,
              ease: "linear",
              repeat: Infinity,
            }}
          >
            {latestLoading ? (
              [1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="min-w-[300px] md:min-w-[320px] aspect-[3/4] bg-black/[0.03] border border-black/5 animate-pulse shrink-0" />
              ))
            ) : latestProducts && latestProducts.length > 0 ? (
              [...latestProducts, ...latestProducts].map((product, idx) => (
                <div key={`${product.id}-${idx}`} className="min-w-[300px] md:min-w-[320px] shrink-0">
                  <ProductCard product={product as any} />
                </div>
              ))
            ) : (
               <div className="flex gap-8">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="min-w-[300px] md:min-w-[320px] aspect-[3/4] bg-black/[0.03] border border-black/5 shrink-0" />
                  ))}
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
             {reviewsLoading ? (
               [1, 2, 3].map(i => (
                 <div key={i} className="min-w-[300px] md:min-w-[380px] h-[350px] bg-black/[0.03] animate-pulse border border-black/5 p-8" />
               ))
             ) : featuredReviews && featuredReviews.length > 0 ? (
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
               <div className="flex gap-6">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="min-w-[300px] md:min-w-[380px] h-[350px] bg-black/[0.01] border border-black/5 shrink-0" />
                 ))}
               </div>
             )}
          </motion.div>
        </div>
      </section>

      <section className="py-20 md:py-32 bg-transparent overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4 mb-24">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight uppercase leading-none text-black font-headline">TOP ITEMS</h2>
            <p className="text-[9px] tracking-[0.5em] text-black/40 uppercase font-black">ELITE SYSTEM SELECTIONS</p>
          </div>

          <div className="relative flex flex-col items-center">
            <div className="flex flex-row items-center justify-center gap-4 md:gap-16 lg:gap-24 w-full max-w-7xl px-4 md:px-10">
              {topLoading ? (
                [1, 2, 3].map(i => {
                   const isCenter = i === 2;
                   return (
                    <div 
                      key={i} 
                      className={cn(
                        "bg-black/[0.03] animate-pulse border border-black/5 shrink-0",
                        isCenter ? "z-30 scale-110 w-[240px] md:w-[380px] h-[350px] md:h-[500px]" : "z-10 scale-90 w-[180px] md:w-[280px] h-[300px] md:h-[450px]"
                      )} 
                    />
                   );
                })
              ) : rankedTopItems.length > 0 ? rankedTopItems.map((product: any, idx) => {
                const isCenter = idx === 1;
                const isLeft = idx === 0;
                const isRight = idx === 2;
                const isActive = activeTopIndex === idx;

                return (
                  <motion.div 
                    key={product.id} 
                    onClick={() => setActiveTopIndex(idx)}
                    className={cn(
                      "relative cursor-pointer transition-all duration-700 ease-out shrink-0",
                      isLeft ? "md:-ml-12" : isRight ? "md:-mr-12" : "",
                      isCenter ? "z-30 scale-110 w-[240px] md:w-[380px]" : isRight ? "z-20 scale-100 w-[200px] md:w-[320px]" : "z-10 scale-90 w-[180px] md:w-[280px]"
                    )}
                    animate={{
                      scale: isActive ? 1.1 : isCenter ? 1.1 : 0.95,
                      opacity: 1,
                      filter: "none"
                    }}
                    whileHover={{ scale: isActive ? 1.15 : 1.05 }}
                  >
                    <ProductCard product={product as any} />
                    <div className={cn(
                      "absolute -top-4 -left-4 w-10 h-10 md:w-12 md:h-12 border bg-background flex items-center justify-center text-xs font-black tracking-widest z-40 shadow-xl",
                      isActive ? "border-black text-black" : "border-black/10 text-black/20"
                    )}>
                      {product.rank}
                    </div>
                  </motion.div>
                );
              }) : (
                <div className="flex gap-16 md:gap-24">
                   {[1, 2, 3].map(i => (
                     <div key={i} className="w-[180px] md:w-[320px] aspect-[3/4] bg-black/[0.01] border border-black/5 shrink-0" />
                   ))}
                </div>
              )}
            </div>

            <AnimatePresence mode="wait">
              {rankedTopItems.length > 0 && (
                <motion.div 
                  key={activeTopIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-20 text-center space-y-6 max-w-xl px-6"
                >
                   <div className="flex items-center justify-center gap-3 text-[10px] font-black tracking-[0.4em] text-black/40 uppercase">
                      <Zap className="w-3 h-3" />
                      <span>RANK_{rankedTopItems[activeTopIndex].rank}_ANALYSIS</span>
                   </div>
                   <h3 className="text-xl md:text-2xl font-black tracking-widest uppercase">
                     {rankedTopItems[activeTopIndex].name}
                   </h3>
                   <p className="text-[11px] md:text-xs text-black/60 tracking-[0.2em] leading-relaxed uppercase font-medium">
                     {rankedTopItems[activeTopIndex].reason}
                   </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
}
