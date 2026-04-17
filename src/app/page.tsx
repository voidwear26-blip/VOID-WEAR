
'use client';

import { Hero } from '@/components/hero';
import { ProductCard } from '@/components/product-card';
import Link from 'next/link';
import Image from 'next/image';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, limit, query } from 'firebase/firestore';
import { Package } from 'lucide-react';

export default function Home() {
  const db = useFirestore();
  
  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'products'), limit(6));
  }, [db]);

  const { data: products, isLoading } = useCollection(productsQuery);

  return (
    <div className="space-y-0 bg-transparent text-white">
      <Hero />
      
      <section className="py-24 md:py-48 bg-transparent relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 md:mb-32">
            <div className="space-y-6">
              <span className="text-[10px] font-bold tracking-[0.8em] text-white/20 uppercase font-bold">CATALOGUE // SEASON 01</span>
              <h2 className="text-4xl md:text-7xl font-bold tracking-tighter glow-text uppercase leading-none">
                LATEST <br /> ASSEMBLAGES
              </h2>
            </div>
            <Link href="/products" className="text-[10px] font-bold tracking-[0.5em] text-white/40 hover:text-white transition-all duration-500 border-b border-white/5 hover:border-white pb-4 w-fit uppercase">
              VIEW FULL COLLECTION
            </Link>
          </div>

          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-16 overflow-x-auto md:overflow-visible pb-12 -mx-6 px-6 md:mx-0 md:px-0 no-scrollbar snap-x snap-mandatory scroll-smooth">
            {isLoading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="min-w-[85vw] aspect-[3/4] bg-white/5 animate-pulse rounded-none" />
              ))
            ) : products && products.length > 0 ? (
              products.map((product) => (
                <div key={product.id} className="min-w-[85vw] sm:min-w-[45vw] md:min-w-0 snap-center">
                  <ProductCard product={product as any} />
                </div>
              ))
            ) : (
              <div className="col-span-full py-32 text-center opacity-20 border border-dashed border-white/10 w-full flex flex-col items-center justify-center gap-6">
                <Package className="w-12 h-12 stroke-[0.5px]" />
                <p className="text-[10px] tracking-[0.8em] uppercase font-bold text-center px-6">NO ASSEMBLAGES DETECTED IN DATABASE</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-64 bg-transparent overflow-hidden border-t border-white/5">
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

      <footer className="py-48 bg-transparent border-t border-white/5">
        <div className="container mx-auto px-6 grid md:grid-cols-4 gap-24">
          <div className="md:col-span-2 space-y-12">
            <Link href="/" className="flex items-center gap-4 group">
              <Image 
                src="/logo.png" 
                alt="VOID WEAR" 
                width={40} 
                height={40} 
                className="h-8 w-auto object-contain brightness-200 grayscale opacity-50 group-hover:opacity-100 transition-opacity"
                unoptimized
              />
              <span className="text-xs font-black tracking-[0.4em] uppercase text-white/50 group-hover:text-white transition-colors">VOID WEAR</span>
            </Link>
            <p className="text-white/30 text-[10px] max-w-sm tracking-[0.4em] leading-loose uppercase font-light">
              REDEFINING APPAREL FOR THE ERA OF ACCELERATION. DESIGNED IN THE VOID, CRAFTED FOR THE WORLD. EST 2024.
            </p>
            <div className="flex flex-wrap gap-12">
              {['INSTAGRAM', 'TWITTER', 'DISCORD', 'TELEGRAM'].map((social) => (
                <a 
                  key={social} 
                  href="#" 
                  className="text-[9px] font-bold tracking-[0.4em] text-white/20 hover:text-white transition-all duration-300 hover:glow-text uppercase"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
          
          <div className="space-y-8">
            <h4 className="text-[10px] font-bold tracking-[0.5em] text-white/40 uppercase">RESOURCES</h4>
            <div className="flex flex-col gap-6 text-[9px] text-white/20 tracking-[0.3em] uppercase font-bold">
              <Link href="/shipping" className="hover:text-white transition-colors">SHIPPING & RETURNS</Link>
              <Link href="/contact" className="hover:text-white transition-colors">CONTACT SUPPORT</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">PRIVACY PROTOCOL</Link>
              <Link href="/terms" className="hover:text-white transition-colors">TERMS OF SERVICE</Link>
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="text-[10px] font-bold tracking-[0.5em] text-white/40 uppercase">TRANSMISSIONS</h4>
            <p className="text-[9px] text-white/20 tracking-[0.3em] leading-relaxed uppercase font-bold">FOR SUPPORT: VOIDWEAR26@GMAIL.COM</p>
          </div>
        </div>
        
        <div className="container mx-auto px-6 mt-48 text-center">
          <p className="text-[8px] text-white/10 tracking-[1.5em] uppercase font-bold">© 2024 VOID WEAR INC. SECURED TRANSMISSION.</p>
        </div>
      </footer>
    </div>
  );
}
