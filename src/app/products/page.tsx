
"use client"

import { products as staticProducts } from '@/app/lib/products';
import { ProductCard } from '@/components/product-card';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

export default function ProductsPage() {
  const db = useFirestore();

  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'products');
  }, [db]);

  const { data: dbProducts, isLoading } = useCollection(productsQuery);
  const products = (dbProducts && dbProducts.length > 0) ? dbProducts : staticProducts;

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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
            {products.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
