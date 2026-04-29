"use client"

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collectionGroup, query, limit } from 'firebase/firestore';
import { ChevronLeft, TrendingUp, Loader2, Info, ArrowDownWideNarrow } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';

type RevenueSortOption = 'valuation-desc' | 'valuation-asc' | 'quantity-desc' | 'quantity-asc' | 'name-asc' | 'date-newest';

export default function RevenueDetailsPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<RevenueSortOption>('valuation-desc');

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin = useMemo(() => {
    if (isUserLoading || !user) return false;
    return user.email?.toLowerCase() === 'voidwear26@gmail.com' || 
           user.uid === 'A9vsqn10oddfmouKiKjWpTcFqZB2';
  }, [user, isUserLoading]);

  useEffect(() => {
    if (mounted && !isUserLoading && !isAdmin) {
      router.push('/');
    }
  }, [mounted, isUserLoading, isAdmin, router]);

  const ordersQuery = useMemoFirebase(() => {
    if (!db || !isAdmin) return null;
    // Simple query to bypass composite index requirement
    return query(collectionGroup(db, 'orders'), limit(1000));
  }, [db, isAdmin]);

  const { data: orders, isLoading } = useCollection(ordersQuery);

  const revenueBreakdown = useMemo(() => {
    if (!orders) return [];
    
    let filteredOrders = [...orders];

    if (startDate) {
      filteredOrders = filteredOrders.filter(o => new Date(o.orderDate) >= new Date(startDate));
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filteredOrders = filteredOrders.filter(o => new Date(o.orderDate) <= end);
    }

    const productMap = new Map<string, { 
      name: string; 
      quantity: number; 
      totalRevenue: number; 
      price: number;
      image: string;
      lastSold: string;
    }>();

    filteredOrders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const name = item.name || 'UNIDENTIFIED MODULE';
          const existing = productMap.get(name) || { 
            name, 
            quantity: 0, 
            totalRevenue: 0, 
            price: Number(item.price) || 0,
            image: item.image || (item.imageUrls && item.imageUrls[0]) || 'https://picsum.photos/seed/void/200/300',
            lastSold: order.orderDate
          };
          
          const qty = Number(item.quantity) || 1;
          const price = Number(item.price) || 0;

          const currentLastSold = new Date(existing.lastSold).getTime();
          const orderDate = new Date(order.orderDate).getTime();
          const latestSold = orderDate > currentLastSold ? order.orderDate : existing.lastSold;

          productMap.set(name, {
            name,
            quantity: existing.quantity + qty,
            totalRevenue: existing.totalRevenue + (qty * price),
            price: price,
            image: existing.image,
            lastSold: latestSold
          });
        });
      }
    });

    const result = Array.from(productMap.values());

    result.sort((a, b) => {
      switch (sortBy) {
        case 'valuation-asc': return a.totalRevenue - b.totalRevenue;
        case 'quantity-desc': return b.quantity - a.quantity;
        case 'quantity-asc': return a.quantity - b.quantity;
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'date-newest': return new Date(b.lastSold).getTime() - new Date(a.lastSold).getTime();
        case 'valuation-desc':
        default: return b.totalRevenue - a.totalRevenue;
      }
    });

    return result;
  }, [orders, startDate, endDate, sortBy]);

  const summary = useMemo(() => {
    return revenueBreakdown.reduce((acc, item) => ({
      totalRevenue: acc.totalRevenue + item.totalRevenue,
      totalUnits: acc.totalUnits + item.quantity,
      uniqueModules: acc.uniqueModules + 1
    }), { totalRevenue: 0, totalUnits: 0, uniqueModules: 0 });
  }, [revenueBreakdown]);

  if (!mounted || isUserLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-10 h-10 animate-spin text-white/20" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen text-white">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="space-y-4 mb-16">
          <Link href="/admin" className="flex items-center gap-2 text-[10px] text-white/40 hover:text-white transition-colors uppercase tracking-widest mb-4 font-bold">
            <ChevronLeft className="w-3 h-3" />
            BACK TO SYSTEM
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight glow-text uppercase leading-none">Revenue Analysis</h1>
              <p className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">Global Acquisition Audit</p>
            </div>
            <div className="bg-white/5 border border-white/10 px-8 py-4 flex flex-col items-end gap-1 backdrop-blur-md">
               <span className="text-[9px] tracking-[0.3em] font-bold text-white/40 uppercase">FILTERED REVENUE</span>
               <span className="text-3xl font-black glow-text">₹{summary.totalRevenue.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
           <div className="space-y-2">
              <label className="text-[8px] font-bold tracking-[0.3em] text-white/40 uppercase pl-1">START_CYCLE</label>
              <Input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white/5 border-white/10 h-12 rounded-none text-[10px] tracking-widest text-white uppercase focus:border-white/40"
              />
           </div>
           <div className="space-y-2">
              <label className="text-[8px] font-bold tracking-[0.3em] text-white/40 uppercase pl-1">END_CYCLE</label>
              <Input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-white/5 border-white/10 h-12 rounded-none text-[10px] tracking-widest text-white uppercase focus:border-white/40"
              />
           </div>
           <div className="space-y-2 md:col-span-2">
              <label className="text-[8px] font-bold tracking-[0.3em] text-white/40 uppercase pl-1">SORT_BY</label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as RevenueSortOption)}>
                <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-none text-[10px] tracking-widest text-white uppercase focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/20 text-white rounded-none">
                  <SelectItem value="valuation-desc" className="text-[10px] tracking-widest">VALUATION: HIGH TO LOW</SelectItem>
                  <SelectItem value="valuation-asc" className="text-[10px] tracking-widest">VALUATION: LOW TO HIGH</SelectItem>
                  <SelectItem value="quantity-desc" className="text-[10px] tracking-widest">UNITS: MOST SOLD</SelectItem>
                  <SelectItem value="quantity-asc" className="text-[10px] tracking-widest">UNITS: LEAST SOLD</SelectItem>
                  <SelectItem value="date-newest" className="text-[10px] tracking-widest">RECENT ACQUISITIONS</SelectItem>
                  <SelectItem value="name-asc" className="text-[10px] tracking-widest">MODULE: A - Z</SelectItem>
                </SelectContent>
              </Select>
           </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-10 py-8 text-[10px] font-bold tracking-[0.3em] uppercase text-white/60">MODULE IDENTITY</th>
                  <th className="px-10 py-8 text-[10px] font-bold tracking-[0.3em] uppercase text-white/60 text-center">UNITS SOLD</th>
                  <th className="px-10 py-8 text-[10px] font-bold tracking-[0.3em] uppercase text-white/60 text-center">UNIT PRICE</th>
                  <th className="px-10 py-8 text-[10px] font-bold tracking-[0.3em] uppercase text-white/60 text-right">TOTAL VALUATION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  [1, 2, 3, 4, 5].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="px-10 py-12 bg-white/[0.01]" />
                    </tr>
                  ))
                ) : revenueBreakdown.length > 0 ? (
                  revenueBreakdown.map((item, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-10 py-10">
                        <div className="flex items-center gap-6">
                           <div className="relative w-12 h-16 bg-white/5 border border-white/10 overflow-hidden">
                              <Image 
                                src={item.image} 
                                alt={item.name} 
                                fill 
                                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                                unoptimized
                              />
                           </div>
                           <div className="space-y-1">
                              <span className="text-[11px] font-black tracking-widest text-white uppercase">{item.name}</span>
                              <p className="text-[8px] text-white/30 tracking-widest uppercase">LAST_SOLD: {new Date(item.lastSold).toLocaleDateString()}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-10 py-10 text-center">
                         <span className="text-[11px] font-mono tracking-widest text-white/80">{item.quantity}</span>
                      </td>
                      <td className="px-10 py-10 text-center">
                         <span className="text-[11px] font-mono tracking-widest text-white/40">₹{item.price.toLocaleString()}</span>
                      </td>
                      <td className="px-10 py-10 text-right">
                         <span className="text-[11px] font-black tracking-widest text-white glow-text">₹{item.totalRevenue.toLocaleString()}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-10 py-32 text-center opacity-40">
                      <div className="flex flex-col items-center gap-6">
                        <TrendingUp className="w-12 h-12 stroke-[0.5px]" />
                        <p className="text-[10px] tracking-[1em] uppercase font-bold">NO SALES DETECTED IN THIS CYCLE</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
              {!isLoading && revenueBreakdown.length > 0 && (
                <tfoot className="border-t-2 border-white/10 bg-white/[0.03]">
                   <tr>
                      <td className="px-10 py-12">
                         <div className="flex items-center gap-4">
                            <Info className="w-4 h-4 text-white/30" />
                            <div className="space-y-1">
                               <p className="text-[10px] font-black tracking-[0.4em] text-white uppercase">SYSTEM_TOTALS</p>
                               <p className="text-[8px] text-white/40 tracking-[0.2em] uppercase font-bold">{summary.uniqueModules} UNIQUE MODULES LOGGED</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-10 py-12 text-center">
                         <div className="space-y-1">
                            <p className="text-[14px] font-black text-white tracking-widest">{summary.totalUnits}</p>
                            <p className="text-[7px] font-bold text-white/30 tracking-widest uppercase">AGGREGATED UNITS</p>
                         </div>
                      </td>
                      <td className="px-10 py-12 text-center">
                         <span className="text-white/20">---</span>
                      </td>
                      <td className="px-10 py-12 text-right">
                         <div className="space-y-1">
                            <p className="text-[18px] font-black text-white glow-text tracking-widest">₹{summary.totalRevenue.toLocaleString()}</p>
                            <p className="text-[7px] font-bold text-white/30 tracking-widest uppercase">TOTAL VALUATION</p>
                         </div>
                      </td>
                   </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        <div className="mt-12 p-8 border border-white/5 bg-white/[0.01] flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4 text-white/40">
              <ArrowDownWideNarrow className="w-4 h-4" />
              <span className="text-[9px] tracking-[0.4em] uppercase font-bold">SORT_PROTOCOL: {sortBy.replace('-', '_').toUpperCase()}</span>
           </div>
           <p className="text-[8px] tracking-[0.2em] text-white/20 uppercase font-black italic text-center md:text-right">
              REVENUE DATA IS AGGREGATED IN REAL-TIME FROM ALL CONFIRMED TRANSMISSIONS. FILTERING APPLIES TO THE CURRENT ACTIVE CYCLE.
           </p>
        </div>
      </div>
    </div>
  );
}
