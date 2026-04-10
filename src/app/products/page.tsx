
"use client"

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { ProductCard } from '@/components/product-card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductsPage() {
  const db = useFirestore();
  
  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'products');
  }, [db]);

  const { data: products, isLoading } = useCollection(productsQuery);

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-8">
                <Skeleton className="aspect-[3/4] bg-white/5 rounded-none" />
                <div className="space-y-4">
                  <Skeleton className="h-4 w-2/3 bg-white/5 rounded-none" />
                  <Skeleton className="h-4 w-1/3 bg-white/5 rounded-none" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
            {products?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
