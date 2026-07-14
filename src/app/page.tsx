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

/**
 * HOME PAGE ARCHITECTURE
 * Recalibrated for high-speed initial paint.
 * Uses Intersection Observers to fetch data nodes only when required.
 */
export default function Home() {
  const db = useFirestore();
  const reviewScrollRef = useRef<HTMLDivElement>(null);
  const [reviewContainerWidth, setReviewContainerWidth] = useState(0);

  // Performance Guards: Track visibility of sections
  const [arrivalsVisible, setArrivalsVisible] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [topItemsVisible, setTopItemsVisible] = useState(false);

  // 1. ARRIVALS DATA (Lazy)
  const latestProductsQuery = useMemoFirebase(() => {
    if (!db || !arrivalsVisible) return null;
    return query(collection(db, 'products'), limit(8)); 
  }, [db, arrivalsVisible]);

  // 2. TOP MODULE DATA (Lazy)
  const topProductsQuery = useMemoFirebase(() => {
    if (!db || !topItemsVisible) return null;
    return query(
      collection(db, 'products'), 
      where('isTopItem', '==', true),
      limit(5)
    );
  }, [db, topItemsVisible]);

  // 3. FEEDBACK DATA (Lazy)
  const featuredReviewsQuery = useMemoFirebase(() => {
    if (!db || !feedbackVisible) return null;
    return query(
      collection(db, 'reviews'),
      where('isFeatured', '==', true),
      limit(6)
    );
  }, [db, feedbackVisible]);

  const { data: latestProducts, isLoading: latestLoading } = useCollection(latestProductsQuery);
  const { data: topProducts, isLoading: topLoading } = useCollection(topProductsQuery);
  const { data: featuredReviews, isLoading: reviewsLoading } = useCollection(featuredReviewsQuery);

  useEffect(() => {
    if (reviewScrollRef.current && featuredReviews) {
      setReviewContainerWidth(reviewScrollRef.current.scrollWidth - reviewScrollRef.current.offsetWidth);
    }
  }, [featuredReviews]);

  // Intersection Observers for On-Demand Fetching
  const observerRefs = {
    arrivals: useRef<HTMLDivElement>(null),
    feedback: useRef<HTMLDivElement>(null),
    topItems: useRef<HTMLDivElement>(null)
  };

  useEffect(() => {
    const options = { threshold: 0.05, rootMargin: "200px" };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (entry.target === observerRefs.arrivals.current) setArrivalsVisible(true);
          if (entry.target === observerRefs.feedback.current) setFeedbackVisible(true);
          if (entry.target === observerRefs.topItems.current) setTopItemsVisible(true);
        }
      });
    }, options);

    const currentRefs = Object.values(observerRefs);
    currentRefs.forEach(ref => ref.current && observer.observe(ref.current));
    
    return () => observer.disconnect();
  }, []);

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
      
      <section ref={observerRefs.arrivals} className="py-8 md:py-12 bg-transparent relative overflow-hidden">
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
          {!arrivalsVisible ? (
            <div className="h-[600px] bg-black/[0.01]" />
          ) : (
            <Carousel
              opts={{ align: "start", loop: true, dragFree: true }}
              plugins={[
                AutoScroll({ playOnInit: true, speed: 1, stopOnInteraction: false, stopOnMouseEnter: true }),
              ]}
              className="w-full"
            >
              <CarouselContent className="-ml-8">
                {latestLoading ? (
                  [1, 2, 3, 4].map(i => (
                    <CarouselItem key={i} className="pl-8 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                      <div className="aspect-[3/4] bg-black/[0.03] border border-black/5 animate-pulse rounded-none h-[600px]" />
                    </CarouselItem>
                  ))
                ) : latestProducts && latestProducts.length > 0 ? (
                  latestProducts.map((product) => (
                    <CarouselItem key={product.id} className="pl-8 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                      <ProductCard product={product as any} />
                    </CarouselItem>
                  ))
                ) : (
                  <div className="w-full py-32 text-center opacity-40 uppercase text-[10px] tracking-widest font-black">Scanning Collection...</div>
                )}
              </CarouselContent>
            </Carousel>
          )}
        </div>
      </section>

      <section ref={observerRefs.feedback} className="py-20 md:py-32 bg-black/[0.01] border-y border-black/5">
        <div className="container mx-auto px-6 mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase leading-none text-black font-headline">FEEDBACK</h2>
            <p className="text-[9px] tracking-[0.4em] text-black/40 uppercase font-black font-body">CUSTOMER EXPERIENCES</p>
          </div>
        </div>

        <div className="relative overflow-hidden cursor-grab active:cursor-grabbing px-6 md:px-0">
          {!feedbackVisible ? (
            <div className="h-[350px] bg-black/[0.01]" />
          ) : (
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
                 <div className="w-full text-center py-20 opacity-20 text-[9px] font-black tracking-widest uppercase">No Feedback Logged</div>
               )}
            </motion.div>
          )}
        </div>
      </section>

      <section ref={observerRefs.topItems} className="py-20 md:py-32 bg-transparent overflow-hidden">
        {(!topLoading && (!topProducts || topProducts.length === 0)) ? null : (
          <div className="container mx-auto px-6">
            <div className="text-center space-y-4 mb-24">
              <h2 className="text-4xl md:text-6xl font-black tracking-tight uppercase leading-none text-black font-headline">TOP ITEMS</h2>
              <p className="text-[9px] tracking-[0.5em] text-black/40 uppercase font-black font-body">ELITE SYSTEM SELECTIONS</p>
            </div>

            <div className="relative">
              {!topItemsVisible ? (
                <div className="h-[600px] bg-black/[0.01]" />
              ) : topLoading ? (
                <div className="h-[600px] flex items-center justify-center opacity-20">
                  <Loader2 className="w-12 h-12 animate-spin" />
                </div>
              ) : (
                <TopItems3DCarousel products={topProducts || []} />
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
