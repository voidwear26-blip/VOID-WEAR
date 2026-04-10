
'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, deleteDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Package, ChevronLeft, Search, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function AdminProductsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'products');
  }, [db]);

  const { data: products, isLoading } = useCollection(productsQuery);

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!db || !confirm('CONFIRM DESTRUCTION OF PRODUCT MODULE?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      toast({
        title: "MODULE DELETED",
        description: "CATALOGUE UPDATED SUCCESSFULLY.",
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="space-y-4">
            <Link href="/admin" className="flex items-center gap-2 text-[10px] text-white/20 hover:text-white transition-colors uppercase tracking-widest mb-4">
              <ChevronLeft className="w-3 h-3" />
              BACK TO SYSTEM
            </Link>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight glow-text uppercase leading-none">Assemblages</h1>
            <p className="text-[10px] text-white/40 tracking-[0.4em] uppercase">Manage the physical catalog</p>
          </div>
          <Button asChild className="bg-white text-black hover:bg-white/90 rounded-none h-14 px-8 text-[10px] font-bold tracking-[0.4em]">
            <Link href="/admin/products/new">
              <Plus className="w-4 h-4 mr-3" />
              ADD NEW MODULE
            </Link>
          </Button>
        </div>

        <div className="mb-12 relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <Input 
            placeholder="FILTER BY NAME OR CATEGORY..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white/5 border-white/10 h-14 pl-12 rounded-none text-[10px] tracking-widest focus-visible:ring-0 focus-visible:border-white/40"
          />
        </div>

        <div className="bg-white/[0.02] border border-white/5 overflow-hidden backdrop-blur-xl">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">MODULE</th>
                <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">CATEGORY</th>
                <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">PRICE</th>
                <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">STOCK</th>
                <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/40 text-right">COMMANDS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
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
                            className="object-cover grayscale"
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold tracking-widest uppercase">{product.name}</p>
                          <p className="text-[8px] text-white/20 font-mono">UID: {product.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-[10px] text-white/40 tracking-widest uppercase">
                      {product.category}
                    </td>
                    <td className="px-10 py-8 text-[10px] font-bold tracking-widest">
                      ${product.basePrice}
                    </td>
                    <td className="px-10 py-8">
                      <span className="text-[10px] font-mono tracking-widest">
                        {product.stockQuantity || '--'}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
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
                      <p className="text-[10px] tracking-[1em] uppercase">NO MODULES LOGGED</p>
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
