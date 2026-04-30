
"use client"

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/app/lib/products-service';
import { Heart, Loader2, Share2, Zap } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { toggleWishlist } from '@/firebase/wishlist-actions';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { doc } from 'firebase/firestore';

interface ProductCardProps {
  product: Product;
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
      await toggleWishlist(db!, user.uid, product);
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
    whileHover: { scale: 1.2, filter: "drop-shadow(0 0 10px rgba(255, 255, 255, 0.8))" },
    whileTap: { scale: 0.9 },
    transition: { type: "spring", stiffness: 400, damping: 10 }
  };

  const displayImage = product.imageUrls && product.imageUrls.length > 0 
    ? product.imageUrls[0] 
    : 'https://picsum.photos/seed/void-placeholder/1200/1600';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      className="group relative h-full flex flex-col"
    >
      <div className="flex flex-col h-full bg-white/[0.01] border border-white/10 group-hover:border-white/40 transition-all duration-700 glow-border overflow-hidden">
        {/* Massive Image Container */}
        <Link href={`/products/${product.id}`} className="block relative aspect-[2/3] overflow-hidden shrink-0">
          <Image
            src={displayImage}
            alt={product.name || 'Assemblage Module'}
            fill
            className="object-cover transition-all duration-1000 ease-out group-hover:scale-110"
            unoptimized
            priority
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity"></div>
          
          {/* Top Overlays */}
          <div className="absolute top-8 left-8 flex flex-col gap-2">
            <span className="text-[9px] tracking-[0.5em] font-black text-white/60 group-hover:text-white transition-colors uppercase border-l-2 border-white/20 pl-4 py-1">
              {product.category || 'UNCLASSIFIED'}
            </span>
          </div>

          <div className="absolute top-8 right-8 z-20 flex flex-col gap-5 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-700">
            <motion.button 
              {...iconMotionProps}
              onClick={handleWishlistToggle}
              disabled={toggling}
              className={`p-4 rounded-full backdrop-blur-2xl border transition-all duration-500 ${
                isInWishlist ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.4)]' : 'bg-black/60 text-white border-white/20 hover:border-white'
              }`}
            >
              {toggling ? <Loader2 className="w-5 h-5 animate-spin" /> : <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />}
            </motion.button>

            <motion.button 
              {...iconMotionProps}
              onClick={handleShare}
              className="p-4 rounded-full backdrop-blur-2xl border border-white/20 bg-black/60 text-white hover:border-white transition-all duration-500"
            >
              <Share2 className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Price Float */}
          <div className="absolute bottom-8 right-8">
            <div className="bg-white text-black px-6 py-3 text-xs font-black tracking-widest shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              ₹{product.basePrice}
            </div>
          </div>
        </Link>

        {/* Info Area */}
        <Link href={`/products/${product.id}`} className="p-10 space-y-6 flex-1 flex flex-col justify-center">
          <div className="space-y-3">
            <h3 className="text-xl md:text-2xl font-black tracking-tighter uppercase text-white group-hover:glow-text transition-all duration-500 line-clamp-2">
              {product.name}
            </h3>
            <p className="text-[10px] tracking-[0.4em] text-white/40 uppercase font-bold flex items-center gap-3">
               <Zap className="w-3 h-3" /> INITIALIZE_UPLINK
            </p>
          </div>
          <div className="h-[1px] w-0 group-hover:w-full bg-gradient-to-r from-white/60 to-transparent transition-all duration-1000 ease-in-out"></div>
        </Link>
      </div>
    </motion.div>
  );
}
