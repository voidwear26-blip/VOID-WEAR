
'use client';

import { Hero } from '@/components/hero';
import { ProductCard } from '@/components/product-card';
import Link from 'next/link';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, limit, query } from 'firebase/firestore';
import { Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

export default function Home() {
  const db = useFirestore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [constraints, setConstraints] = useState({ left: 0, right: 0 });
  
  const latestProductsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'products'), limit(10));
  }, [db]);

  const topProductsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'products'), limit(3));
  }, [db]);

  const { data: latestProducts, isLoading: latestLoading } = useCollection(latestProductsQuery);
  const { data: topProducts, isLoading: topLoading } = useCollection(topProductsQuery);

  useEffect(() => {
    if (containerRef.current && latestProducts) {
      const scrollWidth = containerRef.current.scrollWidth;
      const offsetWidth = containerRef.current.offsetWidth;
      setConstraints({ left: -(scrollWidth - offsetWidth), right: 0 });
    }
  }, [latestProducts]);

  return (
    <div className="space-y-0 bg-transparent text-white">
      <Hero />
      
      {/* Interactive Gallery Section */}
      <section className="py-24 md:py-48 bg-transparent relative overflow-hidden">
        <div className="container mx-auto px-6 mb-20 md:mb-32">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-6">
              <span className="text-[10px] font-bold tracking-[0.8em] text-white/20 uppercase">SYSTEM // GALLERY</span>
              <h2 className="text-4xl md:text-7xl font-bold tracking-tighter glow-text uppercase leading-none">
                LATEST <br /> ASSEMBLAGES
              </h2>
            </div>
            <Link href="/products" className="text-[10px] font-bold tracking-[0.5em] text-white/40 hover:text-white transition-all duration-500 border-b border-white/5 hover:border-white pb-4 w-fit uppercase">
              VIEW FULL COLLECTION
            </Link>
          </div>
        </div>

        {/* Draggable Gallery Module */}
        <div className="relative cursor-grab active:cursor-grabbing px-6 md:px-0">
          <motion.div 
            ref={containerRef}
            drag="x"
            dragConstraints={constraints}
            className="flex gap-8 md:gap-16 whitespace-nowrap overflow-visible"
            style={{ touchAction: 'none' }}
          >
            {latestLoading ? (
              [1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-[300px] md:w-[450px] aspect-[3/4] bg-white/5 animate-pulse" />
              ))
            ) : latestProducts && latestProducts.length > 0 ? (
              latestProducts.map((product) => (
                <div key={product.id} className="w-[300px] md:w-[450px] shrink-0">
                  <ProductCard product={product as any} />
                </div>
              ))
            ) : (
              <div className="py-32 text-center opacity-20 border border-dashed border-white/10 w-screen flex flex-col items-center justify-center gap-6">
                <Package className="w-12 h-12 stroke-[0.5px]" />
                <p className="text-[10px] tracking-[0.8em] uppercase font-bold text-center px-6">NO ASSEMBLAGES DETECTED</p>
              </div>
            )}
          </motion.div>
          
          {/* Visual Indicator */}
          <div className="mt-16 container mx-auto px-6 flex items-center gap-4 text-white/10">
            <div className="text-[8px] tracking-[0.5em] uppercase font-bold">DRAG TO EXPLORE</div>
            <div className="flex-1 h-[1px] bg-white/5"></div>
          </div>
        </div>
      </section>

      {/* Top Purchased Section */}
      <section className="py-32 md:py-64 bg-white/[0.01] border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-8 mb-24 md:mb-48">
            <span className="text-[10px] font-bold tracking-[1em] text-white/20 uppercase">MOST TRANSMITTED</span>
            <h2 className="text-4xl md:text-8xl font-black tracking-tight glow-text uppercase leading-none">Top Modules</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 md:gap-24">
            {topLoading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="aspect-[3/4] bg-white/5 animate-pulse" />
              ))
            ) : topProducts && topProducts.length > 0 ? (
              topProducts.map((product, idx) => (
                <motion.div 
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.2 }}
                  viewport={{ once: true }}
                >
                  <div className="relative group">
                    <ProductCard product={product as any} />
                    <div className="absolute -top-6 -left-6 w-12 h-12 border border-white/10 bg-black flex items-center justify-center text-[10px] font-bold tracking-widest text-white/20 z-20">
                      0{idx + 1}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-32 text-center opacity-10">
                <p className="text-[10px] tracking-[1em] uppercase">SYSTEM IDLE</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section className="py-64 bg-transparent overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-16">
            <span className="text-[10px] tracking-[1em] text-white/20 uppercase font-bold">MANIFESTO</span>
            <h3 className="text-2xl md:text-5xl font-light tracking-[0.2em] leading-relaxed uppercase">
              WE ARE THE SHELL <br /> FOR YOUR <span className="text-white font-bold glow-text">DIGITAL MIGRATION</span>. 
              MINIMAL ARCHITECTURE FOR COMPLEX IDENTITIES.
            </h3>
            <div className="w-[1px] h-32 bg-gradient-to-b from-white to-transparent mx-auto"></div>
          </div>
        </div>
      </section>
    </div>
  );
}
