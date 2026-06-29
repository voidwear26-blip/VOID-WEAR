'use client';

import { Hero } from '@/components/hero';
import { ProductCard } from '@/components/product-card';
import Link from 'next/link';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, limit, query, where, orderBy } from 'firebase/firestore';
import { Package, ArrowRight, ShieldCheck, Zap, Globe, FileText, Star, MessageSquare, User } from 'lucide-react';
import { motion, useAnimationFrame, useMotionValue } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

export default function Home() {
  const db = useFirestore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const reviewScrollRef = useRef<HTMLDivElement>(null);
  
  const [isPaused, setIsPaused] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [reviewContainerWidth, setReviewContainerWidth] = useState(0);
  
  const latestProductsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'products'), limit(10));
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
      limit(10)
    );
  }, [db]);

  const { data: latestProducts, isLoading: latestLoading } = useCollection(latestProductsQuery);
  const { data: topProducts, isLoading: topLoading } = useCollection(topProductsQuery);
  const { data: featuredReviews, isLoading: reviewsLoading } = useCollection(featuredReviewsQuery);

  // Duplicate items for seamless looping
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

  // Persistent motion value for x position (Modules)
  const x = useMotionValue(0);

  // NEURAL DRIFT ENGINE: Infinite auto-scroll for modules
  useAnimationFrame((time, delta) => {
    if (!latestLoading && containerWidth > 0) {
      let currentX = x.get();
      if (currentX <= -containerWidth) {
        x.set(currentX + containerWidth);
      } else if (currentX > 0) {
        x.set(currentX - containerWidth);
      }

      if (!isPaused) {
        const pixelsPerSecond = 40; 
        const moveBy = (pixelsPerSecond * delta) / 1000;
        x.set(x.get() - moveBy);
      }
    }
  });

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "VOID WEAR",
    "url": "https://voidwear.co.in",
    "logo": "https://voidwear.co.in/logo.png",
    "sameAs": [
      "https://www.instagram.com/voidwearofficial_?igsh=MWs4NWJ6aXRhcnZ2dA==",
      "https://www.facebook.com/share/1DbtMjAWYh/",
      "https://x.com/voidwearoff_26"
    ],
    "description": "Premium futuristic technical shells for the digital migration. Designed in the void, crafted for the world."
  };

  return (
    <div className="space-y-0 bg-transparent text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      
      <Hero />

      {/* System Definition Section */}
      <section className="py-32 md:py-48 bg-white/[0.01] border-y border-white/5 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-10"
            >
              <div className="space-y-4">
                <span className="text-[10px] font-bold tracking-[0.8em] text-white/30 uppercase">SYSTEM // DEFINITION</span>
                <h2 className="text-4xl md:text-6xl font-black tracking-tight glow-text uppercase leading-none">
                  HIGH-SPEED <br /> UPLINK
                </h2>
              </div>
              <p className="text-sm md:text-base text-white/60 tracking-[0.2em] leading-relaxed uppercase font-light max-w-xl">
                VOID WEAR provides high-performance technical apparel. 
                Our assemblages are precision-engineered for the digital migration, utilizing advanced materials to create 
                protective shells for the high-density urban environment.
              </p>
              <div className="pt-4">
                <Link href="/products" className="group flex items-center gap-6 text-[10px] font-black tracking-[0.5em] text-white uppercase border-b border-white/20 pb-4 w-fit hover:border-white transition-all">
                  INITIALIZE ACQUISITION
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FeatureNode 
                icon={<Package className="w-5 h-5" />} 
                title="MODULAR" 
                desc="Technical shells and bases." 
              />
              <FeatureNode 
                icon={<FileText className="w-5 h-5" />} 
                title="NEURAL" 
                desc="Engineered fabric protocols." 
              />
              <FeatureNode 
                icon={<Globe className="w-5 h-5" />} 
                title="GLOBAL" 
                desc="Secure frontier transit nodes." 
              />
              <FeatureNode 
                icon={<ShieldCheck className="w-5 h-5" />} 
                title="SECURE" 
                desc="Validated financial integrity." 
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Seamless Loop Gallery Section */}
      <section className="py-32 md:py-48 bg-transparent relative overflow-hidden" aria-label="Latest Arrivals">
        <div className="container mx-auto px-6 mb-16 md:mb-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-6">
              <span className="text-[10px] font-bold tracking-[1em] text-white/40 uppercase">SYSTEM // GALLERY</span>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter glow-text uppercase leading-none">
                LATEST <br /> MODULES
              </h2>
            </div>
            <Link href="/products" className="text-[10px] font-bold tracking-[0.5em] text-white/70 hover:text-white transition-all duration-700 border-b border-white/10 hover:border-white pb-4 w-fit uppercase flex items-center gap-4">
              VIEW FULL COLLECTION
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
            drag="x"
            dragConstraints={{ left: -containerWidth * 1.5, right: containerWidth * 0.5 }}
            dragElastic={0.05}
            style={{ x }}
            className="flex gap-8 md:gap-12 whitespace-nowrap px-6 md:px-0"
            onDragStart={() => setIsPaused(true)}
            onDragEnd={() => setIsPaused(false)}
          >
            {latestLoading ? (
              [1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-[280px] md:w-[320px] aspect-[3/4] bg-white/5 animate-pulse border border-white/10" />
              ))
            ) : displayProducts.length > 0 ? (
              displayProducts.map((product, idx) => (
                <div key={`${product.id}-${idx}`} className="w-[280px] md:w-[320px] shrink-0">
                  <ProductCard product={product as any} />
                </div>
              ))
            ) : (
              <div className="py-48 text-center opacity-40 border border-dashed border-white/20 w-screen flex flex-col items-center justify-center gap-8">
                <Package className="w-16 h-16 stroke-[0.5px]" />
                <p className="text-[12px] tracking-[1em] uppercase font-black text-center px-12">NO ASSEMBLAGES DETECTED</p>
              </div>
            )}
          </motion.div>
          
          <div className="mt-16 container mx-auto px-6 flex items-center gap-6 text-white/20">
            <div className="text-[8px] tracking-[0.6em] uppercase font-black">INTERACTIVE TRANSMISSION // DRAG TO CONTROL</div>
            <div className="flex-1 h-[1px] bg-white/10"></div>
          </div>
        </div>
      </section>

      {/* Featured Reviews Section - Recalibrated for Draggable Navigation */}
      <section className="py-32 md:py-48 bg-white/[0.01] border-y border-white/5 overflow-hidden">
        <div className="container mx-auto px-6 mb-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
             <div className="space-y-6">
                <span className="text-[10px] font-bold tracking-[1.2em] text-white/30 uppercase">FIELD REPORTS</span>
                <h2 className="text-4xl md:text-7xl font-black tracking-tight glow-text uppercase leading-none">OPERATOR <br /> FEEDBACK</h2>
             </div>
             <div className="flex items-center gap-3 text-white/40">
                <MessageSquare className="w-4 h-4" />
                <span className="text-[9px] tracking-[0.3em] font-bold uppercase">AUDITED TRANSMISSIONS</span>
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
             {reviewsLoading ? (
               [1, 2, 3].map(i => <div key={i} className="min-w-[320px] md:min-w-[400px] h-64 bg-white/5 animate-pulse border border-white/10" />)
             ) : featuredReviews && featuredReviews.length > 0 ? (
               featuredReviews.map((review, idx) => (
                 <motion.div 
                   key={review.id}
                   initial={{ opacity: 0, x: 20 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   transition={{ delay: idx * 0.1 }}
                   viewport={{ once: true }}
                   className="min-w-[320px] md:min-w-[400px] p-10 border border-white/5 bg-white/[0.005] space-y-8 backdrop-blur-3xl hover:border-white/20 transition-all duration-500 group select-none"
                 >
                    <div className="flex justify-between items-start">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 border border-white/10 flex items-center justify-center bg-white/5">
                             <User className="w-4 h-4 text-white/40" />
                          </div>
                          <div>
                             <p className="text-[10px] font-black tracking-widest uppercase text-white">{review.userName}</p>
                             <p className="text-[8px] tracking-widest text-white/20 uppercase font-bold">VERIFIED_OPERATOR</p>
                          </div>
                       </div>
                       <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-2.5 h-2.5 ${i < review.rating ? 'text-white fill-current' : 'text-white/10'}`} />
                          ))}
                       </div>
                    </div>
                    <p className="text-[11px] tracking-widest leading-relaxed uppercase text-white/60 font-medium line-clamp-4 group-hover:text-white/80 transition-colors">
                       "{review.comment}"
                    </p>
                    <div className="pt-4 border-t border-white/5 flex items-center justify-between opacity-40 group-hover:opacity-100 transition-opacity">
                       <span className="text-[7px] font-black tracking-widest uppercase">{new Date(review.createdAt).toLocaleDateString()}</span>
                       <Zap className="w-2.5 h-2.5" />
                    </div>
                 </motion.div>
               ))
             ) : (
               <div className="w-full py-24 text-center opacity-20 border border-dashed border-white/5">
                  <p className="text-[10px] tracking-[1em] uppercase font-bold">AWAITING FIELD DATA</p>
               </div>
             )}
          </motion.div>
        </div>

        <div className="mt-16 container mx-auto px-6 flex items-center gap-6 text-white/20">
           <div className="text-[8px] tracking-[0.6em] uppercase font-black">NEURAL FEED // DRAG TO NAVIGATE REPORTS</div>
           <div className="flex-1 h-[1px] bg-white/10"></div>
        </div>
      </section>

      {/* Top Purchased Section */}
      <section className="py-32 md:py-48 bg-transparent" aria-label="Top Modules">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-8 mb-24 md:mb-32">
            <span className="text-[10px] font-bold tracking-[1.2em] text-white/30 uppercase">MOST TRANSMITTED</span>
            <h2 className="text-4xl md:text-7xl font-black tracking-tight glow-text uppercase leading-none">Top Modules</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
            {topLoading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="aspect-[3/4] bg-white/10 animate-pulse border border-white/10" />
              ))
            ) : topProducts && topProducts.length > 0 ? (
              topProducts.map((product, idx) => (
                <motion.div 
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.2, duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <div className="relative group">
                    <ProductCard product={product as any} />
                    <div className="absolute -top-6 -left-6 w-14 h-14 border border-white/20 bg-black flex items-center justify-center text-[12px] font-black tracking-widest text-white/80 z-30 shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                      0{idx + 1}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-48 text-center opacity-20">
                <p className="text-[12px] tracking-[1em] uppercase font-black">SYSTEM IDLE</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section className="py-48 md:py-64 bg-transparent overflow-hidden" aria-label="Brand Manifesto">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-16">
            <span className="text-[10px] tracking-[1.5em] text-white/40 uppercase font-black">MANIFESTO</span>
            <h3 className="text-2xl md:text-5xl font-light tracking-[0.1em] leading-relaxed uppercase">
              WE ARE THE SHELL <br /> FOR YOUR <span className="text-white font-black glow-text">DIGITAL MIGRATION</span>. 
              TECHNICAL APPAREL FOR COMPLEX IDENTITIES.
            </h3>
            <div className="w-[1px] h-32 bg-gradient-to-b from-white/40 to-transparent mx-auto"></div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureNode({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.02)" }}
      className="p-8 border border-white/5 bg-white/[0.005] space-y-6 backdrop-blur-3xl group hover:border-white/20 transition-all duration-500"
    >
      <div className="text-white/20 group-hover:text-white transition-colors duration-500">
        {icon}
      </div>
      <div className="space-y-2">
        <h3 className="text-[10px] font-black tracking-[0.4em] uppercase text-white">{title}</h3>
        <p className="text-[9px] text-white/30 tracking-[0.2em] uppercase font-bold leading-relaxed group-hover:text-white/60 transition-colors duration-500">{desc}</p>
      </div>
    </motion.div>
  );
}
