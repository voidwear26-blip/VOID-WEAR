
"use client"

import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { Plus, Trash2, Edit2, Package, ChevronLeft, Search, Database, RefreshCw, Loader2, Info } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { products as actualProducts } from '@/app/lib/products';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function AdminProductsPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [syncing, setSyncing] = useState(false);
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

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleSeedData = async () => {
    if (!db) return;
    setSyncing(true);
    try {
      const batch = writeBatch(db);
      actualProducts.forEach(p => {
        const ref = doc(collection(db, 'products'));
        // Convert static mock to new stock structure
        const initialStock = { XS: 5, S: 10, M: 15, L: 10, XL: 5, XXL: 2 };
        const total = Object.values(initialStock).reduce((a, b) => a + b, 0);
        batch.set(ref, {
          ...p,
          stockBySize: initialStock,
          stockQuantity: total,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      });
      await batch.commit();
      toast({
        title: "NEURAL SEED COMPLETE",
        description: "INITIAL CATALOG SYNCED TO SYSTEM WITH SIZE-SPECIFIC STOCK.",
      });
    } catch (e: any) {
      console.error('[SEED_ERROR]', e);
      toast({ 
        variant: "destructive", 
        title: "SYNC FAILED",
        description: e.message 
      });
    } finally {
      setSyncing(false);
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
            <Link href="/admin" className="flex items-center gap-2 text-[10px] text-white/20 hover:text-white transition-colors uppercase tracking-widest mb-4 font-bold">
              <ChevronLeft className="w-3 h-3" />
              BACK TO SYSTEM
            </Link>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight glow-text uppercase leading-none">Assemblages</h1>
          </div>
          <div className="flex gap-4">
             <Button 
              onClick={handleSeedData}
              disabled={syncing}
              variant="outline"
              className="border-white/10 text-white/40 hover:text-white hover:bg-white/5 rounded-none h-14 px-8 text-[10px] font-bold tracking-[0.4em] uppercase transition-all duration-500"
            >
              {syncing ? <RefreshCw className="w-4 h-4 animate-spin mr-3" /> : <Database className="w-4 h-4 mr-3" />}
              SYNC INITIAL CATALOG
            </Button>
            <Button asChild className="bg-white text-black hover:bg-white/90 rounded-none h-14 px-8 text-[10px] font-bold tracking-[0.4em] uppercase shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-500">
              <Link href="/admin/products/new">
                <Plus className="w-4 h-4 mr-3" />
                ADD NEW MODULE
              </Link>
            </Button>
          </div>
        </div>

        <div className="mb-12 relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <Input 
            placeholder="FILTER BY NAME OR CATEGORY..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white/5 border-white/10 h-14 pl-12 rounded-none text-[10px] tracking-widest focus-visible:ring-0 focus-visible:border-white/40 font-bold text-white"
          />
        </div>

        <div className="bg-white/[0.02] border border-white/5 overflow-hidden backdrop-blur-xl">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">MODULE</th>
                <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">CATEGORY</th>
                <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">PRICE (₹)</th>
                <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">TOTAL STOCK</th>
                <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/40 text-right">COMMANDS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isCollectionLoading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-10 py-12 bg-white/[0.01]" />
                  </tr>
                ))
              ) : filteredProducts && filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
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
                          <p className="text-[10px] font-bold tracking-widest uppercase">{product.name}</p>
                          <p className="text-[8px] text-white/20 font-mono font-bold uppercase">UID: {product.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-[10px] text-white/40 tracking-widest uppercase font-bold">
                      {product.category}
                    </td>
                    <td className="px-10 py-8 text-[10px] font-bold tracking-widest uppercase">
                      ₹{product.basePrice}
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] tracking-widest text-white/40">
                          {product.stockQuantity || 0}
                        </span>
                        {product.stockBySize && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-white/20 hover:text-white">
                                <Info className="w-3 h-3" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-40 bg-black border-white/10 rounded-none p-4">
                              <div className="space-y-2">
                                <p className="text-[8px] tracking-widest text-white/40 uppercase font-bold border-b border-white/5 pb-2">SIZE BREAKDOWN</p>
                                {Object.entries(product.stockBySize).map(([size, qty]) => (
                                  <div key={size} className="flex justify-between text-[9px] tracking-widest">
                                    <span className="text-white/40">{size}</span>
                                    <span className="text-white font-mono">{qty as number}</span>
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
                        <Button variant="ghost" size="icon" asChild className="text-white/20 hover:text-white transition-colors">
                          <Link href={`/admin/products/${product.id}`}>
                            <Edit2 className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(product.id)}
                          className="text-white/20 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center opacity-20">
                    <div className="flex flex-col items-center gap-6">
                      <Package className="w-12 h-12 stroke-[0.5px]" />
                      <p className="text-[10px] tracking-[1em] uppercase font-bold text-white/40">NO MODULES LOGGED</p>
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
