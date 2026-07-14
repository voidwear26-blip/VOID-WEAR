
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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import AutoScroll from "embla-carousel-auto-scroll";
import { TopItems3DCarousel } from '@/components/top-items-3d-carousel';

export default function Home() {
  const db = useFirestore();
  const reviewScrollRef = useRef<HTMLDivElement>(null);
  
  const [reviewContainerWidth, setReviewContainerWidth] = useState(0);
  
  const latestProductsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'products'), limit(12));
  }, [db]);

  const topProductsQuery = useMemoFirebase(() => {
    if (!db) return null;
    /**
     * TOP MODULE QUERY:
     * Only fetches items where isTopItem flag is enabled by administration.
     */
    return query(
      collection(db, 'products'), 
      where('isTopItem', '==', true),
      limit(8)
    );
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
          <Button asChild className="bg-black text-white hover:bg-black/80 px-16 py-8 text-[11px] font-bold tracking-[0.6em] rounded-none transition-all duration-500 shadow-sm uppercase font-body">
            <Link href="/products">VIEW COLLECTION</Link>
          </Button>
        </motion.div>
      </section>
      
      <section className="py-8 md:py-12 bg-transparent relative overflow-hidden">
        <div className="container mx-auto px-6 mb-12">
          <div className="flex items-end justify-between border-b border-black/5 pb-6">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none text-black font-headline">
                ARRIVALS
              </h2>
              <p className="text-[9px] tracking-[0.4em] text-black/40 uppercase font-black font-body">LATEST SYSTEM MODULES</p>
            </div>
            <Link href="/products" className="text-[9px] font-bold tracking-[0.4em] text-black/60 hover:text-black transition-all border-b border-black/10 hover:border-black pb-1 uppercase flex items-center gap-2 font-body">
              EXPLORE ALL
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="px-6 md:px-10">
          <Carousel
            opts={{
              align: "start",
              loop: true,
              dragFree: true,
            }}
            plugins={[
              AutoScroll({
                playOnInit: true,
                speed: 1,
                stopOnInteraction: false,
                stopOnMouseEnter: true,
              }),
            ]}
            className="w-full"
          >
            <CarouselContent className="-ml-8">
              {latestLoading ? (
                [1, 2, 3, 4].map(i => (
                  <CarouselItem key={i} className="pl-8 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                    <div className="aspect-[3/4] bg-black/[0.03] border border-black/5 animate-pulse" />
                  </CarouselItem>
                ))
              ) : latestProducts && latestProducts.length > 0 ? (
                latestProducts.map((product) => (
                  <CarouselItem key={product.id} className="pl-8 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                    <ProductCard product={product as any} />
                  </CarouselItem>
                ))
              ) : (
                [1, 2, 3, 4].map(i => (
                  <CarouselItem key={i} className="pl-8 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                    <div className="aspect-[3/4] bg-black/[0.01] border border-black/5" />
                  </CarouselItem>
                ))
              )}
            </CarouselContent>
          </Carousel>
        </div>
      </section>

      <section className="py-20 md:py-32 bg-black/[0.01] border-y border-black/5">
        <div className="container mx-auto px-6 mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase leading-none text-black font-headline">FEEDBACK</h2>
            <p className="text-[9px] tracking-[0.4em] text-black/40 uppercase font-black font-body">OPERATOR EXPERIENCES</p>
          </div>
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
                                 <p className="text-[9px] font-black tracking-widest uppercase text-black font-body">{review.userName}</p>
                                 <p className="text-[7px] tracking-widest text-black/40 uppercase font-bold font-body">VERIFIED</p>
                              </div>
                           </div>
                           <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-2 h-2 ${i < review.rating ? 'text-[#facc15] fill-current' : 'text-black/5'}`} />
                              ))}
                           </div>
                        </div>
                        <p className="text-[10px] tracking-widest leading-relaxed uppercase text-black/80 font-medium line-clamp-4 font-body">
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
            <p className="text-[9px] tracking-[0.5em] text-black/40 uppercase font-black font-body">ELITE SYSTEM SELECTIONS</p>
          </div>

          <div className="relative">
            {topLoading ? (
              <div className="h-[600px] flex items-center justify-center opacity-20">
                <Loader2 className="w-12 h-12 animate-spin" />
              </div>
            ) : topProducts && topProducts.length > 0 ? (
              <TopItems3DCarousel products={topProducts} />
            ) : (
              <div className="h-[400px] border border-dashed border-black/10 flex items-center justify-center opacity-40">
                <p className="text-[10px] tracking-widest uppercase font-bold font-body">No Top Items Authorized</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
