"use client"

import { ProductCard } from '@/components/product-card';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Loader2, Package, Search, ChevronDown, SlidersHorizontal } from 'lucide-react';
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

    // 1. Filtering
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.name?.toLowerCase().includes(lowerSearch) || 
        p.category?.toLowerCase().includes(lowerSearch) ||
        p.description?.toLowerCase().includes(lowerSearch)
      );
    }

    // 2. Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'price-asc':
          return (a.basePrice || 0) - (b.basePrice || 0);
        case 'price-desc':
          return (b.basePrice || 0) - (a.basePrice || 0);
        case 'stock-asc':
          return (a.stockQuantity || 0) - (b.stockQuantity || 0);
        case 'stock-desc':
          return (b.stockQuantity || 0) - (a.stockQuantity || 0);
        case 'newest':
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });

    return result;
  }, [dbProducts, searchTerm, sortBy]);

  return (
    <div className="pt-48 pb-32 bg-transparent min-h-screen">
      <div className="container mx-auto px-6 md:px-10">
        <div className="space-y-6 mb-24 max-w-3xl">
          <span className="text-[10px] font-bold tracking-[0.8em] text-white/50 uppercase">CATALOGUE // SEASON 01</span>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight glow-text leading-none uppercase">The <br /> Assemblage</h1>
          <p className="text-white/60 tracking-[0.3em] text-xs uppercase leading-relaxed">
            Technical shells and modular apparel designed for high-density urban migration. Precision engineered in the void.
          </p>
        </div>

        {/* Controls Module */}
        <div className="flex flex-col md:flex-row gap-6 mb-16 items-start md:items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-white/80 transition-colors" />
            <Input 
              placeholder="SEARCH THE ASSEMBLAGE..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border-white/20 h-14 pl-12 rounded-none text-[10px] tracking-[0.3em] focus-visible:ring-0 focus-visible:border-white/60 font-bold text-white uppercase placeholder:text-white/30 transition-all"
            />
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="hidden sm:flex items-center gap-2 text-[8px] tracking-[0.4em] text-white/50 uppercase font-bold mr-2">
              <SlidersHorizontal className="w-3 h-3" />
              SORT_BY:
            </div>
            <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
              <SelectTrigger className="w-full md:w-64 bg-white/5 border-white/20 rounded-none h-14 text-[9px] tracking-[0.3em] uppercase focus:ring-0 text-white font-bold transition-all hover:bg-white/10">
                <SelectValue placeholder="SORT_BY" />
              </SelectTrigger>
              <SelectContent className="bg-black border-white/20 text-white rounded-none">
                <SelectItem value="newest" className="text-[9px] tracking-widest uppercase">RECENT ARRIVALS</SelectItem>
                <SelectItem value="price-asc" className="text-[9px] tracking-widest uppercase">PRICE: LOW TO HIGH</SelectItem>
                <SelectItem value="price-desc" className="text-[9px] tracking-widest uppercase">PRICE: HIGH TO LOW</SelectItem>
                <SelectItem value="name-asc" className="text-[9px] tracking-widest uppercase">IDENTITY: A - Z</SelectItem>
                <SelectItem value="name-desc" className="text-[9px] tracking-widest uppercase">IDENTITY: Z - A</SelectItem>
                <SelectItem value="stock-desc" className="text-[9px] tracking-widest uppercase">INVENTORY: HIGH AVAILABILITY</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-40">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-[10px] tracking-[1em] uppercase">Syncing Assemblages...</p>
          </div>
        ) : filteredAndSortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-48 text-center space-y-8 opacity-40 border border-dashed border-white/10">
            <Package className="w-16 h-16 stroke-[0.5px]" />
            <div className="space-y-2">
              <p className="text-[10px] tracking-[1em] uppercase font-bold">NO MODULES LOGGED</p>
              <p className="text-[8px] tracking-[0.3em] uppercase max-w-xs mx-auto text-white/60">
                {searchTerm ? 'NO RESULTS MATCH YOUR SEARCH COORDINATES.' : 'DATABASE DISCONNECTED OR EMPTY. USE COMMAND CENTER TO INITIALIZE CATALOGUE.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
