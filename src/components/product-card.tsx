'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/app/lib/products-service';
import { Plus, Check, Loader2, Heart } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { addToCart } from '@/firebase/cart-actions';
import { useToast } from '@/hooks/use-toast';
import { toggleWishlist } from '@/firebase/wishlist-actions';
import { collection } from 'firebase/firestore';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const wishlistQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'wishlist');
  }, [db, user]);
  
  const { data: wishlist } = useCollection(wishlistQuery);
  const isWishlisted = wishlist?.some(item => item.productId === product.id);

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

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "ACCESS DENIED",
        description: "AUTHENTICATION REQUIRED FOR CART ACCESS.",
      });
      return;
    }

    setAdding(true);
    try {
      await addToCart(db!, user.uid, product.id);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || !db) return;
    await toggleWishlist(db, user.uid, product);
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
      <Link href={`/products/${product.id}`} className="block relative overflow-hidden bg-black border border-white/5 group-hover:border-white/20 transition-all duration-500 glow-border">
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={displayImage}
            alt={product.name}
            fill
            className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-out"
            data-ai-hint="cyberpunk product"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
          
          <div className="absolute top-6 right-6 z-20">
            <motion.button 
              {...iconMotionProps}
              onClick={handleWishlist}
              className={`p-3 rounded-full backdrop-blur-md border border-white/10 transition-all duration-300 ${isWishlisted ? 'bg-white text-black' : 'bg-black/40 text-white/40 hover:text-white'}`}
            >
              <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
            </motion.button>
          </div>

          <motion.button 
            onClick={handleAddToCart}
            disabled={adding}
            whileHover={{ scale: 1.1, filter: "drop-shadow(0 0 15px rgba(255, 255, 255, 0.5))" }}
            whileTap={{ scale: 0.9 }}
            className="absolute bottom-6 right-6 w-12 h-12 bg-white text-black rounded-none flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 z-10"
          >
            {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : added ? <Check className="w-5 h-5" /> : <Plus className="w-6 h-6" />}
          </motion.button>

          <div className="absolute top-6 left-6 text-[8px] tracking-[0.5em] font-bold text-white/40 group-hover:text-white transition-colors">
            {product.category?.toUpperCase() || 'UNCLASSIFIED'}
          </div>
        </div>

        <div className="p-8 space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-medium tracking-[0.3em] uppercase max-w-[70%]">{product.name}</h3>
            <span className="text-[10px] font-bold text-white/40 tracking-widest">${product.basePrice}</span>
          </div>
          <div className="h-[1px] w-0 group-hover:w-full bg-white/10 transition-all duration-700"></div>
        </div>
      </Link>
    </motion.div>
  );
}