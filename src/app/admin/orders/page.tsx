'use client';

import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collectionGroup, query, orderBy, limit, updateDoc, doc } from 'firebase/firestore';
import { ShoppingBag, ChevronLeft, ShieldAlert, Hash, Info, Loader2, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function AdminOrdersPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const isAdmin = !isUserLoading && (
    user?.email?.toLowerCase() === 'voidwear26@gmail.com' || 
    user?.uid === 'A9vsqn10oddfmouKiKjWpTcFqZB2'
  );

  const allOrdersQuery = useMemoFirebase(() => {
    // CRITICAL: Ensure admin identity is stabilized before initiating transmission audit
    if (!db || !user?.uid || !isAdmin) return null;
    return query(
      collectionGroup(db, 'orders'),
      orderBy('orderDate', 'desc'),
      limit(100)
    );
  }, [db, user?.uid, isAdmin]);

  const { data: orders, isLoading } = useCollection(allOrdersQuery);

  const handleStatusChange = async (orderId: string, userId: string, newStatus: string) => {
    if (!db) return;
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
    }
  };

  if (isUserLoading) {
    return (
      <div className="h-screen flex items-center justify-center text-[10px] tracking-[1em] uppercase opacity-40 font-bold text-white">
        Authenticating Protocol...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="h-screen flex items-center justify-center text-[10px] tracking-[1em] uppercase opacity-40 text-white font-bold">
        ACCESS DENIED // MASTER ONLY
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
            <h1 className="text-4xl md:text-5xl font-black tracking-tight glow-text uppercase leading-none">Transmissions</h1>
          </div>
          <div className="bg-white/5 px-6 py-4 border border-white/10 flex items-center gap-4 backdrop-blur-md">
            <ShieldAlert className="w-4 h-4 text-white/60" />
            <span className="text-[10px] tracking-[0.3em] font-bold text-white/60 uppercase">LOGISTICS MODULE ACTIVE</span>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/60">ORDER_UID</th>
                  <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/60">TRANSITION_ID (VERIFY)</th>
                  <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/60">ENTITY</th>
                  <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/60">FULFILLMENT</th>
                  <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/60 text-right">COMMANDS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  [1, 2, 3].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-10 py-12 bg-white/[0.01]" />
                    </tr>
                  ))
                ) : orders && orders.length > 0 ? (
                  orders.map((order) => (
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
                           <span className="text-[10px] text-white/80 tracking-widest font-bold uppercase">{order.displayName || order.userId.slice(0, 12)}</span>
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
                        <p className="text-[10px] tracking-[1em] uppercase font-bold text-white">NO SYSTEM LOGS FOUND</p>
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