
'use client';

import { use, useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ChevronRight, Heart, Loader2, Zap, Share2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase, useUser, useCollection } from '@/firebase';
import { doc, collection, query, where, limit } from 'firebase/firestore';
import { addToCart } from '@/firebase/cart-actions';
import { toggleWishlist } from '@/firebase/wishlist-actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { FieldReports } from '@/components/field-reports';
import { ProductCard } from '@/components/product-card';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const productRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, 'products', id);
  }, [db, id]);

  const { data: product, isLoading: isProductLoading } = useDoc(productRef);

  const wishlistRef = useMemoFirebase(() => {
    if (!db || !user || !id) return null;
    return doc(db, 'users', user.uid, 'wishlist', id);
  }, [db, user, id]);

  const { data: wishlistEntry } = useDoc(wishlistRef);
  const isInWishlist = !!wishlistEntry;

  // Similar Products Intelligence
  const similarProductsQuery = useMemoFirebase(() => {
    if (!db || !product?.category) return null;
    return query(
      collection(db, 'products'),
      where('category', '==', product.category),
      limit(4)
    );
  }, [db, product?.category]);

  const { data: rawSimilar } = useCollection(similarProductsQuery);
  const similarProducts = useMemo(() => {
    return rawSimilar?.filter(p => p.id !== id).slice(0, 3) || [];
  }, [rawSimilar, id]);

  const availableSizes = useMemo(() => {
    if (!product?.stockMatrix) return ['DEFAULT'];
    const keys = Object.keys(product.stockMatrix);
    if (keys.length === 0) return ['DEFAULT'];
    
    return keys.filter(size => {
      const colors = product.stockMatrix[size];
      return Object.values(colors).some((qty: any) => qty > 0);
    });
  }, [product]);

  const availableColors = useMemo(() => {
    if (!product?.stockMatrix || !selectedSize) return ['OBSIDIAN'];
    const colors = product.stockMatrix[selectedSize] || {};
    const keys = Object.keys(colors);
    if (keys.length === 0) return ['OBSIDIAN'];
    
    return keys.filter(color => colors[color] > 0);
  }, [product, selectedSize]);

  const handleAuthGuard = () => {
    if (!user) {
      toast({ title: "AUTHENTICATION REQUIRED", description: "LOG IN TO YOUR ENTITY TO CONTINUE." });
      router.push('/login');
      return false;
    }
    return true;
  };

  const handleAdd = async () => {
    if (!handleAuthGuard()) return;
    if (!selectedSize || !selectedColor) {
      toast({ variant: "destructive", title: "CONFIGURATION REQUIRED", description: "SELECT SIZE AND COLOR NODES." });
      return;
    }
    if (!db || !product) return;

    setAdding(true);
    try {
      await addToCart(db, user!.uid, { ...product, id: product.id, color: selectedColor } as any, selectedSize);
      toast({ title: "MODULE ADDED", description: "ASSEMBLAGE TRANSITIONED TO BAG." });
    } catch (e) {
      console.error(e);
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!handleAuthGuard()) return;
    if (!selectedSize || !selectedColor) {
      toast({ variant: "destructive", title: "CONFIGURATION REQUIRED", description: "SELECT SIZE AND COLOR NODES." });
      return;
    }
    if (!db || !product) return;

    setBuying(true);
    try {
      await addToCart(db, user!.uid, { ...product, id: product.id, color: selectedColor } as any, selectedSize);
      router.push('/checkout');
    } catch (e) {
      console.error(e);
    } finally {
      setBuying(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!handleAuthGuard()) return;
    setToggling(true);
    try {
      await toggleWishlist(db!, user!.uid, product as any);
      toast({ 
        title: isInWishlist ? "MODULE REMOVED" : "MODULE SECURED", 
        description: isInWishlist ? "STASIS LOG SEVERED." : "ASSEMBLAGE ADDED TO STASIS." 
      });
    } catch (e) {
      console.error(e);
    } finally {
      setToggling(false);
    }
  };

  const handleShare = async () => {
    if (!product) return;
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareData = {
      title: product.name,
      text: `CHECK OUT THIS VOID WEAR MODULE: ${product.name}\n${product.description}`,
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Silent fail
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({ title: "LINK EXTRACTED", description: "PRODUCT UPLINK SAVED TO CLIPBOARD." });
      } catch (err) {
        toast({ variant: "destructive", title: "SHARE_FAILURE" });
      }
    }
  };

  if (isProductLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="w-10 h-10 animate-spin text-white/20" />
          <span className="text-[10px] tracking-[1em] uppercase font-bold text-white/40">Syncing Module...</span>
        </div>
      </div>
    );
  }

  if (!product) return notFound();

  const displayImages = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls : ['https://picsum.photos/seed/void-placeholder/800/1000'];

  return (
    <div className="pt-32 pb-24 bg-transparent min-h-screen">
      <div className="container mx-auto px-6">
        <div className="flex items-center gap-4 text-[10px] tracking-[0.3em] text-white/40 mb-12 uppercase font-bold">
          <Link href="/" className="hover:text-white transition-colors">HOME</Link>
          <ChevronRight className="w-3 h-3 opacity-30" />
          <Link href="/products" className="hover:text-white transition-colors">COLLECTION</Link>
          <ChevronRight className="w-3 h-3 opacity-30" />
          <span className="text-white">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-24 items-start pb-32">
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-6">
              {displayImages.map((url: string, idx: number) => (
                <div key={url + idx} className="relative aspect-[3/4] bg-white/[0.02] overflow-hidden border border-white/10 glow-border group">
                  <Image src={url} alt={product.name} fill className="object-cover transition-all duration-1000 group-hover:scale-105" unoptimized priority={idx === 0} />
                  
                  {idx === 0 && (
                    <div className="absolute top-8 right-8 z-30 flex flex-col gap-4 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-500">
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleWishlistToggle}
                        disabled={toggling}
                        className={`p-5 rounded-full border backdrop-blur-xl transition-all ${
                          isInWishlist ? 'bg-white text-black border-white shadow-[0_0_20px_white]' : 'bg-black/60 text-white border-white/20 hover:border-white'
                        }`}
                        title="STASIS LOG"
                      >
                        {toggling ? <Loader2 className="w-6 h-6 animate-spin" /> : <Heart className={`w-6 h-6 ${isInWishlist ? 'fill-current' : ''}`} />}
                      </motion.button>

                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleShare}
                        className="p-5 rounded-full border border-white/20 bg-black/60 text-white hover:border-white backdrop-blur-xl transition-all"
                        title="SHARE TRANSMISSION"
                      >
                        <Share2 className="w-6 h-6" />
                      </motion.button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-12 lg:sticky lg:top-32">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-[10px] font-bold tracking-[0.5em] text-white/50 uppercase">
                <span className="w-8 h-[1px] bg-white/20"></span>
                {product.category}
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight glow-text uppercase text-white">{product.name}</h1>
              <p className="text-2xl font-light tracking-widest text-white/90">₹{product.basePrice}</p>
            </div>

            <p className="text-sm tracking-widest leading-relaxed text-white/60 uppercase font-light max-w-xl">
              {product.description}
            </p>

            <div className="space-y-10">
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase text-white/40">01. SELECT SIZE</h4>
                <div className="flex flex-wrap gap-4">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => {
                    const isDisabled = !availableSizes.includes(size) && availableSizes[0] !== 'DEFAULT';
                    return (
                      <button 
                        key={size} 
                        disabled={isDisabled}
                        onClick={() => { setSelectedSize(size); setSelectedColor(null); }}
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

              <div className="grid gap-4 pt-4">
                <Button 
                  onClick={handleBuyNow}
                  disabled={buying || !selectedSize || !selectedColor}
                  className="w-full bg-white text-black hover:bg-white/90 h-20 text-[11px] font-black tracking-[0.6em] rounded-none group shadow-[0_0_40px_rgba(255,255,255,0.1)] uppercase transition-all"
                >
                  {buying ? <Loader2 className="w-5 h-5 animate-spin" /> : <>INITIALIZE UPLINK <Zap className="ml-3 w-4 h-4 group-hover:scale-110" /></>}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleAdd}
                  disabled={adding || !selectedSize || !selectedColor}
                  className="w-full border-white/10 bg-transparent hover:bg-white/5 h-16 text-[10px] font-bold tracking-[0.4em] rounded-none text-white uppercase transition-all"
                >
                  {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <>ADD TO TRANSMISSION BAG <ShoppingBag className="ml-3 w-3.5 h-3.5" /></>}
                </Button>
              </div>
            </div>

            <div className="border-t border-white/10 pt-12 space-y-8">
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase text-white/40">TECHNICAL SPECIFICATIONS</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] tracking-widest text-white/60">
                  {product.details?.map((detail: string, idx: number) => (
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

        {/* Similar Assemblages Section */}
        {similarProducts.length > 0 && (
          <div className="border-t border-white/10 pt-32 pb-32">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
              <div className="space-y-6">
                <span className="text-[10px] font-bold tracking-[0.8em] text-white/40 uppercase">CONTEXTUAL // RECOMMENDATIONS</span>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight glow-text uppercase leading-none">Similar <br /> Assemblages</h2>
              </div>
              <Link href="/products" className="group flex items-center gap-4 text-[10px] font-bold tracking-[0.4em] text-white/40 hover:text-white transition-all uppercase border-b border-white/10 pb-4">
                EXPLORE ALL MODULES
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {similarProducts.map((p) => (
                <ProductCard key={p.id} product={p as any} />
              ))}
            </div>
          </div>
        )}

        {/* Field Reports Section */}
        <div className="border-t border-white/10 pt-32">
           <FieldReports productId={id} productName={product.name} />
        </div>
      </div>
    </div>
  );
}
