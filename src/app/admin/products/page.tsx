
"use client"

import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, deleteDoc } from 'firebase/firestore';
import { Plus, Trash2, Edit2, Package, ChevronLeft, Search, Loader2, Info, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type AdminSortOption = 'newest' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-asc' | 'stock-desc' | 'color-asc' | 'most-sold';

export default function AdminProductsPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<AdminSortOption>('newest');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin = user?.email?.toLowerCase() === 'voidwear26@gmail.com';

  useEffect(() => {
    if (mounted && !isUserLoading && !isAdmin) {
      router.push('/');
    }
  }, [mounted, isUserLoading, isAdmin, router]);

  const productsQuery = useMemoFirebase(() => {
    if (!db || !isAdmin) return null;
    return collection(db, 'products');
  }, [db, isAdmin]);

  const { data: products, isLoading: isCollectionLoading } = useCollection(productsQuery);

  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return [];

    let result = products.filter(p => {
      const search = searchTerm.toLowerCase();
      return (
        (p.name || '').toLowerCase().includes(search) || 
        (p.category || '').toLowerCase().includes(search) ||
        (p.color || '').toLowerCase().includes(search) ||
        (p.description || '').toLowerCase().includes(search)
      );
    });

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
        case 'color-asc':
          return (a.color || '').localeCompare(b.color || '');
        case 'most-sold':
          return (b.unitsSold || 0) - (a.unitsSold || 0);
        case 'newest':
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });

    return result;
  }, [products, searchTerm, sortBy]);

  const handleDelete = async (id: string) => {
    if (!db) return;
    if (!confirm('CONFIRM DESTRUCTION OF PRODUCT MODULE?')) return;
    
    try {
      await deleteDoc(doc(db, 'products', id));
      toast({
        title: "MODULE DELETED",
        description: "CATALOGUE UPDATED.",
      });
    } catch (e: any) {
      console.error('[PRODUCT_DELETE_ERROR]', e);
      toast({
        variant: "destructive",
        title: "SYSTEM ERROR",
        description: e.message || "FAILED TO DELETE MODULE."
      });
    }
  };

  if (!mounted || isUserLoading || !isAdmin) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-10 h-10 animate-spin text-white/20" />
      </div>
    );
  }

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="space-y-4">
            <Link href="/admin" className="flex items-center gap-2 text-[10px] text-white/60 hover:text-white transition-colors uppercase tracking-widest mb-4 font-bold">
              <ChevronLeft className="w-3 h-3" />
              BACK TO SYSTEM
            </Link>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight glow-text uppercase leading-none">Assemblages</h1>
          </div>
          <div className="flex gap-4">
            <Button asChild className="bg-white text-black hover:bg-white/90 rounded-none h-14 px-8 text-[10px] font-bold tracking-[0.4em] uppercase shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-500">
              <Link href="/admin/products/new">
                <Plus className="w-4 h-4 mr-3" />
                ADD NEW MODULE
              </Link>
            </Button>
          </div>
        </div>

        {/* Search and Sort Interface */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-start md:items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-white/80 transition-colors" />
            <Input 
              placeholder="SEARCH BY NAME, CATEGORY, COLOR..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border-white/10 h-14 pl-12 rounded-none text-[10px] tracking-[0.3em] focus-visible:ring-0 focus-visible:border-white/40 font-bold text-white uppercase placeholder:text-white/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="hidden sm:flex items-center gap-2 text-[8px] tracking-[0.4em] text-white/40 uppercase font-bold mr-2">
              <SlidersHorizontal className="w-3 h-3" />
              SORT_PROTOCOL:
            </div>
            <Select value={sortBy} onValueChange={(val) => setSortBy(val as AdminSortOption)}>
              <SelectTrigger className="w-full md:w-64 bg-white/5 border-white/10 rounded-none h-14 text-[9px] tracking-[0.3em] uppercase focus:ring-0 text-white font-bold transition-all hover:bg-white/10">
                <SelectValue placeholder="SORT_BY" />
              </SelectTrigger>
              <SelectContent className="bg-black border-white/10 text-white rounded-none">
                <SelectItem value="newest" className="text-[9px] tracking-widest uppercase">RECENT ARRIVALS</SelectItem>
                <SelectItem value="most-sold" className="text-[9px] tracking-widest uppercase text-green-500">HIGH DEMAND (MOST SOLD)</SelectItem>
                <SelectItem value="price-asc" className="text-[9px] tracking-widest uppercase">PRICE: LOW TO HIGH</SelectItem>
                <SelectItem value="price-desc" className="text-[9px] tracking-widest uppercase">PRICE: HIGH TO LOW</SelectItem>
                <SelectItem value="name-asc" className="text-[9px] tracking-widest uppercase">IDENTITY: A - Z</SelectItem>
                <SelectItem value="name-desc" className="text-[9px] tracking-widest uppercase">IDENTITY: Z - A</SelectItem>
                <SelectItem value="stock-desc" className="text-[9px] tracking-widest uppercase">INVENTORY: HIGH AVAILABILITY</SelectItem>
                <SelectItem value="stock-asc" className="text-[9px] tracking-widest uppercase">INVENTORY: DEPLETING FAST</SelectItem>
                <SelectItem value="color-asc" className="text-[9px] tracking-widest uppercase">COLOR SPECTRUM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 overflow-hidden backdrop-blur-xl">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/60">MODULE</th>
                <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/60">CATEGORY // COLOR</th>
                <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/60">PRICE (₹)</th>
                <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/60">TOTAL STOCK</th>
                <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/60 text-right">COMMANDS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isCollectionLoading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-10 py-12 bg-white/[0.01]" />
                  </tr>
                ))
              ) : filteredAndSortedProducts && filteredAndSortedProducts.length > 0 ? (
                filteredAndSortedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-6">
                        <div className="relative w-12 h-16 bg-white/5 border border-white/5">
                          <Image 
                            src={product.imageUrls?.[0] || 'https://picsum.photos/seed/placeholder/200/300'} 
                            alt={product.name} 
                            fill 
                            unoptimized
                            className="object-cover grayscale"
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold tracking-widest uppercase text-white">{product.name}</p>
                          <p className="text-[8px] text-white/40 font-mono font-bold uppercase">UID: {product.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="space-y-1">
                        <p className="text-[10px] text-white/80 tracking-widest uppercase font-bold">{product.category}</p>
                        <p className="text-[8px] text-white/40 tracking-[0.2em] uppercase font-bold">{product.color || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-[10px] font-bold tracking-widest uppercase text-white">
                      ₹{product.basePrice}
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3">
                        <span className={`font-mono text-[10px] tracking-widest ${
                          (product.stockQuantity || 0) < 5 ? 'text-red-500 font-bold' : 'text-white/60'
                        }`}>
                          {product.stockQuantity || 0}
                        </span>
                        {product.stockBySize && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-white/20 hover:text-white">
                                <Info className="w-3 h-3" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 bg-black border-white/10 rounded-none p-4 shadow-2xl">
                              <div className="space-y-2">
                                <p className="text-[8px] tracking-widest text-white/60 uppercase font-bold border-b border-white/5 pb-2">SIZE BREAKDOWN</p>
                                {Object.entries(product.stockBySize).map(([size, qty]) => (
                                  <div key={size} className="flex justify-between text-[9px] tracking-widest py-1 border-b border-white/5 last:border-0">
                                    <span className="text-white/40">{size}</span>
                                    <span className={`font-mono ${(qty as number) < 2 ? 'text-red-500 font-bold' : 'text-white/80'}`}>{qty as number}</span>
                                  </div>
                                ))}
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-4">
                        <Button variant="ghost" size="icon" asChild className="text-white/40 hover:text-white transition-colors">
                          <Link href={``}>
                            <Edit2 className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(product.id)}
                          className="text-white/40 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center opacity-40">
                    <div className="flex flex-col items-center gap-6">
                      <Package className="w-12 h-12 stroke-[0.5px] text-white" />
                      <p className="text-[10px] tracking-[1em] uppercase font-bold text-white">NO MODULES MATCH SEARCH PARAMETERS</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
