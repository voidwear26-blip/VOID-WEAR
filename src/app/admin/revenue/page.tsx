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
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-black/20" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen text-black">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="space-y-4 mb-16">
          <Link href="/admin" className="flex items-center gap-2 text-[10px] text-black/60 hover:text-black transition-colors uppercase tracking-widest mb-4 font-bold">
            <ChevronLeft className="w-3 h-3" />
            BACK TO DASHBOARD
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none font-headline">Revenue Data</h1>
              <p className="text-[10px] font-bold tracking-[0.4em] text-black/60 uppercase">System Sales Audit</p>
            </div>
            <div className="bg-black/5 border border-black/10 px-8 py-4 flex flex-col items-end gap-1 backdrop-blur-md">
               <span className="text-[9px] tracking-[0.3em] font-bold text-black/60 uppercase">TOTAL REVENUE</span>
               <span className="text-3xl font-black">₹{totals.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
           <div className="space-y-2">
              <label className="text-[8px] font-bold tracking-[0.3em] text-black/60 uppercase pl-1">START DATE</label>
              <Input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-black/5 border-black/10 h-12 rounded-none text-[10px] tracking-widest text-black uppercase focus:border-black/40"
              />
           </div>
           <div className="space-y-2">
              <label className="text-[8px] font-bold tracking-[0.3em] text-black/60 uppercase pl-1">END DATE</label>
              <Input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-black/5 border-black/10 h-12 rounded-none text-[10px] tracking-widest text-black uppercase focus:border-black/40"
              />
           </div>
           <div className="space-y-2 md:col-span-2">
              <label className="text-[8px] font-bold tracking-[0.3em] text-black/60 uppercase pl-1">SORT BY</label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as RevenueSortOption)}>
                <SelectTrigger className="bg-black/5 border-black/10 h-12 rounded-none text-[10px] tracking-widest text-black uppercase focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-black/20 text-black rounded-none">
                  <SelectItem value="date-newest" className="text-[10px] tracking-widest uppercase">RECENT ORDERS</SelectItem>
                  <SelectItem value="total-desc" className="text-[10px] tracking-widest uppercase">VALUE: HIGH TO LOW</SelectItem>
                  <SelectItem value="total-asc" className="text-[10px] tracking-widest uppercase">VALUE: LOW TO HIGH</SelectItem>
                  <SelectItem value="tax-desc" className="text-[10px] tracking-widest uppercase">HIGHEST TAX</SelectItem>
                  <SelectItem value="shipping-desc" className="text-[10px] tracking-widest uppercase">HIGHEST SHIPPING</SelectItem>
                </SelectContent>
              </Select>
           </div>
        </div>

        <div className="bg-black/[0.01] border border-black/5 overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-black/5 bg-black/[0.02]">
                  <th className="px-8 py-8 text-[10px] font-bold tracking-[0.3em] uppercase text-black/60">ORDER ID</th>
                  <th className="px-8 py-8 text-[10px] font-bold tracking-[0.3em] uppercase text-black/60">CUSTOMER</th>
                  <th className="px-8 py-8 text-[10px] font-bold tracking-[0.3em] uppercase text-black/60 text-right">SUBTOTAL</th>
                  <th className="px-8 py-8 text-[10px] font-bold tracking-[0.3em] uppercase text-black/60 text-right">TAX</th>
                  <th className="px-8 py-8 text-[10px] font-bold tracking-[0.3em] uppercase text-black/60 text-right">SHIPPING</th>
                  <th className="px-8 py-8 text-[10px] font-bold tracking-[0.3em] uppercase text-black/60 text-right">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {(isLoading || isProfileLoading) ? (
                  [1, 2, 3, 4, 5].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-8 py-12 bg-black/[0.01]" />
                    </tr>
                  ))
                ) : processedOrders.length > 0 ? (
                  processedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-black/[0.02] transition-colors group">
                      <td className="px-8 py-8">
                        <div className="flex items-center gap-4">
                           <Hash className="w-3.5 h-3.5 text-black/20" />
                           <div className="space-y-1">
                              <span className="text-[10px] font-mono tracking-widest text-black font-black">{order.order_ID || order.id}</span>
                              <p className="text-[8px] text-black/60 tracking-widest uppercase">{new Date(order.orderDate).toLocaleDateString()}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex items-center gap-3">
                           <UserIcon className="w-3 h-3 text-black/40" />
                           <div className="space-y-0.5">
                              <p className="text-[10px] font-black tracking-widest text-black/80 uppercase">{order.displayName || 'CUSTOMER'}</p>
                              <p className="text-[8px] font-mono text-black/40">{order.email}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-8 text-right">
                         <span className="text-[10px] font-mono tracking-widest text-black/60">₹{(Number(order.subtotal) || 0).toLocaleString()}</span>
                      </td>
                      <td className="px-8 py-8 text-right">
                         <span className="text-[10px] font-mono tracking-widest text-black/60">₹{(Number(order.taxAmount) || 0).toLocaleString()}</span>
                      </td>
                      <td className="px-8 py-8 text-right">
                         <span className={`text-[10px] font-mono tracking-widest ${Number(order.shippingFee) === 0 ? 'text-green-600' : 'text-black/60'}`}>
                           {Number(order.shippingFee) === 0 ? 'FREE' : `₹${(Number(order.shippingFee) || 0).toLocaleString()}`}
                         </span>
                      </td>
                      <td className="px-8 py-8 text-right">
                         <span className="text-[11px] font-black tracking-widest text-black">₹{(Number(order.totalAmount) || 0).toLocaleString()}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-32 text-center opacity-40">
                      <div className="flex flex-col items-center gap-6">
                        <TrendingUp className="w-12 h-12 stroke-[0.5px]" />
                        <p className="text-[10px] tracking-[1em] uppercase font-bold">NO SALES DATA FOUND</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
              {!isLoading && !isProfileLoading && processedOrders.length > 0 && (
                <tfoot className="border-t border-black/10 bg-black/[0.03]">
                   <tr>
                      <td colSpan={2} className="px-8 py-10">
                         <div className="flex items-center gap-4">
                            <Info className="w-4 h-4 text-black/40" />
                            <div className="space-y-1">
                               <p className="text-[10px] font-black tracking-[0.4em] text-black uppercase">SYSTEM TOTALS</p>
                               <p className="text-[8px] text-black/60 tracking-[0.2em] uppercase font-bold">{processedOrders.length} ORDERS ANALYZED</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-10 text-right">
                         <div className="space-y-1">
                            <p className="text-[11px] font-black text-black/80 tracking-widest">₹{totals.subtotal.toLocaleString()}</p>
                            <p className="text-[7px] font-bold text-black/40 tracking-widest uppercase">SUBTOTAL</p>
                         </div>
                      </td>
                      <td className="px-8 py-10 text-right">
                         <div className="space-y-1">
                            <p className="text-[11px] font-black text-black/80 tracking-widest">₹{totals.tax.toLocaleString()}</p>
                            <p className="text-[7px] font-bold text-black/40 tracking-widest uppercase">TOTAL TAX</p>
                         </div>
                      </td>
                      <td className="px-8 py-10 text-right">
                         <div className="space-y-1">
                            <p className="text-[11px] font-black text-black/80 tracking-widest">₹{totals.shipping.toLocaleString()}</p>
                            <p className="text-[7px] font-bold text-black/40 tracking-widest uppercase">TOTAL SHIPPING</p>
                         </div>
                      </td>
                      <td className="px-8 py-10 text-right">
                         <div className="space-y-1">
                            <p className="text-[14px] font-black text-black tracking-widest">₹{totals.total.toLocaleString()}</p>
                            <p className="text-[7px] font-bold text-black/60 tracking-widest uppercase">GRAND TOTAL</p>
                         </div>
                      </td>
                   </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
