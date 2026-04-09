
"use client"

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/app/lib/products';
import { Plus } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
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
            src={product.image}
            alt={product.name}
            fill
            className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-out"
            data-ai-hint="cyberpunk product"
          />
          
          {/* Depth Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
          
          {/* Hover Light Effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-white"></div>
          
          {/* Quick Add Button */}
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute bottom-6 right-6 w-12 h-12 bg-white text-black rounded-none flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 z-10"
          >
            <Plus className="w-6 h-6" />
          </motion.button>

          {/* Category Label */}
          <div className="absolute top-6 left-6 text-[8px] tracking-[0.5em] font-bold text-white/40 group-hover:text-white transition-colors">
            {product.category.toUpperCase()}
          </div>
        </div>

        <div className="p-8 space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-medium tracking-[0.3em] uppercase max-w-[70%]">{product.name}</h3>
            <span className="text-[10px] font-bold text-white/40 tracking-widest">${product.price}</span>
          </div>
          <div className="h-[1px] w-0 group-hover:w-full bg-white/10 transition-all duration-700"></div>
          <p className="text-[10px] text-white/20 line-clamp-1 tracking-[0.2em] uppercase leading-relaxed">
            {product.description}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
