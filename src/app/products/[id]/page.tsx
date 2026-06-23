'use client';

import { use, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChevronRight, Heart, Loader2, Zap, Share2, ArrowRight, ShoppingBag, Sparkles, ZapOff, Ruler, X } from 'lucide-react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase, useUser, useCollection } from '@/firebase';
import { doc, collection, query, where, limit } from 'firebase/firestore';
import { addToCart } from '@/firebase/cart-actions';
import { toggleWishlist } from '@/firebase/wishlist-actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductCard } from '@/components/product-card';
import { FieldReports } from '@/components/field-reports';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";

const OutOfStockOverlay = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
    <svg className="w-full h-full text-red-500/60" viewBox="0 0 100 100" preserveAspectRatio="none">
      <line x1="0" y1="0" x2="100" x2="100" stroke="currentColor" strokeWidth="1" />
      <line x1="100" y1="0" x2="0" y2="100" stroke="currentColor" strokeWidth="1" />
    </svg>
  </div>
);

/**
 * NEURAL MAGNIFIER COMPONENT
 * Handles coordinate-based magnification for technical module inspection.
 */
function ProductImageMagnifier({ 
  src, 
  alt, 
  isGlobalOOS,
  priority = false
}: { 
  src: string; 
  alt: string; 
  isGlobalOOS?: boolean;
  priority?: boolean;
}) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setPosition({ x, y });
    setCursorPosition({ x: e.clientX - left, y: e.clientY - top });
  };

  return (
    <div 
      className="relative w-full h-full cursor-crosshair overflow-hidden group"
      onMouseEnter={() => !isGlobalOOS && setShowMagnifier(true)}
      onMouseLeave={() => setShowMagnifier(false)}
      onMouseMove={handleMouseMove}
    >
      <Image 
        src={src} 
        alt={alt} 
        fill 
        className={cn(
          "object-cover transition-all duration-700 ease-in-out group-hover:scale-105", 
          isGlobalOOS && "opacity-40 grayscale"
        )} 
        unoptimized 
        priority={priority}
      />
      
      {showMagnifier && !isGlobalOOS && (
        <div 
          className="absolute pointer-events-none border border-white/20 bg-black/60 backdrop-blur-xl overflow-hidden z-40 hidden md:block"
          style={{
            width: '240px',
            height: '240px',
            left: `${cursorPosition.x - 120}px`,
            top: `${cursorPosition.y - 120}px`,
            boxShadow: '0 0 50px rgba(0,0,0,0.5), inset 0 0 20px rgba(255,255,255,0.1)'
          }}
        >
          <div 
            className="absolute"
            style={{
              backgroundImage: `url(${src})`,
              backgroundSize: '400%', // 4x Zoom calibration
              backgroundPosition: `${position.x}% ${position.y}%`,
              width: '100%',
              height: '100%',
              backgroundRepeat: 'no-repeat'
            }}
          />
          {/* Viewfinder Reticle */}
          <div className="absolute inset-0 border border-white/10 flex items-center justify-center opacity-30">
            <div className="w-4 h-px bg-white"></div>
            <div className="h-4 w-px bg-white"></div>
          </div>
        </div>
      )}
    </div>
  );
}

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

  const similarProductsQuery = useMemoFirebase(() => {
    if (!db || !product?.category) return null;
    return query(
      collection(db, 'products'),
      where('category', '==', product.category),
      limit(10)
    );
  }, [db, product?.category]);

  const fallbackProductsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'products'), limit(5));
  }, [db]);

  const { data: rawSimilar, isLoading: similarLoading } = useCollection(similarProductsQuery);
  const { data: fallbackProducts } = useCollection(fallbackProductsQuery);

  const similarProducts = useMemo(() => {
    let filtered = rawSimilar?.filter(p => p.id !== id) || [];
    if (filtered.length === 0 && fallbackProducts) {
      filtered = fallbackProducts.filter(p => p.id !== id);
    }
    return filtered.slice(0, 4);
  }, [rawSimilar, fallbackProducts, id]);

  const allDefinedSizes = useMemo(() => {
    const order = ['S', 'M', 'L', 'XL'];
    if (!product?.stockMatrix) return order;
    const keys = Object.keys(product.stockMatrix).filter(s => order.includes(s));
    if (keys.length === 0) return order;
    return keys.sort((a, b) => order.indexOf(a) - order.indexOf(b));
  }, [product]);

  const allDefinedColors = useMemo(() => {
    if (!product?.stockMatrix || !selectedSize) return [];
    const colors = product.stockMatrix[selectedSize] || {};
    return Object.keys(colors);
  }, [product, selectedSize]);

  const displayImages = useMemo(() => {
    if (!product) return ['https://picsum.photos/seed/void-placeholder/800/1000'];
    if (selectedColor && product.colorImages?.[selectedColor] && product.colorImages[selectedColor].length > 0) {
      return product.colorImages[selectedColor];
    }
    if (product.imageUrls && product.imageUrls.length > 0) {
      return product.imageUrls;
    }
    return ['https://picsum.photos/seed/void-placeholder/800/1000'];
  }, [product, selectedColor]);

  const isGlobalOOS = product?.isOutOfStock || (product?.stockQuantity === 0);

  const isVariantOOS = useCallback((size: string, color: string) => {
    if (!product?.stockMatrix) return false;
    return (product.stockMatrix[size]?.[color] || 0) <= 0;
  }, [product]);

  const isSizeOOS = useCallback((size: string) => {
    if (!product?.stockMatrix) return false;
    const colors = product.stockMatrix[size] || {};
    const colorValues = Object.values(colors) as number[];
    return colorValues.every((qty: number) => qty <= 0);
  }, [product]);

  const isSelectedVariantOOS = useMemo(() => {
    if (!selectedSize || !selectedColor) return false;
    return isVariantOOS(selectedSize, selectedColor);
  }, [selectedSize, selectedColor, isVariantOOS]);

  const handleAuthGuard = () => {
    if (!user) {
      toast({ title: "AUTHENTICATION REQUIRED", description: "LOG IN TO YOUR ENTITY TO CONTINUE." });
      router.push('/login');
      return false;
    }
    return true;
  };

  const handleAdd = async () => {
    if (isGlobalOOS || isSelectedVariantOOS) return;
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
    if (isGlobalOOS || isSelectedVariantOOS) return;
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
      } catch (err) { }
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
            <Carousel 
              key={`${id}-${selectedColor}`}
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full group/carousel"
            >
              <CarouselContent>
                {displayImages.map((url: string, idx: number) => (
                  <CarouselItem key={url + idx}>
                    <div className="relative aspect-[3/4] bg-white/[0.02] overflow-hidden border border-white/10 group">
                      <ProductImageMagnifier 
                        src={url} 
                        alt={product.name} 
                        isGlobalOOS={isGlobalOOS} 
                        priority={idx === 0}
                      />
                      
                      {isGlobalOOS && (
                        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                          <div className="bg-black/80 border border-white/20 px-8 py-4 backdrop-blur-xl">
                            <span className="text-xs font-black tracking-[0.8em] text-white uppercase">OUT OF STOCK</span>
                          </div>
                        </div>
                      )}

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
                          >
                            {toggling ? <Loader2 className="w-6 h-6 animate-spin" /> : <Heart className={`w-6 h-6 ${isInWishlist ? 'fill-current' : ''}`} />}
                          </motion.button>

                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleShare}
                            className="p-5 rounded-full border border-white/20 bg-black/60 text-white hover:border-white backdrop-blur-xl transition-all"
                          >
                            <Share2 className="w-6 h-6" />
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {displayImages.length > 1 && (
                <>
                  <CarouselPrevious className="left-6 h-12 w-12 border-white/10 bg-black/60 hover:bg-white hover:text-black rounded-none opacity-50 group-hover/carousel:opacity-100 transition-all duration-500 z-50" />
                  <CarouselNext className="right-6 h-12 w-12 border-white/10 bg-black/60 hover:bg-white hover:text-black rounded-none opacity-50 group-hover/carousel:opacity-100 transition-all duration-500 z-50" />
                </>
              )}
            </Carousel>
          </div>

          <div className="space-y-12 lg:sticky lg:top-32">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-[10px] font-bold tracking-[0.5em] text-white/50 uppercase">
                <span className="w-8 h-[1px] bg-white/20"></span>
                {product.category}
              </div>
              <div className="flex flex-col gap-2">
                <h1 className="text-4xl md:text-6xl font-black tracking-tight glow-text uppercase text-white">{product.name}</h1>
                {(isGlobalOOS || isSelectedVariantOOS) && (
                  <div className="flex items-center gap-2 text-red-500">
                    <ZapOff className="w-4 h-4" />
                    <span className="text-[10px] font-black tracking-[0.4em] uppercase">Status: Offline - Out of Stock</span>
                  </div>
                )}
              </div>
              <p className="text-2xl font-light tracking-widest text-white/90">₹{product.basePrice}</p>
            </div>

            <p className="text-sm tracking-widest leading-relaxed text-white/60 uppercase font-light max-w-xl">
              {product.description}
            </p>

            <div className="space-y-10">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase text-white/40">01. SELECT SIZE</h4>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="flex items-center gap-2 text-[9px] font-black tracking-[0.3em] text-white/60 hover:text-white transition-all uppercase">
                        <Ruler className="w-3 h-3" />
                        SIZE GUIDE
                      </button>
                    </DialogTrigger>
                    <DialogContent className="bg-black/95 border border-white/10 max-w-2xl p-0 overflow-hidden">
                      <DialogTitle className="sr-only">SIZE CHART</DialogTitle>
                      <div className="relative aspect-square md:aspect-[4/3] w-full">
                        <Image 
                          src="/SIZE CHART.png" 
                          alt="VOID WEAR SIZE GUIDE" 
                          fill 
                          className="object-contain" 
                          unoptimized
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex flex-wrap gap-4">
                  {allDefinedSizes.map(size => {
                    const isOOS = isSizeOOS(size) || isGlobalOOS;
                    return (
                      <button 
                        key={size} 
                        onClick={() => { 
                          setSelectedSize(size); 
                          setSelectedColor(null); 
                          if (isOOS) toast({ title: "OFFLINE", description: "SIZE OUT OF STOCK" });
                        }}
                        className={cn(
                          "relative w-14 h-14 border flex items-center justify-center text-[10px] font-bold tracking-widest transition-all backdrop-blur-sm",
                          selectedSize === size ? "bg-white text-black border-white" : "border-white/10 hover:border-white/40 bg-white/[0.01] text-white/50",
                          isOOS && "border-red-500/20 text-red-500/30"
                        )}
                      >
                        {size}
                        {isOOS && <OutOfStockOverlay />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedSize && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-700">
                  <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase text-white/40 border-b border-white/10 pb-4">02. SELECT COLOR</h4>
                  <div className="flex flex-wrap gap-4">
                    {allDefinedColors.map(color => {
                      const isOOS = isVariantOOS(selectedSize, color) || isGlobalOOS;
                      return (
                        <button 
                          key={color} 
                          onClick={() => {
                            setSelectedColor(color);
                            if (isOOS) toast({ title: "OFFLINE", description: "OUT OF STOCK" });
                          }}
                          className={cn(
                            "relative px-6 h-12 border flex items-center justify-center text-[9px] font-black tracking-[0.3em] uppercase transition-all backdrop-blur-sm",
                            selectedColor === color ? "bg-white text-black border-white" : "border-white/10 hover:border-white/40 bg-white/[0.01] text-white/50",
                            isOOS && "border-red-500/20 text-red-500/30"
                          )}
                        >
                          {color}
                          {isOOS && <OutOfStockOverlay />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid gap-4 pt-4">
                <Button 
                  onClick={handleBuyNow}
                  disabled={buying || isGlobalOOS || isSelectedVariantOOS || !selectedSize || !selectedColor}
                  className="w-full bg-white text-black hover:bg-white/90 h-20 text-[11px] font-black tracking-[0.6em] rounded-none group shadow-[0_0_40px_rgba(255,255,255,0.1)] uppercase transition-all"
                >
                  {buying ? <Loader2 className="w-5 h-5 animate-spin" /> : (isGlobalOOS || isSelectedVariantOOS) ? <>MODULE UNAVAILABLE <ZapOff className="ml-3 w-4 h-4" /></> : <>INITIALIZE UPLINK <Zap className="ml-3 w-4 h-4 group-hover:scale-110" /></>}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleAdd}
                  disabled={adding || isGlobalOOS || isSelectedVariantOOS || !selectedSize || !selectedColor}
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

        {/* FIELD REPORTS (REVIEWS) - PLACED ABOVE RECOMMENDATIONS */}
        <div className="border-t border-white/10 pt-32 pb-32">
          <FieldReports productId={product.id} productName={product.name} />
        </div>

        {/* RECOMMENDED ASSEMBLAGES */}
        <div className="border-t border-white/10 pt-32 pb-32">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Sparkles className="w-4 h-4 text-white/40" />
                <span className="text-[10px] font-bold tracking-[0.8em] text-white/40 uppercase">CONTEXTUAL // UPLINK</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight glow-text uppercase leading-none">Recommended <br /> Assemblages</h2>
              <p className="text-white/60 tracking-widest text-xs uppercase font-light max-w-xl">
                SYSTEM IDENTIFIED MODULES THAT ALIGN WITH YOUR CURRENT ARCHITECTURAL REQUIREMENT.
              </p>
            </div>
            <Link href="/products" className="group flex items-center gap-4 text-[10px] font-bold tracking-[0.4em] text-white/40 hover:text-white transition-all uppercase border-b border-white/10 pb-4">
              EXPLORE ALL MODULES
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {similarProducts.length > 0 ? (
              similarProducts.map((p) => (
                <ProductCard key={p.id} product={p as any} />
              ))
            ) : similarLoading ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-[3/4] bg-white/[0.02] border border-white/5 animate-pulse" />
              ))
            ) : (
               <div className="col-span-full py-20 text-center opacity-40">
                  <p className="text-[10px] tracking-[0.5em] uppercase">No similar modules logged.</p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}