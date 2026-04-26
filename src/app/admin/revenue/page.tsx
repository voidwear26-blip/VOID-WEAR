"use client"

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collectionGroup, query, orderBy } from 'firebase/firestore';
import { ChevronLeft, TrendingUp, Loader2, Package, Hash, DollarSign, ArrowDownWideNarrow } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RevenueDetailsPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

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
    return collectionGroup(db, 'orders');
  }, [db, isAdmin]);

  const { data: orders, isLoading } = useCollection(ordersQuery);

  const revenueBreakdown = useMemo(() => {
    if (!orders) return [];
    
    const productMap = new Map<string, { 
      name: string; 
      quantity: number; 
      totalRevenue: number; 
      price: number 
    }>();

    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const name = item.name || 'UNIDENTIFIED MODULE';
          const existing = productMap.get(name) || { 
            name, 
            quantity: 0, 
            totalRevenue: 0, 
            price: Number(item.price) || 0 
          };
          
          const qty = Number(item.quantity) || 1;
          const price = Number(item.price) || 0;

          productMap.set(name, {
            name,
            quantity: existing.quantity + qty,
            totalRevenue: existing.totalRevenue + (qty * price),
            price: price // Store the latest price encountered
          });
        });
      }
    });

    return Array.from(productMap.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [orders]);

  const totalAggregatedRevenue = useMemo(() => {
    return revenueBreakdown.reduce((acc, item) => acc + item.totalRevenue, 0);
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
      <div className="container mx-auto px-6 max-w-5xl">
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
               <span className="text-[9px] tracking-[0.3em] font-bold text-white/40 uppercase">TOTAL SYSTEM REVENUE</span>
               <span className="text-3xl font-black glow-text">₹{totalAggregatedRevenue.toLocaleString()}</span>
            </div>
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
                           <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center">
                              <Package className="w-4 h-4 text-white/40" />
                           </div>
                           <span className="text-[11px] font-black tracking-widest text-white uppercase">{item.name}</span>
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
                        <p className="text-[10px] tracking-[1em] uppercase font-bold">NO SALES LOGGED IN SYSTEM</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-12 p-8 border border-white/5 bg-white/[0.01] flex items-center justify-between">
           <div className="flex items-center gap-4 text-white/40">
              <ArrowDownWideNarrow className="w-4 h-4" />
              <span className="text-[9px] tracking-[0.4em] uppercase font-bold">SORTED BY VALUATION DESCENDING</span>
           </div>
           <p className="text-[8px] tracking-[0.2em] text-white/20 uppercase font-black italic">
              REVENUE DATA IS AGGREGATED IN REAL-TIME FROM ALL CONFIRMED TRANSMISSIONS.
           </p>
        </div>
      </div>
    </div>
  );
}
