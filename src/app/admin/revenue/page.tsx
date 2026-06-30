"use client"

import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collectionGroup, query, limit, doc } from 'firebase/firestore';
import { ChevronLeft, TrendingUp, Loader2, Info, ArrowDownWideNarrow, Hash, User as UserIcon, Zap } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type RevenueSortOption = 'total-desc' | 'total-asc' | 'date-newest' | 'date-oldest' | 'tax-desc' | 'shipping-desc';

export default function RevenueDetailsPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<RevenueSortOption>('date-newest');

  useEffect(() => {
    setMounted(true);
  }, []);

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  const isAdmin = useMemo(() => {
    if (isUserLoading || !user || isProfileLoading) return false;
    return user.email?.toLowerCase() === 'voidwear26@gmail.com' || 
           user.uid === 'A9vsqn10oddfmouKiKjWpTcFqZB2' ||
           profile?.role === 'ADMIN';
  }, [user, isUserLoading, profile, isProfileLoading]);

  useEffect(() => {
    if (mounted && !isUserLoading && !isProfileLoading && !isAdmin) {
      router.push('/');
    }
  }, [mounted, isUserLoading, isProfileLoading, isAdmin, router]);

  const ordersQuery = useMemoFirebase(() => {
    if (!db || !isAdmin) return null;
    return query(collectionGroup(db, 'orders'), limit(1000));
  }, [db, isAdmin]);

  const { data: orders, isLoading } = useCollection(ordersQuery);

  const processedOrders = useMemo(() => {
    if (!orders) return [];
    
    let filtered = [...orders];

    if (startDate) {
      filtered = filtered.filter(o => new Date(o.orderDate) >= new Date(startDate));
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(o => new Date(o.orderDate) <= end);
    }

    filtered.sort((a, b) => {
      const valA = Number(a.totalAmount) || 0;
      const valB = Number(b.totalAmount) || 0;
      const taxA = Number(a.taxAmount) || 0;
      const taxB = Number(b.taxAmount) || 0;
      const shipA = Number(a.shippingFee) || 0;
      const shipB = Number(b.shippingFee) || 0;
      const dateA = new Date(a.orderDate).getTime();
      const dateB = new Date(b.orderDate).getTime();

      switch (sortBy) {
        case 'total-asc': return valA - valB;
        case 'total-desc': return valB - valA;
        case 'tax-desc': return taxB - taxA;
        case 'shipping-desc': return shipB - shipA;
        case 'date-oldest': return dateA - dateB;
        case 'date-newest':
        default: return dateB - dateA;
      }
    });

    return filtered;
  }, [orders, startDate, endDate, sortBy]);

  const totals = useMemo(() => {
    return processedOrders.reduce((acc, order) => ({
      subtotal: acc.subtotal + (Number(order.subtotal) || 0),
      tax: acc.tax + (Number(order.taxAmount) || 0),
      shipping: acc.shipping + (Number(order.shippingFee) || 0),
      total: acc.total + (Number(order.totalAmount) || 0)
    }), { subtotal: 0, tax: 0, shipping: 0, total: 0 });
  }, [processedOrders]);

  if (!mounted || isUserLoading || isProfileLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-10 h-10 animate-spin text-white/20" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen text-white">
      <div className="container mx-auto px-6 max-w-7xl">
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
               <span className="text-[9px] tracking-[0.3em] font-bold text-white/40 uppercase">FILTERED TOTAL REVENUE</span>
               <span className="text-3xl font-black glow-text">₹{totals.total.toLocaleString()}</span>
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
                  <SelectItem value="date-newest" className="text-[10px] tracking-widest uppercase">RECENT TRANSMISSIONS</SelectItem>
                  <SelectItem value="total-desc" className="text-[10px] tracking-widest uppercase">VALUATION: HIGH TO LOW</SelectItem>
                  <SelectItem value="total-asc" className="text-[10px] tracking-widest uppercase">VALUATION: LOW TO HIGH</SelectItem>
                  <SelectItem value="tax-desc" className="text-[10px] tracking-widest uppercase">HIGHEST TAX YIELD</SelectItem>
                  <SelectItem value="shipping-desc" className="text-[10px] tracking-widest uppercase">HIGHEST SHIPPING FEES</SelectItem>
                </SelectContent>
              </Select>
           </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-8 py-8 text-[10px] font-bold tracking-[0.3em] uppercase text-white/60">ORDER_UID</th>
                  <th className="px-8 py-8 text-[10px] font-bold tracking-[0.3em] uppercase text-white/60">OPERATOR</th>
                  <th className="px-8 py-8 text-[10px] font-bold tracking-[0.3em] uppercase text-white/60 text-right">SUBTOTAL</th>
                  <th className="px-8 py-8 text-[10px] font-bold tracking-[0.3em] uppercase text-white/60 text-right">ESTIMATED TAX</th>
                  <th className="px-8 py-8 text-[10px] font-bold tracking-[0.3em] uppercase text-white/60 text-right">SHIPPING</th>
                  <th className="px-8 py-8 text-[10px] font-bold tracking-[0.3em] uppercase text-white/60 text-right">TOTAL VALUATION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(isLoading || isProfileLoading) ? (
                  [1, 2, 3, 4, 5].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-8 py-12 bg-white/[0.01]" />
                    </tr>
                  ))
                ) : processedOrders.length > 0 ? (
                  processedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-8">
                        <div className="flex items-center gap-4">
                           <Hash className="w-3.5 h-3.5 text-white/20" />
                           <div className="space-y-1">
                              <span className="text-[10px] font-mono tracking-widest text-white font-black">{order.order_ID || order.id}</span>
                              <p className="text-[8px] text-white/30 tracking-widest uppercase">{new Date(order.orderDate).toLocaleDateString()}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex items-center gap-3">
                           <UserIcon className="w-3 h-3 text-white/20" />
                           <div className="space-y-0.5">
                              <p className="text-[10px] font-black tracking-widest text-white/80 uppercase">{order.displayName || 'OPERATOR'}</p>
                              <p className="text-[8px] font-mono text-white/20">{order.email}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-8 text-right">
                         <span className="text-[10px] font-mono tracking-widest text-white/40">₹{(Number(order.subtotal) || 0).toLocaleString()}</span>
                      </td>
                      <td className="px-8 py-8 text-right">
                         <span className="text-[10px] font-mono tracking-widest text-white/40">₹{(Number(order.taxAmount) || 0).toLocaleString()}</span>
                      </td>
                      <td className="px-8 py-8 text-right">
                         <span className={`text-[10px] font-mono tracking-widest ${Number(order.shippingFee) === 0 ? 'text-green-500/40' : 'text-white/40'}`}>
                           {Number(order.shippingFee) === 0 ? 'FREE' : `₹${(Number(order.shippingFee) || 0).toLocaleString()}`}
                         </span>
                      </td>
                      <td className="px-8 py-8 text-right">
                         <span className="text-[11px] font-black tracking-widest text-white glow-text">₹{(Number(order.totalAmount) || 0).toLocaleString()}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-32 text-center opacity-40">
                      <div className="flex flex-col items-center gap-6">
                        <TrendingUp className="w-12 h-12 stroke-[0.5px]" />
                        <p className="text-[10px] tracking-[1em] uppercase font-bold">NO SALES DETECTED IN THIS CYCLE</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
              {!isLoading && !isProfileLoading && processedOrders.length > 0 && (
                <tfoot className="border-t-2 border-white/10 bg-white/[0.03]">
                   <tr>
                      <td colSpan={2} className="px-8 py-10">
                         <div className="flex items-center gap-4">
                            <Info className="w-4 h-4 text-white/30" />
                            <div className="space-y-1">
                               <p className="text-[10px] font-black tracking-[0.4em] text-white uppercase">SYSTEM_TOTALS</p>
                               <p className="text-[8px] text-white/40 tracking-[0.2em] uppercase font-bold">{processedOrders.length} TRANSMISSIONS ANALYZED</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-10 text-right">
                         <div className="space-y-1">
                            <p className="text-[11px] font-black text-white/60 tracking-widest">₹{totals.subtotal.toLocaleString()}</p>
                            <p className="text-[7px] font-bold text-white/20 tracking-widest uppercase">AGGREGATED SUBTOTAL</p>
                         </div>
                      </td>
                      <td className="px-8 py-10 text-right">
                         <div className="space-y-1">
                            <p className="text-[11px] font-black text-white/60 tracking-widest">₹{totals.tax.toLocaleString()}</p>
                            <p className="text-[7px] font-bold text-white/20 tracking-widest uppercase">TOTAL ESTIMATED TAX</p>
                         </div>
                      </td>
                      <td className="px-8 py-10 text-right">
                         <div className="space-y-1">
                            <p className="text-[11px] font-black text-white/60 tracking-widest">₹{totals.shipping.toLocaleString()}</p>
                            <p className="text-[7px] font-bold text-white/20 tracking-widest uppercase">TOTAL LOGISTICS</p>
                         </div>
                      </td>
                      <td className="px-8 py-10 text-right">
                         <div className="space-y-1">
                            <p className="text-[14px] font-black text-white glow-text tracking-widest">₹{totals.total.toLocaleString()}</p>
                            <p className="text-[7px] font-bold text-white/30 tracking-widest uppercase">GLOBAL VALUATION</p>
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
              <span className="text-[9px] tracking-[0.4em] uppercase font-bold">AUDIT_PROTOCOL: {sortBy.replace('-', '_').toUpperCase()}</span>
           </div>
           <p className="text-[8px] tracking-[0.2em] text-white/20 uppercase font-black italic text-center md:text-right">
              REVENUE DATA IS AGGREGATED FROM ALL CONFIRMED TRANSMISSION PACKETS. THIS VIEW PROVIDES DIRECT VISIBILITY INTO TAXES AND LOGISTICS FEES COLLECTED PER TRANSACTION.
           </p>
        </div>
      </div>
    </div>
  );
}
