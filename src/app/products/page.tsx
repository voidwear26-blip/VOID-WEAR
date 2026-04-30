
"use client"

import { ProductCard } from '@/components/product-card';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
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
    return collection(db, 'products');
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
    <div className="pt-48 pb-32 bg-transparent min-h-screen">
      <div className="container mx-auto px-6 md:px-10">
        <div className="space-y-6 mb-32 max-w-4xl">
          <div className="flex items-center gap-4">
             <div className="h-[2px] w-12 bg-white/20"></div>
             <span className="text-[11px] font-black tracking-[0.8em] text-white/80 uppercase">CATALOGUE // SEASON 01</span>
          </div>
          <h1 className="text-7xl md:text-9xl font-black tracking-tight glow-text leading-none uppercase text-white">The <br /> Assemblage</h1>
          <p className="text-white/70 tracking-[0.4em] text-sm uppercase leading-relaxed font-light max-w-2xl">
            Technical shells and modular apparel designed for high-density urban migration. Massive scale, precision engineered in the void.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 mb-24 items-start md:items-center justify-between border-y border-white/5 py-12">
          <div className="relative w-full md:w-[450px] group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-white transition-colors" />
            <Input 
              placeholder="SEARCH THE ASSEMBLAGE..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border-white/10 h-16 pl-16 rounded-none text-[12px] tracking-[0.4em] focus-visible:ring-0 focus-visible:border-white/60 font-black text-white uppercase placeholder:text-white/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-6 w-full md:w-auto">
            <div className="hidden sm:flex items-center gap-3 text-[10px] tracking-[0.5em] text-white/60 uppercase font-black mr-4">
              <SlidersHorizontal className="w-4 h-4" />
              CALIBRATE_GRID:
            </div>
            <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
              <SelectTrigger className="w-full md:w-80 bg-white/5 border-white/10 rounded-none h-16 text-[10px] tracking-[0.4em] uppercase focus:ring-0 text-white font-black transition-all hover:bg-white/10">
                <SelectValue placeholder="SORT_BY" />
              </SelectTrigger>
              <SelectContent className="bg-black border-white/20 text-white rounded-none">
                <SelectItem value="newest" className="text-[10px] tracking-widest uppercase">RECENT ARRIVALS</SelectItem>
                <SelectItem value="price-asc" className="text-[10px] tracking-widest uppercase">PRICE: LOW TO HIGH</SelectItem>
                <SelectItem value="price-desc" className="text-[10px] tracking-widest uppercase">PRICE: HIGH TO LOW</SelectItem>
                <SelectItem value="name-asc" className="text-[10px] tracking-widest uppercase">IDENTITY: A - Z</SelectItem>
                <SelectItem value="name-desc" className="text-[10px] tracking-widest uppercase">IDENTITY: Z - A</SelectItem>
                <SelectItem value="stock-desc" className="text-[10px] tracking-widest uppercase">INVENTORY: HIGH AVAILABILITY</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-48 opacity-80">
            <Loader2 className="w-12 h-12 animate-spin mb-8 text-white/60" />
            <p className="text-[12px] tracking-[1em] uppercase font-black text-white/40">Syncing Assemblages...</p>
          </div>
        ) : filteredAndSortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 md:gap-32">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-64 text-center space-y-12 opacity-80 border border-dashed border-white/10">
            <Package className="w-24 h-24 stroke-[0.5px] text-white/20" />
            <div className="space-y-4">
              <p className="text-[14px] tracking-[1.5em] uppercase font-black text-white">NO MODULES LOGGED</p>
              <p className="text-[10px] tracking-[0.5em] uppercase max-w-md mx-auto text-white/40 font-bold">
                {searchTerm ? 'NO RESULTS MATCH YOUR SEARCH COORDINATES.' : 'DATABASE DISCONNECTED OR EMPTY.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
