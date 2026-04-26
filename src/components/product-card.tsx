
"use client"

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/app/lib/products-service';
import { Plus, Heart, Loader2, Share2 } from 'lucide-react';
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

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

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
      text: product.description,
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Silent fail for cancel
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({ title: "LINK EXTRACTED", description: "PRODUCT UPLINK SAVED TO CLIPBOARD." });
      } catch (err) {
        toast({ variant: "destructive", title: "SHARE_FAILURE", description: "COULD NOT GENERATE TRANSMISSION LINK." });
      }
    }
  };

  const iconMotionProps = {
    whileHover: { scale: 1.25, filter: "drop-shadow(0 0 10px rgba(255, 255, 255, 0.8))" },
    whileTap: { scale: 0.9 },
    transition: { type: "spring", stiffness: 400, damping: 10 }
  };

  const displayImage = product.imageUrls && product.imageUrls.length > 0 
    ? product.imageUrls[0] 
    : 'https://picsum.photos/seed/void-placeholder/800/1000';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      className="group relative"
    >
      <div className="block relative overflow-hidden bg-black border border-white/10 group-hover:border-white/30 transition-all duration-500 glow-border">
        <Link href={`/products/${product.id}`} className="block relative aspect-[3/4] overflow-hidden">
          <Image
            src={displayImage}
            alt={product.name || 'Assemblage Module'}
            fill
            className="object-cover grayscale-0 group-hover:grayscale group-hover:scale-105 transition-all duration-1000 ease-out"
            data-ai-hint="cyberpunk product"
            unoptimized
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
          
          <div className="absolute top-6 left-6 text-[8px] tracking-[0.5em] font-bold text-white/70 group-hover:text-white transition-colors uppercase">
            {product.category || 'UNCLASSIFIED'}
          </div>
        </Link>

        <div className="absolute top-6 right-6 z-20 flex flex-col gap-4">
          <motion.button 
            {...iconMotionProps}
            onClick={handleWishlistToggle}
            disabled={toggling}
            className={`p-3 rounded-full backdrop-blur-md border transition-all duration-300 ${
              isInWishlist ? 'bg-white text-black border-white' : 'bg-black/40 border-white/20 text-white/60 hover:text-white'
            }`}
            title="STASIS LOG"
          >
            {toggling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Heart className={`w-3.5 h-3.5 ${isInWishlist ? 'fill-current' : ''}`} />}
          </motion.button>

          <motion.button 
            {...iconMotionProps}
            onClick={handleShare}
            className="p-3 rounded-full backdrop-blur-md border border-white/20 bg-black/40 text-white/60 hover:text-white transition-all duration-300"
            title="SHARE TRANSMISSION"
          >
            <Share2 className="w-3.5 h-3.5" />
          </motion.button>
        </div>

        <Link href={`/products/${product.id}`} className="p-8 space-y-4 block">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-medium tracking-[0.3em] uppercase max-w-[70%] text-white">{product.name}</h3>
            <span className="text-[10px] font-bold text-white/70 tracking-widest">₹{product.basePrice}</span>
          </div>
          <div className="h-[1px] w-0 group-hover:w-full bg-white/20 transition-all duration-700"></div>
        </Link>
      </div>
    </motion.div>
  );
}
