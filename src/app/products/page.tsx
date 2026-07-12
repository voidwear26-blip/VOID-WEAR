"use client"

import { ProductCard } from '@/components/product-card';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';
import { Loader2, Package, Search, SlidersHorizontal } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-asc' | 'stock-desc' | 'newest';

export default function ProductsPage() {
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'products'), limit(100));
  }, [db]);

  const { data: dbProducts, isLoading } = useCollection(productsQuery);

  const filteredAndSortedProducts = useMemo(() => {
    if (!dbProducts) return [];

    let result = [...dbProducts];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase().replace(/[^a-z0-9]/g, '');
      result = result.filter(p => {
        const name = (p.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const category = (p.category || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return name.includes(lowerSearch) || category.includes(lowerSearch);
      });
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc': return (a.name || '').localeCompare(b.name || '');
        case 'name-desc': return (b.name || '').localeCompare(a.name || '');
        case 'price-asc': return (Number(a.basePrice) || 0) - (Number(b.basePrice) || 0);
        case 'price-desc': return (Number(b.basePrice) || 0) - (Number(a.basePrice) || 0);
        case 'stock-asc': return (Number(a.stockQuantity) || 0) - (Number(b.stockQuantity) || 0);
        case 'stock-desc': return (Number(b.stockQuantity) || 0) - (Number(a.stockQuantity) || 0);
        case 'newest':
        default: return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });

    return result;
  }, [dbProducts, searchTerm, sortBy]);

  return (
    <div className="pt-48 pb-32 bg-background min-h-screen">
      <div className="container mx-auto px-6 md:px-10">
        <div className="space-y-6 mb-24 max-w-4xl">
          <div className="flex items-center gap-4">
             <div className="h-[2px] w-12 bg-black/10"></div>
             <span className="text-[11px] font-black tracking-[0.8em] text-black/60 uppercase">COLLECTION // SEASON 01</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none uppercase text-black font-headline">Collection</h1>
          <p className="text-black/60 tracking-[0.4em] text-xs uppercase leading-relaxed font-light max-w-2xl">
            Premium modular apparel designed for the urban explorer.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 mb-16 items-start md:items-center justify-between border-y border-black/5 py-10">
          <div className="relative w-full md:w-[400px] group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20 group-focus-within:text-black transition-colors" />
            <Input 
              placeholder="SEARCH COLLECTION..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black/[0.02] border-black/5 h-14 pl-14 rounded-none text-[10px] tracking-[0.4em] focus-visible:ring-0 focus-visible:border-black/20 font-black text-black uppercase placeholder:text-black/10 transition-all"
            />
          </div>

          <div className="flex items-center gap-6 w-full md:w-auto">
            <div className="hidden sm:flex items-center gap-2 text-[9px] tracking-[0.4em] text-black/40 uppercase font-black mr-2">
              <SlidersHorizontal className="w-3 h-3" />
              SORT:
            </div>
            <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
              <SelectTrigger className="w-full md:w-64 bg-black/[0.02] border-black/5 rounded-none h-14 text-[9px] tracking-[0.4em] uppercase focus:ring-0 text-black font-black transition-all hover:bg-black/5">
                <SelectValue placeholder="SORT_BY" />
              </SelectTrigger>
              <SelectContent className="bg-background border-black/5 text-black rounded-none">
                <SelectItem value="newest" className="text-[10px] tracking-widest uppercase">RECENT</SelectItem>
                <SelectItem value="price-asc" className="text-[10px] tracking-widest uppercase">PRICE: LOW</SelectItem>
                <SelectItem value="price-desc" className="text-[10px] tracking-widest uppercase">PRICE: HIGH</SelectItem>
                <SelectItem value="name-asc" className="text-[10px] tracking-widest uppercase">A - Z</SelectItem>
                <SelectItem value="name-desc" className="text-[10px] tracking-widest uppercase">Z - A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading && !dbProducts ? (
          <div className="flex flex-col items-center justify-center py-48 opacity-40">
            <Loader2 className="w-10 h-10 animate-spin mb-8 text-black" />
            <p className="text-[10px] tracking-[1em] uppercase font-black text-black">Syncing...</p>
          </div>
        ) : filteredAndSortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-12">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-64 text-center space-y-12 border border-dashed border-black/5">
            <Package className="w-20 h-20 stroke-[0.5px] text-black/10" />
            <div className="space-y-4">
              <p className="text-[12px] tracking-[1.5em] uppercase font-black text-black/40">NO MODULES FOUND</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
