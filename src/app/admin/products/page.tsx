"use client"

import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, doc, deleteDoc, query, limit } from 'firebase/firestore';
import { Plus, Trash2, Edit2, Package, ChevronLeft, Search, Loader2, SlidersHorizontal, Hash } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type AdminSortOption = 'newest' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-asc' | 'stock-desc';

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

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  const isAdmin = useMemo(() => {
    if (isUserLoading || !user) return false;
    return user.email?.toLowerCase() === 'voidwear26@gmail.com' || 
           user.uid === 'A9vsqn10oddfmouKiKjWpTcFqZB2' ||
           profile?.role === 'ADMIN';
  }, [user, isUserLoading, profile]);

  const productsQuery = useMemoFirebase(() => {
    if (!db || !isAdmin) return null;
    return query(collection(db, 'products'), limit(100));
  }, [db, isAdmin]);

  const { data: products, isLoading: isCollectionLoading } = useCollection(productsQuery);

  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return [];

    let result = products.filter(p => {
      const search = searchTerm.toLowerCase();
      return (
        (p.name || '').toLowerCase().includes(search) || 
        (p.category || '').toLowerCase().includes(search)
      );
    });

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
  }, [products, searchTerm, sortBy]);

  const handleDelete = async (id: string) => {
    if (!db) return;
    if (!confirm('Permanently delete this product?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      toast({ title: "PRODUCT DELETED" });
    } catch (e) { }
  };

  if (!mounted || isUserLoading || isProfileLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-black/20" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen text-black font-body">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="space-y-4">
            <Link href="/admin" className="flex items-center gap-2 text-[10px] text-black/60 hover:text-black transition-colors uppercase tracking-widest mb-4 font-bold">
              <ChevronLeft className="w-3 h-3" />
              BACK TO DASHBOARD
            </Link>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none font-headline">Product Stock</h1>
          </div>
          <Button asChild className="bg-black text-white hover:bg-black/90 rounded-none h-14 px-8 text-[10px] font-bold tracking-[0.4em] uppercase shadow-sm">
            <Link href="/admin/products/new"><Plus className="w-4 h-4 mr-3" /> ADD PRODUCT</Link>
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-6 mb-12 items-start md:items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 transition-colors" />
            <Input 
              placeholder="SEARCH PRODUCTS..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black/5 border-black/10 h-14 pl-12 rounded-none text-[10px] tracking-[0.3em] font-bold text-black uppercase transition-all"
            />
          </div>
          <Select value={sortBy} onValueChange={(val) => setSortBy(val as AdminSortOption)}>
            <SelectTrigger className="w-full md:w-64 bg-black/5 border-black/10 rounded-none h-14 text-[9px] tracking-[0.3em] uppercase text-black font-bold">
              <SelectValue placeholder="SORT BY" />
            </SelectTrigger>
            <SelectContent className="bg-background border-black/20 text-black rounded-none">
              <SelectItem value="newest" className="text-[9px] uppercase">NEWEST</SelectItem>
              <SelectItem value="price-asc" className="text-[9px] uppercase">PRICE: LOW</SelectItem>
              <SelectItem value="price-desc" className="text-[9px] uppercase">PRICE: HIGH</SelectItem>
              <SelectItem value="stock-asc" className="text-[9px] uppercase">LOW STOCK</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-black/[0.01] border border-black/5 overflow-hidden backdrop-blur-xl shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/5 bg-black/[0.02]">
                <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-black/40">MODULE</th>
                <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-black/40">CATEGORY</th>
                <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-black/40">PRICE</th>
                <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-black/40 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {isCollectionLoading ? (
                <tr><td colSpan={4} className="px-10 py-32 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-black/20" /></td></tr>
              ) : filteredAndSortedProducts.map((p) => (
                <tr key={p.id} className="hover:bg-black/[0.02] transition-colors group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-6">
                      <div className="relative w-12 h-16 bg-black/5 border border-black/5 overflow-hidden">
                        <Image src={p.imageUrls?.[0] || 'https://picsum.photos/seed/void/200/300'} alt={p.name} fill unoptimized className="object-cover grayscale group-hover:grayscale-0" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold tracking-widest uppercase text-black">{p.name}</span>
                        <p className="text-[8px] text-black/40 uppercase font-mono">STOCK: {p.stockQuantity || 0}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="text-[10px] text-black/60 uppercase font-bold">{p.category}</span>
                  </td>
                  <td className="px-10 py-8 text-[10px] font-bold text-black">₹{p.basePrice}</td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/products/${p.id}`}><Button variant="ghost" size="icon" className="text-black/40 hover:text-black"><Edit2 className="w-4 h-4" /></Button></Link>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} className="text-black/40 hover:text-red-600"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
