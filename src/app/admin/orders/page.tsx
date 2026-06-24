
'use client';

import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collectionGroup, query, limit, updateDoc, doc } from 'firebase/firestore';
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
    if (isUserLoading || !user) return false;
    return user.email?.toLowerCase() === 'voidwear26@gmail.com' || 
           user.uid === 'A9vsqn10oddfmouKiKjWpTcFqZB2' ||
           profile?.role === 'ADMIN';
  }, [user, isUserLoading, profile]);

  const allOrdersQuery = useMemoFirebase(() => {
    if (!db || !mounted || !isAdmin) return null;
    try {
      return query(collectionGroup(db, 'orders'), limit(150));
    } catch (e) {
      console.error('[AdminOrdersPage] QUERY_INIT_FAILURE:', e);
      return null;
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
        (order.transition_ID || '').toLowerCase().includes(search) ||
        (order.paymentProviderId || '').toLowerCase().includes(search)
      );
    }

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
        title: "LOGISTICS UPDATED",
        description: `ORDER STATUS SET TO ${newStatus.toUpperCase()}.`,
      });
    } catch (e) {
      console.error('[STATUS_UPDATE_FAILURE]', e);
      toast({
        variant: "destructive",
        title: "UPLINK FAILURE",
        description: "COULD NOT UPDATE STATUS NODE.",
      });
    }
  };

  if (isUserLoading || !mounted || isProfileLoading) {
    return (
      <div className="h-screen flex items-center justify-center text-[10px] tracking-[1em] uppercase opacity-40 font-bold text-white bg-black">
        Authenticating Protocol...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-6 bg-black text-white">
        <p className="text-[10px] tracking-[1em] uppercase opacity-40 font-black">ACCESS DENIED // MASTER ONLY</p>
        <Link href="/admin" className="text-[10px] tracking-widest border-b border-white/20 pb-2">RETURN TO CENTER</Link>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen text-white">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="space-y-4">
            <Link href="/admin" className="flex items-center gap-2 text-[10px] text-white/80 hover:text-white transition-colors uppercase tracking-widest mb-4 font-bold">
              <ChevronLeft className="w-3 h-3" />
              BACK TO SYSTEM
            </Link>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight glow-text uppercase leading-none text-white">Transmissions</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild className="bg-white text-black hover:bg-white/90 rounded-none h-14 px-8 text-[10px] font-bold tracking-[0.4em] uppercase shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <Link href="/admin/orders/new">
                <Plus className="w-4 h-4 mr-3" />
                NEW TRANSMISSION
              </Link>
            </Button>
            <div className="bg-white/5 px-6 py-4 border border-white/10 flex items-center gap-4 backdrop-blur-md hidden md:flex">
              <ShieldAlert className="w-4 h-4 text-white/60" />
              <span className="text-[10px] tracking-[0.3em] font-bold text-white/60 uppercase">LOGISTICS MODULE ACTIVE</span>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <div className="relative max-w-xl group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-white transition-colors" />
            <Input 
              placeholder="SEARCH BY ORDER_ID, ENTITY, EMAIL OR TRANS_ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border-white/10 h-14 pl-12 pr-12 rounded-none text-[10px] tracking-[0.2em] focus-visible:ring-0 focus-visible:border-white/40 font-bold text-white uppercase placeholder:text-white/20 transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {queryError && (
          <div className="mb-12 p-10 border border-red-500/20 bg-red-500/5 backdrop-blur-xl">
             <div className="flex items-center gap-4 text-red-500 mb-4">
                <ShieldAlert className="w-5 h-5" />
                <span className="text-[10px] font-black tracking-widest uppercase">UPLINK_PERMISSIONS_DENIED</span>
             </div>
             <p className="text-[9px] text-white/40 tracking-[0.2em] leading-relaxed uppercase max-w-2xl">
                THE SECURITY LAYER HAS REJECTED THE GLOBAL AUDIT REQUEST. ENSURE YOUR MASTER IDENTITY IS LINKED AND PROFILE ROLE IS SYNCED.
             </p>
          </div>
        )}

        <div className="bg-white/[0.02] border border-white/5 overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/60">ORDER_UID (LOGISTICS)</th>
                  <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/60">TRANSITION_ID (PAYMENT)</th>
                  <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/60">ENTITY</th>
                  <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/60">FULFILLMENT</th>
                  <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/60 text-right">COMMANDS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(isLoading || isProfileLoading) ? (
                  [1, 2, 3].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-10 py-12 bg-white/[0.01]" />
                    </tr>
                  ))
                ) : filteredOrders && filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-10 py-8">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                             <Hash className="w-3 h-3 text-white/40" />
                             <span className="text-[10px] font-mono tracking-widest text-white font-black">{order.order_ID || order.id}</span>
                          </div>
                          <p className="text-[9px] text-white/60 uppercase tracking-[0.2em] font-bold">₹{order.totalAmount}</p>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                         <div className="flex items-center gap-2 text-[9px] font-mono text-white/40 uppercase truncate max-w-[200px]">
                            <Zap className="w-3 h-3 text-white/20" />
                            {order.transition_ID || order.paymentProviderId || 'INTERNAL'}
                         </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="space-y-1">
                           <span className="text-[10px] text-white/80 tracking-widest font-bold uppercase">{order.displayName || order.userId?.slice(0, 12)}</span>
                           <p className="text-[8px] text-white/40 uppercase tracking-widest font-mono">{order.email}</p>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <Select 
                          defaultValue={order.shippingStatus || 'processing'} 
                          onValueChange={(val) => handleStatusChange(order.id, order.userId, val)}
                        >
                          <SelectTrigger className="w-40 bg-black/40 border-white/10 rounded-none h-10 text-[9px] tracking-[0.2em] uppercase focus:ring-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-black border-white/20 text-white rounded-none">
                            <SelectItem value="processing" className="text-[9px] tracking-widest uppercase">PROCESSING</SelectItem>
                            <SelectItem value="shipped" className="text-[9px] tracking-widest uppercase">SHIPPED</SelectItem>
                            <SelectItem value="delivered" className="text-[9px] tracking-widest uppercase text-green-500">DELIVERED</SelectItem>
                            <SelectItem value="cancelled" className="text-[9px] tracking-widest uppercase text-red-500">CANCELLED</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <Link href={`/admin/orders/${order.id}?user=${order.userId}`}>
                          <Button variant="ghost" size="icon" className="text-white/40 hover:text-white transition-colors">
                            <Info className="w-4 h-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-10 py-32 text-center opacity-40">
                      <div className="flex flex-col items-center gap-6">
                        <ShoppingBag className="w-12 h-12 stroke-[0.5px] text-white" />
                        <p className="text-[10px] tracking-[1em] uppercase font-bold text-white">
                          {searchTerm ? 'NO TRANSMISSIONS MATCH YOUR SEARCH' : 'NO SYSTEM LOGS FOUND'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
