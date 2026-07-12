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
  product: Product & { 
    isOutOfStock?: boolean; 
    stockQuantity?: number;
    originalPrice?: number;
    discountPercentage?: number;
  };
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
      toast({ title: "AUTHENTICATION REQUIRED", description: "PLEASE LOG IN." });
      return;
    }

    setToggling(true);
    try {
      await toggleWishlist(db!, user.uid, product as any);
      toast({ 
        title: isInWishlist ? "REMOVED" : "SAVED", 
        description: isInWishlist ? "ITEM REMOVED FROM COLLECTION." : "ITEM SAVED TO COLLECTION." 
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
      text: `Check out ${product.name} from VOID WEAR.`,
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {}
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({ title: "COPIED", description: "LINK COPIED TO CLIPBOARD." });
      } catch (err) {
        toast({ variant: "destructive", title: "ERROR" });
      }
    }
  };

  const iconMotionProps = {
    whileHover: { scale: 1.1 },
    whileTap: { scale: 0.95 },
    transition: { type: "spring", stiffness: 400, damping: 15 }
  };

  const displayImage = product.imageUrls && product.imageUrls.length > 0 
    ? product.imageUrls[0] 
    : 'https://picsum.photos/seed/void-placeholder/800/1000';

  const isSoldOut = product.isOutOfStock || (product.stockQuantity === 0);
  const hasDiscount = product.discountPercentage && product.discountPercentage > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      className="group relative h-full flex flex-col"
    >
      <div className="flex flex-col h-full bg-black/[0.02] border border-black/5 group-hover:border-black/10 transition-all duration-300 overflow-hidden">
        <Link href={`/products/${product.id}`} className="block relative aspect-[3/4] overflow-hidden shrink-0">
          <Image
            src={displayImage}
            alt={product.name}
            fill
            className={cn(
              "object-cover transition-all duration-700 ease-out group-hover:scale-105",
              isSoldOut && "opacity-40 grayscale"
            )}
            unoptimized
          />
          
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          {isSoldOut && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
               <div className="bg-white/90 border border-black/5 px-6 py-3">
                  <span className="text-[9px] font-black tracking-[0.4em] text-black uppercase">SOLD OUT</span>
               </div>
            </div>
          )}

          <div className="absolute top-4 left-4">
            <span className="text-[8px] tracking-[0.2em] font-bold text-black/40 uppercase bg-white/80 px-3 py-1">
              {product.category}
            </span>
          </div>

          <div className="absolute top-4 right-4 z-20 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <motion.button 
              {...iconMotionProps}
              onClick={handleWishlistToggle}
              disabled={toggling}
              className={`p-3 rounded-full border transition-all ${
                isInWishlist ? 'bg-black text-white border-black' : 'bg-white/90 text-black border-black/5 hover:border-black'
              }`}
            >
              {toggling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />}
            </motion.button>

            <motion.button 
              {...iconMotionProps}
              onClick={handleShare}
              className="p-3 rounded-full border border-black/5 bg-white/90 text-black hover:border-black transition-all"
            >
              <Share2 className="w-4 h-4" />
            </motion.button>
          </div>
        </Link>

        <Link href={`/products/${product.id}`} className="p-6 space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className={cn(
              "text-lg font-bold tracking-tight uppercase text-black line-clamp-1",
              isSoldOut && "opacity-40"
            )}>
              {product.name}
            </h3>
            <div className="flex items-center justify-between">
               <p className="text-[9px] tracking-[0.2em] text-black/40 uppercase font-bold">
                  {isSoldOut ? 'UNAVAILABLE' : 'AVAILABLE'}
               </p>
               <div className="flex items-center gap-2">
                  {hasDiscount && (
                    <span className="text-[10px] line-through text-black/20">₹{product.originalPrice}</span>
                  )}
                  <span className="text-sm font-black tracking-widest text-black">₹{product.basePrice}</span>
               </div>
            </div>
          </div>
        </Link>
      </div>
    </motion.div>
  );
}
