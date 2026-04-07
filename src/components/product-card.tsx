
"use client"

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/app/lib/products';
import { Plus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`} className="group block relative overflow-hidden bg-black border border-white/5 hover:border-white/20 transition-all duration-500">
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000 ease-out"
          data-ai-hint="cyberpunk product"
        />
        {/* Overlay Glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
        
        {/* Quick Add Button */}
        <button className="absolute bottom-6 right-6 w-12 h-12 bg-white text-black rounded-none flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
          <Plus className="w-6 h-6" />
        </button>

        {/* Category Label */}
        <div className="absolute top-6 left-6 text-[10px] tracking-[0.4em] font-bold text-white/40 group-hover:text-white transition-colors">
          {product.category}
        </div>
      </div>

      <div className="p-8 space-y-2">
        <div className="flex justify-between items-end">
          <h3 className="text-lg font-medium tracking-[0.2em]">{product.name}</h3>
          <span className="text-sm text-white/60">${product.price}</span>
        </div>
        <p className="text-xs text-white/40 line-clamp-1 tracking-widest">{product.description}</p>
      </div>
      
      {/* Decorative Border Glow */}
      <div className="absolute inset-0 pointer-events-none border border-white/0 group-hover:border-white/20 transition-all duration-500"></div>
    </Link>
  );
}
