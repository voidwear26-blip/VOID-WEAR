
"use client"

import { ProductCard } from '@/components/product-card';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Loader2, Package } from 'lucide-react';

export default function ProductsPage() {
  const db = useFirestore();

  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'products');
  }, [db]);

  const { data: dbProducts, isLoading } = useCollection(productsQuery);
  // Strictly use database products only
  const products = dbProducts || [];

  return (
    <div className="pt-48 pb-32 bg-transparent min-h-screen">
      <div className="container mx-auto px-10">
        <div className="space-y-6 mb-24 max-w-3xl">
          <span className="text-[10px] font-bold tracking-[0.8em] text-white/20 uppercase">CATALOGUE // SEASON 01</span>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight glow-text leading-none uppercase">The <br /> Assemblage</h1>
          <p className="text-white/40 tracking-[0.3em] text-xs uppercase leading-relaxed">
            Technical shells and modular apparel designed for high-density urban migration. Precision engineered in the void.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-20">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-[10px] tracking-[1em] uppercase">Syncing Assemblages...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
            {products.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-48 text-center space-y-8 opacity-20 border border-dashed border-white/10">
            <Package className="w-16 h-16 stroke-[0.5px]" />
            <div className="space-y-2">
              <p className="text-[10px] tracking-[1em] uppercase font-bold">NO MODULES LOGGED</p>
              <p className="text-[8px] tracking-[0.3em] uppercase max-w-xs mx-auto">DATABASE DISCONNECTED OR EMPTY. USE COMMAND CENTER TO INITIALIZE CATALOGUE.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
