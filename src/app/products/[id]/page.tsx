
'use client';

import { use, useState, useMemo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ChevronRight, Heart, Loader2, Info } from 'lucide-react';
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
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const productRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, 'products', id);
  }, [db, id]);

  const { data: product, isLoading } = useDoc(productRef);

  // Derive available sizes based on stock matrix
  const availableSizes = useMemo(() => {
    if (!product?.stockMatrix) return ['DEFAULT'];
    const keys = Object.keys(product.stockMatrix);
    if (keys.length === 0) return ['DEFAULT']; // Legacy fallback
    
    return keys.filter(size => {
      const colors = product.stockMatrix[size];
      return Object.values(colors).some((qty: any) => qty > 0);
    });
  }, [product]);

  // Derive available colors for selected size
  const availableColors = useMemo(() => {
    if (!product?.stockMatrix || !selectedSize) return ['OBSIDIAN'];
    const colors = product.stockMatrix[selectedSize] || {};
    const keys = Object.keys(colors);
    if (keys.length === 0) return ['OBSIDIAN'];
    
    return keys.filter(color => colors[color] > 0);
  }, [product, selectedSize]);

  const handleAdd = async () => {
    if (!selectedSize || !selectedColor) {
      toast({ 
        variant: "destructive",
        title: "CONFIGURATION REQUIRED", 
        description: "PLEASE SELECT BOTH SIZE AND COLOR NODES." 
      });
      return;
    }
    
    if (!user) {
      toast({ 
        variant: "destructive",
        title: "AUTHENTICATION REQUIRED", 
        description: "LOG IN TO YOUR ENTITY TO ACCESS THE BAG." 
      });
      return;
    }

    if (!db || !product) return;

    setAdding(true);
    try {
      await addToCart(db, user.uid, {
        ...product,
        id: product.id,
        color: selectedColor 
      } as any, selectedSize);
      
      toast({ 
        title: "MODULE ADDED", 
        description: `TRANSITIONING ${selectedSize} // ${selectedColor} TO BAG.` 
      });
    } catch (e) {
      console.error('[ACQUISITION_FAILURE]', e);
      toast({
        variant: "destructive",
        title: "TRANSMISSION FAILED",
        description: "COULD NOT SYNC WITH BAG. TRIGGER NEURAL AUDIT."
      });
    } finally {
      setAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="w-10 h-10 animate-spin text-white/40" />
          <span className="text-[10px] tracking-[1em] text-white/60 uppercase font-black">Syncing Module...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return notFound();
  }

  const displayImage = (product as any)?.imageUrls?.[0] || 'https://picsum.photos/seed/void-placeholder/800/1000';

  return (
    <div className="pt-32 pb-24 bg-transparent min-h-screen">
      <div className="container mx-auto px-6">
        <div className="flex items-center gap-4 text-[10px] tracking-[0.3em] text-white/40 mb-12 uppercase font-bold">
          <Link href="/" className="hover:text-white transition-colors">HOME</Link>
          <ChevronRight className="w-3 h-3 opacity-30" />
          <Link href="/products" className="hover:text-white transition-colors">COLLECTION</Link>
          <ChevronRight className="w-3 h-3 opacity-30" />
          <span className="text-white">{(product as any)?.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-24 items-start">
          <div className="space-y-8">
            <div className="relative aspect-[3/4] bg-white/[0.02] group overflow-hidden border border-white/10 glow-border">
              <Image 
                src={displayImage} 
                alt={(product as any)?.name || 'Product module visualization'} 
                fill 
                className="object-cover grayscale-0 group-hover:grayscale transition-all duration-1000"
                unoptimized
                priority
              />
            </div>
          </div>

          <div className="space-y-12 lg:sticky lg:top-32">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-[10px] font-bold tracking-[0.5em] text-white/50 uppercase">
                <span className="w-8 h-[1px] bg-white/20"></span>
                {(product as any)?.category}
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight glow-text uppercase text-white">{(product as any)?.name}</h1>
              <p className="text-2xl font-light tracking-widest text-white/90">₹{(product as any)?.basePrice}</p>
            </div>

            <p className="text-sm tracking-widest leading-relaxed text-white/60 uppercase font-light max-w-xl">
              {(product as any)?.description}
            </p>

            <div className="space-y-10">
              {/* SIZE SELECTION */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase text-white/40">01. SELECT SIZE</h4>
                <div className="flex flex-wrap gap-4">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => {
                    const isDisabled = !availableSizes.includes(size) && availableSizes[0] !== 'DEFAULT';
                    return (
                      <button 
                        key={size} 
                        disabled={isDisabled}
                        onClick={() => {
                          setSelectedSize(size);
                          setSelectedColor(null);
                        }}
                        className={cn(
                          "w-14 h-14 border flex items-center justify-center text-[10px] font-bold tracking-widest transition-all backdrop-blur-sm",
                          selectedSize === size ? "bg-white text-black border-white" : "border-white/10 hover:border-white/40 bg-white/[0.01] text-white/50",
                          isDisabled && "opacity-5 cursor-not-allowed border-transparent"
                        )}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* COLOR SELECTION */}
              {selectedSize && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-700">
                  <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase text-white/40">02. SELECT COLOR</h4>
                  <div className="flex flex-wrap gap-4">
                    {availableColors.map(color => (
                      <button 
                        key={color} 
                        onClick={() => setSelectedColor(color)}
                        className={cn(
                          "px-6 h-12 border flex items-center justify-center text-[9px] font-black tracking-[0.3em] uppercase transition-all backdrop-blur-sm",
                          selectedColor === color ? "bg-white text-black border-white" : "border-white/10 hover:border-white/40 bg-white/[0.01] text-white/50"
                        )}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-6 pt-4">
                <Button 
                  onClick={handleAdd}
                  disabled={adding || !selectedSize || !selectedColor}
                  className="w-full bg-white text-black hover:bg-white/90 h-20 text-[11px] font-black tracking-[0.5em] rounded-none group shadow-[0_0_40px_rgba(255,255,255,0.1)] disabled:opacity-30 transition-all duration-500"
                >
                  {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      ADD TO TRANSMISSION BAG
                      <ShoppingBag className="ml-4 w-4 h-4 group-hover:scale-110 transition-transform" />
                    </>
                  )}
                </Button>
                
                {!user && (
                   <div className="flex items-center gap-3 p-4 border border-white/5 bg-white/[0.01] opacity-60">
                      <Info className="w-3.5 h-3.5 text-white/40" />
                      <p className="text-[8px] tracking-widest text-white/60 uppercase font-bold">LINK YOUR IDENTITY TO INITIALIZE ACQUISITION.</p>
                   </div>
                )}
              </div>
            </div>

            <div className="border-t border-white/10 pt-12 space-y-8">
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase text-white/40">SPECIFICATIONS</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] tracking-widest text-white/60">
                  {(product as any)?.details?.map((detail: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-3 uppercase font-light">
                      <span className="w-1 h-1 bg-white/20 rounded-full"></span>
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
