'use client';

import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collectionGroup, query, limit, updateDoc, doc, orderBy } from 'firebase/firestore';
import { ShoppingBag, ChevronLeft, ShieldAlert, Hash, Info, Loader2, Zap, Search, X, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo, useEffect } from 'react';

export default function AdminOrdersPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  /**
   * ADMIN ORDER QUERY
   * Stabilized with useMemo to prevent redundant SDK re-subscriptions.
   */
  const allOrdersQuery = useMemoFirebase(() => {
    if (!db || !mounted || !isAdmin) return null;
    try {
      return query(
        collectionGroup(db, 'orders'), 
        orderBy('orderDate', 'desc'),
        limit(150)
      );
    } catch (e) {
      // Fallback if index is not ready
      return query(collectionGroup(db, 'orders'), limit(150));
    }
  }, [db, isAdmin, mounted]);

  const { data: rawOrders, isLoading, error: queryError } = useCollection(allOrdersQuery);

  const filteredOrders = useMemo(() => {
    if (!rawOrders) return [];
    
    let result = [...rawOrders];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(order => 
        (order.order_ID || '').toLowerCase().includes(search) ||
        (order.id || '').toLowerCase().includes(search) ||
        (order.displayName || '').toLowerCase().includes(search) ||
        (order.email || '').toLowerCase().includes(search) ||
        (order.transition_ID || '').toLowerCase().includes(search)
      );
    }

    // Secondary sort in case index is missing
    return result.sort((a, b) => 
      new Date(b.orderDate || 0).getTime() - new Date(a.orderDate || 0).getTime()
    );
  }, [rawOrders, searchTerm]);

  const handleStatusChange = async (orderId: string, userId: string, newStatus: string) => {
    if (!db || !userId) return;
    try {
      const orderRef = doc(db, 'users', userId, 'orders', orderId);
      await updateDoc(orderRef, { 
        shippingStatus: newStatus,
        updatedAt: new Date().toISOString()
      });
      toast({
        title: "ORDER UPDATED",
        description: `STATUS SET TO ${newStatus.toUpperCase()}.`,
      });
    } catch (e) {
      console.error('[STATUS_UPDATE_FAILURE]', e);
    }
  };

  if (isUserLoading || !mounted || isProfileLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-[10px] tracking-[1em] uppercase opacity-40 font-bold text-black">Verifying...</div>
      </div>
    );
  }

  if (!isAdmin && !isProfileLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-6 bg-background text-black">
        <p className="text-[10px] tracking-[1em] uppercase opacity-40 font-black">ACCESS DENIED</p>
        <Link href="/admin" className="text-[10px] tracking-widest border-b border-black/20 pb-2 uppercase">BACK</Link>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen text-black font-body">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="space-y-4">
            <Link href="/admin" className="flex items-center gap-2 text-[10px] text-black/60 hover:text-black transition-all hover:scale-105 uppercase tracking-widest mb-4 font-bold">
              <ChevronLeft className="w-3 h-3" />
              BACK TO SYSTEM
            </Link>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none font-headline">Orders</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild className="bg-black text-white hover:bg-black/90 rounded-none h-14 px-8 text-[10px] font-bold tracking-[0.4em] uppercase">
              <Link href="/admin/orders/new">
                <Plus className="w-4 h-4 mr-3" />
                NEW ORDER
              </Link>
            </Button>
          </div>
        </div>

        <div className="mb-12">
          <div className="relative max-w-xl group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 group-focus-within:text-black transition-colors" />
            <Input 
              placeholder="SEARCH ORDERS..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black/5 border-black/10 h-14 pl-12 pr-12 rounded-none text-[10px] tracking-[0.2em] focus-visible:ring-0 focus-visible:border-black/40 font-bold text-black uppercase transition-all"
            />
          </div>
        </div>

        <div className="bg-black/[0.01] border border-black/5 overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-black/5 bg-black/[0.02]">
                  <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-black/40">ORDER ID</th>
                  <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-black/40">PAYMENT ID</th>
                  <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-black/40">CUSTOMER</th>
                  <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-black/40">STATUS</th>
                  <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-black/40 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {isLoading ? (
                  [1, 2, 3].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-10 py-12 bg-black/[0.01]" />
                    </tr>
                  ))
                ) : filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-black/[0.02] transition-colors group">
                    <td className="px-10 py-8">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                           <Hash className="w-3 h-3 text-black/40" />
                           <span className="text-[10px] font-mono tracking-widest text-black font-black">{order.order_ID || order.id}</span>
                        </div>
                        <p className="text-[9px] text-black/60 uppercase tracking-[0.2em] font-bold">₹{order.totalAmount}</p>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                       <span className="text-[9px] font-mono text-black/40 uppercase truncate max-w-[150px] inline-block">{order.transition_ID || 'INTERNAL'}</span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="space-y-1">
                         <span className="text-[10px] text-black/80 tracking-widest font-bold uppercase">{order.displayName || 'CUSTOMER'}</span>
                         <p className="text-[8px] text-black/40 uppercase tracking-widest font-mono">{order.email}</p>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <Select 
                        defaultValue={order.shippingStatus || 'processing'} 
                        onValueChange={(val) => handleStatusChange(order.id, order.userId, val)}
                      >
                        <SelectTrigger className="w-40 bg-white border-black/10 rounded-none h-10 text-[9px] tracking-[0.2em] uppercase focus:ring-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-black/20 text-black rounded-none">
                          <SelectItem value="processing" className="text-[9px] uppercase">PROCESSING</SelectItem>
                          <SelectItem value="shipped" className="text-[9px] uppercase">SHIPPED</SelectItem>
                          <SelectItem value="delivered" className="text-[9px] uppercase text-green-600">DELIVERED</SelectItem>
                          <SelectItem value="cancelled" className="text-[9px] uppercase text-red-600">CANCELLED</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <Link href={`/admin/orders/${order.id}?user=${order.userId}`}>
                        <Button variant="ghost" size="icon" className="text-black/40 hover:text-black transition-all hover:scale-125 bg-transparent hover:bg-transparent">
                          <Info className="w-4 h-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
