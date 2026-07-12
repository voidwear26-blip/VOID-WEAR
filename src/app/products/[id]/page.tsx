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
          className="absolute pointer-events-none border border-black/20 bg-white/60 backdrop-blur-xl overflow-hidden z-40 hidden md:block"
          style={{
            width: '240px',
            height: '240px',
            left: `${cursorPosition.x - 120}px`,
            top: `${cursorPosition.y - 120}px`,
            boxShadow: '0 0 50px rgba(0,0,0,0.1), inset 0 0 20px rgba(0,0,0,0.05)'
          }}
        >
          <div 
            className="absolute"
            style={{
              backgroundImage: `url(${src})`,
              backgroundSize: '400%',
              backgroundPosition: `${position.x}% ${position.y}%`,
              width: '100%',
              height: '100%',
              backgroundRepeat: 'no-repeat'
            }}
          />
          <div className="absolute inset-0 border border-black/10 flex items-center justify-center opacity-30">
            <div className="w-4 h-px bg-black"></div>
            <div className="h-4 w-px bg-black"></div>
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

  const allUniqueColors = useMemo(() => {
    if (!product?.stockMatrix) return [];
    const colorsSet = new Set<string>();
    Object.values(product.stockMatrix).forEach((sizeMap: any) => {
      Object.keys(sizeMap).forEach(c => colorsSet.add(c));
    });
    return Array.from(colorsSet);
  }, [product]);

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
  const hasDiscount = product?.discountPercentage && product.discountPercentage > 0;

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

  const isColorGlobalOOS = useCallback((color: string) => {
    if (!product?.stockMatrix) return false;
    return Object.values(product.stockMatrix).every((sizeMap: any) => (sizeMap[color] || 0) <= 0);
  }, [product]);

  const isSelectedVariantOOS = useMemo(() => {
    if (!selectedSize || !selectedColor) return false;
    return isVariantOOS(selectedSize, selectedColor);
  }, [selectedSize, selectedColor, isVariantOOS]);

  const handleAuthGuard = () => {
    if (!user) {
      toast({ title: "LOGIN REQUIRED", description: "LOG IN TO YOUR ACCOUNT TO CONTINUE." });
      router.push('/login');
      return false;
    }
    return true;
  };

  const handleAdd = async () => {
    if (isGlobalOOS || isSelectedVariantOOS) return;
    if (!handleAuthGuard()) return;
    if (!selectedSize || !selectedColor) {
      toast({ variant: "destructive", title: "SELECTION REQUIRED", description: "SELECT SIZE AND COLOR." });
      return;
    }
    if (!db || !product) return;

    setAdding(true);
    try {
      await addToCart(db, user!.uid, { ...product, id: product.id, color: selectedColor } as any, selectedSize);
      toast({ title: "ADDED TO BAG", description: "ITEM ADDED TO YOUR BAG." });
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
      toast({ variant: "destructive", title: "SELECTION REQUIRED", description: "SELECT SIZE AND COLOR." });
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
        title: isInWishlist ? "REMOVED" : "SAVED", 
        description: isInWishlist ? "ITEM REMOVED FROM WISHLIST." : "ITEM SAVED TO WISHLIST." 
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
      text: `Check out ${product.name} from VOID WEAR.\n${product.description}`,
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) { }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({ title: "LINK COPIED", description: "PRODUCT LINK SAVED TO CLIPBOARD." });
      } catch (err) {
        toast({ variant: "destructive", title: "SHARE FAILURE" });
      }
    }
  };

  if (isProductLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="w-10 h-10 animate-spin text-black/40" />
          <span className="text-[10px] tracking-[1em] uppercase font-bold text-black/60">Loading...</span>
        </div>
      </div>
    );
  }

  if (!product) return notFound();

  return (
    <div className="pt-32 pb-24 bg-transparent min-h-screen text-black">
      <div className="container mx-auto px-6">
        <div className="flex items-center gap-4 text-[10px] tracking-[0.3em] text-black/80 mb-12 uppercase font-bold">
          <Link href="/" className="hover:text-black transition-colors">HOME</Link>
          <ChevronRight className="w-3 h-3 opacity-50" />
          <Link href="/products" className="hover:text-black transition-colors">COLLECTION</Link>
          <ChevronRight className="w-3 h-3 opacity-50" />
          <span className="text-black">{product.name}</span>
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
                    <div className="relative aspect-[3/4] bg-black/[0.02] overflow-hidden border border-black/10 group">
                      <ProductImageMagnifier 
                        src={url} 
                        alt={product.name} 
                        isGlobalOOS={isGlobalOOS} 
                        priority={idx === 0}
                      />
                      
                      {isGlobalOOS && (
                        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                          <div className="bg-white/80 border border-black/20 px-8 py-4 backdrop-blur-xl">
                            <span className="text-xs font-black tracking-[0.8em] text-black uppercase">OUT OF STOCK</span>
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
                              isInWishlist ? 'bg-black text-white border-black shadow-[0_0_20px_rgba(0,0,0,0.1)]' : 'bg-white/60 text-black border-black/20 hover:border-black'
                            }`}
                          >
                            {toggling ? <Loader2 className="w-6 h-6 animate-spin" /> : <Heart className={`w-6 h-6 ${isInWishlist ? 'fill-current' : ''}`} />}
                          </motion.button>

                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleShare}
                            className="p-5 rounded-full border border-black/20 bg-white/60 text-black hover:border-black backdrop-blur-xl transition-all"
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
                  <CarouselPrevious className="left-6 h-12 w-12 border-black/10 bg-white/60 hover:bg-black hover:text-white rounded-none opacity-50 group-hover/carousel:opacity-100 transition-all duration-500 z-50" />
                  <CarouselNext className="right-6 h-12 w-12 border-black/10 bg-white/60 hover:bg-black hover:text-white rounded-none opacity-50 group-hover/carousel:opacity-100 transition-all duration-500 z-50" />
                </>
              )}
            </Carousel>
          </div>

          <div className="space-y-12 lg:sticky lg:top-32">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-[10px] font-bold tracking-[0.5em] text-black/80 uppercase">
                <span className="w-8 h-[1px] bg-black/60"></span>
                {product.category}
              </div>
              <div className="flex flex-col gap-2">
                <h1 className="text-4xl md:text-6xl font-black tracking-tight uppercase text-black font-headline">{product.name}</h1>
                {(isGlobalOOS || isSelectedVariantOOS) && (
                  <div className="flex items-center gap-2 text-red-600">
                    <ZapOff className="w-4 h-4" />
                    <span className="text-[10px] font-black tracking-[0.4em] uppercase">Out of Stock</span>
                  </div>
                )}
              </div>
              <div className="flex items-baseline gap-4">
                {hasDiscount && (
                  <span className="text-xl line-through text-black/40 tracking-widest">₹{product.originalPrice}</span>
                )}
                <p className="text-3xl font-black tracking-tighter text-black">₹{product.basePrice}</p>
                {hasDiscount && (
                  <span className="bg-black/10 text-black text-[9px] font-black px-3 py-1 tracking-[0.2em] uppercase">-{product.discountPercentage}% OFF</span>
                )}
              </div>
            </div>

            <p className="text-sm tracking-widest leading-relaxed text-black/80 uppercase font-light max-w-xl">
              {product.description}
            </p>

            <div className="space-y-10">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-black/10 pb-4">
                  <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase text-black/70">01. SELECT SIZE</h4>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="flex items-center gap-2 text-[9px] font-black tracking-[0.3em] text-black/80 hover:text-black transition-all uppercase">
                        <Ruler className="w-3 h-3" />
                        SIZE GUIDE
                      </button>
                    </DialogTrigger>
                    <DialogContent className="bg-white/95 border border-black/10 max-w-2xl p-0 overflow-hidden">
                      <DialogTitle className="sr-only">SIZE CHART</DialogTitle>
                      <div className="relative aspect-square md:aspect-[4/3] w-full bg-white">
                        <Image 
                          src="/SIZE CHART.png" 
                          alt="SIZE GUIDE" 
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
                          if (isOOS) toast({ title: "OUT OF STOCK", description: "THIS SIZE IS CURRENTLY UNAVAILABLE." });
                        }}
                        className={cn(
                          "relative w-14 h-14 border flex items-center justify-center text-[10px] font-bold tracking-widest transition-all backdrop-blur-sm",
                          selectedSize === size ? "bg-black text-white border-black" : "border-black/10 hover:border-black/40 bg-black/[0.01] text-black/80",
                          isOOS && "border-red-500/20 text-red-600/50"
                        )}
                      >
                        {size}
                        {isOOS && <OutOfStockOverlay />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-700">
                <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase text-black/70 border-b border-black/10 pb-4">02. SELECT COLOR</h4>
                <div className="flex flex-wrap gap-4">
                  {allUniqueColors.map(color => {
                    const isOOS = selectedSize 
                      ? isVariantOOS(selectedSize, color) 
                      : isColorGlobalOOS(color);
                    
                    const colorThumbnail = product.colorImages?.[color]?.[0] || product.imageUrls?.[0] || 'https://picsum.photos/seed/void-placeholder/100/130';
                    
                    return (
                      <button 
                        key={color} 
                        onClick={() => {
                          setSelectedColor(color);
                          if (isOOS) toast({ title: "OUT OF STOCK", description: "THIS COLOR IS CURRENTLY UNAVAILABLE." });
                        }}
                        title={color}
                        className={cn(
                          "relative w-16 h-20 border transition-all overflow-hidden group backdrop-blur-sm",
                          selectedColor === color ? "border-black ring-1 ring-black/50" : "border-black/10 hover:border-black/40 bg-black/[0.01]",
                          isOOS && "opacity-40"
                        )}
                      >
                        <Image 
                          src={colorThumbnail} 
                          alt={color} 
                          fill 
                          className={cn(
                            "object-cover transition-transform duration-500 group-hover:scale-110",
                            isOOS && "grayscale"
                          )}
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                        <div className="absolute bottom-0 left-0 right-0 bg-white/80 py-1">
                          <p className="text-[7px] font-black tracking-widest uppercase text-black text-center truncate px-1">{color}</p>
                        </div>
                        {isOOS && <OutOfStockOverlay />}
                        {selectedColor === color && (
                          <div className="absolute top-1 right-1">
                            <div className="w-2 h-2 bg-black rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 pt-4">
                <Button 
                  onClick={handleBuyNow}
                  disabled={buying || isGlobalOOS || isSelectedVariantOOS || !selectedSize || !selectedColor}
                  className="w-full bg-black text-white hover:bg-black/90 h-20 text-[11px] font-black tracking-[0.6em] rounded-none group shadow-[0_0_40px_rgba(0,0,0,0.05)] uppercase transition-all"
                >
                  {buying ? <Loader2 className="w-5 h-5 animate-spin" /> : (isGlobalOOS || isSelectedVariantOOS) ? <>UNAVAILABLE <ZapOff className="ml-3 w-4 h-4" /></> : <>BUY NOW <Zap className="ml-3 w-4 h-4 group-hover:scale-110" /></>}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleAdd}
                  disabled={adding || isGlobalOOS || isSelectedVariantOOS || !selectedSize || !selectedColor}
                  className="w-full border-black/10 bg-transparent hover:bg-black/5 h-16 text-[10px] font-bold tracking-[0.4em] rounded-none text-black uppercase transition-all"
                >
                  {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <>ADD TO BAG <ShoppingBag className="ml-3 w-3.5 h-3.5" /></>}
                </Button>
              </div>
            </div>

            <div className="border-t border-black/10 pt-12 space-y-8">
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase text-black/70">SPECIFICATIONS</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] tracking-widest text-black/80">
                  {product.details?.map((detail: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-3 uppercase font-light">
                      <span className="w-1 h-1 bg-black/40 rounded-full"></span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-black/10 pt-32 pb-32">
          <FieldReports productId={product.id} productName={product.name} />
        </div>

        <div className="border-t border-black/10 pt-32 pb-32">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Sparkles className="w-4 h-4 text-black/80" />
                <span className="text-[10px] font-bold tracking-[0.8em] text-black/80 uppercase">YOU MAY ALSO LIKE</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight uppercase leading-none font-headline">Recommended <br /> Items</h2>
              <p className="text-black/80 tracking-widest text-xs uppercase font-light max-w-xl">
                ITEMS THAT ALIGN WITH YOUR CURRENT SELECTION.
              </p>
            </div>
            <Link href="/products" className="group flex items-center gap-4 text-[10px] font-bold tracking-[0.4em] text-black/80 hover:text-black transition-all uppercase border-b border-black/10 pb-4">
              EXPLORE ALL
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
                <div key={i} className="aspect-[3/4] bg-black/[0.02] border border-black/5 animate-pulse" />
              ))
            ) : (
               <div className="col-span-full py-20 text-center opacity-80">
                  <p className="text-[10px] tracking-[0.5em] uppercase font-bold">No recommendations found.</p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
