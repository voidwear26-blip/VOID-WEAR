
"use client"

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/app/lib/products-service';
import { Heart, Loader2, Share2, Zap, ZapOff } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { toggleWishlist } from '@/firebase/wishlist-actions';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product & { isOutOfStock?: boolean; stockQuantity?: number };
}

export function ProductCard({ product }: ProductCardProps) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [toggling, setToggling] = useState(false);

  const wishlistRef = useMemoFirebase(() => {
    if (!db || !user || !product.id) return null;
    return doc(db, 'users', user.uid, 'wishlist', product.id);
  }, [db, user, product.id]);

  const { data: wishlistEntry } = useDoc(wishlistRef);
  const isInWishlist = !!wishlistEntry;

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({ title: "AUTHENTICATION REQUIRED", description: "PLEASE LINK YOUR IDENTITY." });
      return;
    }

    setToggling(true);
    try {
      await toggleWishlist(db!, user.uid, product as any);
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

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareUrl = `${window.location.origin}/products/${product.id}`;
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

  const iconMotionProps = {
    whileHover: { scale: 1.1, filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))" },
    whileTap: { scale: 0.95 },
    transition: { type: "spring", stiffness: 400, damping: 15 }
  };

  const displayImage = product.imageUrls && product.imageUrls.length > 0 
    ? product.imageUrls[0] 
    : 'https://picsum.photos/seed/void-placeholder/1200/1600';

  const isSoldOut = product.isOutOfStock || (product.stockQuantity === 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      className="group relative h-full flex flex-col"
    >
      <div className="flex flex-col h-full bg-white/[0.02] border border-white/10 group-hover:border-white/20 transition-all duration-500 overflow-hidden">
        {/* Image Container */}
        <Link href={`/products/${product.id}`} className="block relative aspect-[3/4] overflow-hidden shrink-0">
          <Image
            src={displayImage}
            alt={product.name || 'Assemblage Module'}
            fill
            className={cn(
              "object-cover transition-all duration-1000 ease-out grayscale-0 group-hover:grayscale group-hover:scale-105",
              isSoldOut && "opacity-40 grayscale"
            )}
            unoptimized
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
          
          {isSoldOut && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
               <div className="bg-black/90 border border-white/10 px-6 py-3 backdrop-blur-xl">
                  <span className="text-[9px] font-black tracking-[0.6em] text-white uppercase">OFFLINE</span>
               </div>
            </div>
          )}

          {/* Top Overlays */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <span className="text-[8px] tracking-[0.4em] font-bold text-white/70 uppercase border-l border-white/20 pl-3 py-1">
              {product.category || 'UNSET'}
            </span>
          </div>

          <div className="absolute top-4 right-4 z-20 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500">
            <motion.button 
              {...iconMotionProps}
              onClick={handleWishlistToggle}
              disabled={toggling}
              className={`p-3 rounded-full backdrop-blur-xl border transition-all duration-300 ${
                isInWishlist ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'bg-black/60 text-white border-white/10 hover:border-white'
              }`}
            >
              {toggling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />}
            </motion.button>

            <motion.button 
              {...iconMotionProps}
              onClick={handleShare}
              className="p-3 rounded-full backdrop-blur-xl border border-white/10 bg-black/60 text-white hover:border-white transition-all duration-300"
            >
              <Share2 className="w-4 h-4" />
            </motion.button>
          </div>
        </Link>

        {/* Info Area */}
        <Link href={`/products/${product.id}`} className="p-6 space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className={cn(
              "text-lg md:text-xl font-bold tracking-tight uppercase text-white group-hover:glow-text transition-all duration-300 line-clamp-1",
              isSoldOut && "opacity-50"
            )}>
              {product.name}
            </h3>
            <div className="flex items-center justify-between">
               <p className="text-[10px] tracking-[0.4em] text-white/40 uppercase font-black flex items-center gap-2">
                  {isSoldOut ? <ZapOff className="w-3 h-3 text-red-500/50" /> : <Zap className="w-3 h-3" />} 
                  {isSoldOut ? 'STASIS' : 'UPLINK'}
               </p>
               <span className="text-sm font-black tracking-widest text-white/90">₹{product.basePrice}</span>
            </div>
          </div>
          <div className="h-[1px] w-0 group-hover:w-full bg-gradient-to-r from-white/40 to-transparent transition-all duration-700 ease-in-out"></div>
        </Link>
      </div>
    </motion.div>
  );
}
