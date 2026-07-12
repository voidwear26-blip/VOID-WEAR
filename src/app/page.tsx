'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Hero } from '@/components/hero';
import { ProductCard } from '@/components/product-card';
import Link from 'next/link';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, limit, query, where, orderBy } from 'firebase/firestore';
import { Package, ArrowRight, Zap, Star, MessageSquare, User } from 'lucide-react';
import { motion, useAnimationFrame, useMotionValue } from 'framer-motion';

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
      
      <section className="py-32 md:py-48 bg-transparent relative overflow-hidden">
        <div className="container mx-auto px-6 mb-16 md:mb-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-6">
              <span className="text-[10px] font-bold tracking-[1em] text-black/40 uppercase">NEW</span>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none text-black font-headline">
                RECENT <br /> ARRIVALS
              </h2>
            </div>
            <Link href="/products" className="text-[10px] font-bold tracking-[0.4em] text-black/60 hover:text-black transition-all border-b border-black/10 hover:border-black pb-4 w-fit uppercase flex items-center gap-4">
              VIEW ALL
              <ArrowRight className="w-4 h-4" />
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
            className="flex gap-8 md:gap-12 whitespace-nowrap px-6 md:px-0"
          >
            {latestLoading && !latestProducts ? (
              [1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-[280px] md:w-[320px] aspect-[3/4] bg-black/5 animate-pulse border border-black/5" />
              ))
            ) : displayProducts.length > 0 ? (
              displayProducts.map((product, idx) => (
                <div key={`${product.id}-${idx}`} className="w-[280px] md:w-[320px] shrink-0">
                  <ProductCard product={product as any} />
                </div>
              ))
            ) : (
              <div className="py-48 text-center opacity-20 border border-dashed border-black/20 w-screen flex flex-col items-center justify-center">
                <Package className="w-16 h-16 stroke-[0.5px]" />
                <p className="text-[10px] tracking-[1em] uppercase font-black mt-4">EMPTY</p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <section className="py-32 md:py-48 bg-black/[0.01] border-y border-black/5">
        <div className="container mx-auto px-6 mb-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
             <div className="space-y-6">
                <span className="text-[10px] font-bold tracking-[1.2em] text-black/40 uppercase">REVIEWS</span>
                <h2 className="text-4xl md:text-7xl font-black tracking-tight uppercase leading-none text-black font-headline">CUSTOMER <br /> FEEDBACK</h2>
             </div>
          </div>
        </div>

        <div className="relative overflow-hidden cursor-grab active:cursor-grabbing px-6 md:px-0">
          <motion.div 
            ref={reviewScrollRef}
            drag="x"
            dragConstraints={{ right: 0, left: -reviewContainerWidth }}
            dragElastic={0.1}
            className="flex gap-8 md:container md:mx-auto"
          >
             {reviewsLoading && !featuredReviews ? (
               [1, 2, 3].map(i => <div key={i} className="min-w-[320px] md:min-w-[400px] h-64 bg-black/5 animate-pulse border border-black/5" />)
             ) : featuredReviews && featuredReviews.length > 0 ? (
               featuredReviews.map((review, idx) => (
                 <Link key={review.id} href={`/products/${review.productId}`} className="w-[320px] md:w-[420px] shrink-0 block">
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.98 }}
                     whileInView={{ opacity: 1, scale: 1 }}
                     transition={{ delay: idx * 0.1 }}
                     viewport={{ once: true }}
                     className="p-10 border border-black/10 bg-background flex flex-col h-[400px] hover:border-black/30 transition-all group select-none shadow-sm"
                   >
                      <div className="space-y-6 flex-1 overflow-hidden">
                        <div className="flex justify-between items-start">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 border border-black/10 flex items-center justify-center bg-black/5">
                                 <User className="w-4 h-4 text-black/40" />
                              </div>
                              <div>
                                 <p className="text-[10px] font-black tracking-widest uppercase text-black">{review.userName}</p>
                                 <p className="text-[8px] tracking-widest text-black/40 uppercase font-bold">VERIFIED PURCHASE</p>
                              </div>
                           </div>
                           <div className="flex gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-2.5 h-2.5 ${i < review.rating ? 'text-[#facc15] fill-current' : 'text-black/5'}`} />
                              ))}
                           </div>
                        </div>

                        <div className="space-y-2">
                           <p className="text-[7px] font-black tracking-[0.2em] uppercase text-black/40">ITEM: {review.productName}</p>
                           <p className="text-[11px] tracking-widest leading-relaxed uppercase text-black/80 font-medium line-clamp-4 group-hover:text-black transition-colors">
                              "{review.comment}"
                           </p>
                        </div>
                      </div>

                      {review.adminReply && (
                        <div className="mt-6 p-4 bg-black/[0.02] border border-black/10 space-y-1">
                           <p className="text-[7px] text-black/60 font-black tracking-[0.2em] uppercase">REPLY:</p>
                           <p className="text-[9px] text-black/80 tracking-widest uppercase font-medium line-clamp-2">
                             {review.adminReply}
                           </p>
                        </div>
                      )}
                   </motion.div>
                 </Link>
               ))
             ) : (
               <div className="w-full py-24 text-center opacity-20 border border-dashed border-black/10">
                  <p className="text-[10px] tracking-[1em] uppercase font-bold text-black">NO REVIEWS YET</p>
               </div>
             )}
          </motion.div>
        </div>
      </section>

      <section className="py-32 md:py-48 bg-transparent">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-8 mb-24">
            <span className="text-[10px] font-bold tracking-[1.2em] text-black/40 uppercase">BEST SELLERS</span>
            <h2 className="text-4xl md:text-7xl font-black tracking-tight uppercase leading-none text-black font-headline">Top Items</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
            {topLoading && !topProducts ? (
              [1, 2, 3].map(i => (
                <div key={i} className="aspect-[3/4] bg-black/5 animate-pulse border border-black/5" />
              ))
            ) : topProducts && topProducts.length > 0 ? (
              topProducts.map((product, idx) => (
                <div key={product.id} className="relative group">
                  <ProductCard product={product as any} />
                  <div className="absolute -top-4 -left-4 w-12 h-12 border border-black/10 bg-background flex items-center justify-center text-[11px] font-black tracking-widest text-black/40 z-30 shadow-sm">
                    0{idx + 1}
                  </div>
                </div>
              ))
            ) : null}
          </div>
        </div>
      </section>

      <section className="py-48 md:py-64 bg-background overflow-hidden border-t border-black/5">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-16">
            <span className="text-[10px] tracking-widest text-black/40 uppercase font-black">MANIFESTO</span>
            <h3 className="text-2xl md:text-5xl font-light tracking-[0.1em] leading-relaxed uppercase text-black">
              WE PROVIDE <span className="text-black font-black">PREMIUM APPAREL</span> <br /> FOR YOUR EVERYDAY LIFE. 
            </h3>
            <div className="w-[1px] h-32 bg-gradient-to-b from-black/10 to-transparent mx-auto"></div>
          </div>
        </div>
      </section>
    </div>
  );
}
