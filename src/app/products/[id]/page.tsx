'use client';

import { use, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ChevronRight, Heart, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { addToCart } from '@/firebase/cart-actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [adding, setAdding] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const productRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, 'products', id);
  }, [db, id]);

  const { data: product, isLoading } = useDoc(productRef);

  const handleAdd = async () => {
    if (!selectedSize) {
      toast({ title: "CONFIGURATION REQUIRED", description: "SELECT A SIZE MODULE TO PROCEED." });
      return;
    }
    if (!user || !db || !product) {
      toast({ title: "ACCESS DENIED", description: "AUTHENTICATION REQUIRED." });
      return;
    }
    setAdding(true);
    try {
      // Pass the complete product object which includes color metadata
      await addToCart(db, user.uid, product as any, selectedSize);
      toast({ title: "MODULE ADDED", description: `SIZE ${selectedSize} ASSEMBLAGE LOGGED.` });
    } catch (e) {
      console.error(e);
    } finally {
      setAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="w-10 h-10 animate-spin text-white/80" />
          <span className="text-[10px] tracking-[1em] text-white/80 uppercase">Syncing Module...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return notFound();
  }

  const displayImage = (product as any)?.imageUrls?.[0] || 'https://picsum.photos/seed/placeholder/800/1000';
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  // Product Structured Data for SEO
  const productJsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": displayImage,
    "description": product.description,
    "brand": {
      "@type": "Brand",
      "name": "VOID WEAR"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://void-wear.vercel.app/products/${product.id}`,
      "priceCurrency": "INR",
      "price": product.basePrice,
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition"
    }
  };

  return (
    <div className="pt-32 pb-24 bg-transparent min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      
      <div className="container mx-auto px-6">
        <div className="flex items-center gap-4 text-[10px] tracking-[0.3em] text-white/70 mb-12 uppercase font-bold">
          <Link href="/" className="hover:text-white transition-colors">HOME</Link>
          <ChevronRight className="w-3 h-3 opacity-60" />
          <Link href="/products" className="hover:text-white transition-colors">COLLECTION</Link>
          <ChevronRight className="w-3 h-3 opacity-60" />
          <span className="text-white">{(product as any)?.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-24 items-start">
          <div className="space-y-8">
            <div className="relative aspect-[3/4] bg-white/5 group cursor-zoom-in overflow-hidden border border-white/10 glow-border">
              <Image 
                src={displayImage} 
                alt={(product as any)?.name || 'Product module visualization'} 
                fill 
                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
                unoptimized
                priority
              />
            </div>
          </div>

          <div className="space-y-12 lg:sticky lg:top-32">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-[10px] font-bold tracking-[0.5em] text-white/70 uppercase">
                <span className="w-8 h-[1px] bg-white/40"></span>
                {(product as any)?.category}
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight glow-text uppercase text-white">{(product as any)?.name}</h1>
              <p className="text-2xl font-light tracking-widest text-white/90">₹{(product as any)?.basePrice}</p>
            </div>

            <p className="text-sm tracking-widest leading-relaxed text-white/70 uppercase font-light">
              {(product as any)?.description}
            </p>

            <div className="space-y-8">
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase text-white/80">SELECT SIZE</h4>
                <div className="flex flex-wrap gap-4">
                  {availableSizes.map(size => {
                    const isOutOfStock = (product as any)?.stockBySize && ((product as any).stockBySize[size] || 0) <= 0;
                    return (
                      <button 
                        key={size} 
                        disabled={isOutOfStock}
                        onClick={() => setSelectedSize(size)}
                        className={cn(
                          "w-14 h-14 border flex items-center justify-center text-[10px] font-bold tracking-widest transition-all backdrop-blur-sm",
                          selectedSize === size ? "bg-white text-black border-white" : "border-white/20 hover:border-white bg-white/[0.02] text-white/70",
                          isOutOfStock && "opacity-20 cursor-not-allowed line-through"
                        )}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={handleAdd}
                  disabled={adding}
                  className="flex-1 bg-white text-black hover:bg-white/90 h-20 text-xs font-bold tracking-[0.5em] rounded-none group shadow-[0_0_30px_rgba(255,255,255,0.15)]"
                >
                  {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ADD TO BAG'}
                  <ShoppingBag className="ml-4 w-4 h-4 group-hover:scale-110 transition-transform" />
                </Button>
                <Button variant="outline" size="icon" className="w-20 h-20 border-white/20 hover:bg-white hover:text-black rounded-none bg-transparent">
                  <Heart className="w-5 h-5 text-white/70 group-hover:text-black" />
                </Button>
              </div>
            </div>

            <div className="border-t border-white/10 pt-12 space-y-8">
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase text-white/80">SPECIFICATIONS</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] tracking-widest text-white/70">
                  {(product as any)?.details?.map((detail: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-3 uppercase font-light">
                      <span className="w-1 h-1 bg-white/40 rounded-full"></span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
