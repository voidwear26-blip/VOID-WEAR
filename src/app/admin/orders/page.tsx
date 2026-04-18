
'use client';

import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collectionGroup, query, orderBy, limit, updateDoc, doc } from 'firebase/firestore';
import { ShoppingBag, ChevronLeft, ExternalLink, ShieldAlert, Clock, Info } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function AdminOrdersPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const isAdmin = user?.email?.toLowerCase() === 'voidwear26@gmail.com';

  const allOrdersQuery = useMemoFirebase(() => {
    if (!db || !isAdmin) return null;
    return query(
      collectionGroup(db, 'orders'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
  }, [db, isAdmin]);

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
      console.error(e);
    }
  };

  const handleTrackingUpdate = async (orderId: string, userId: string, trackingId: string) => {
    if (!db) return;
    setUpdatingId(orderId);
    try {
      const orderRef = doc(db, 'users', userId, 'orders', orderId);
      await updateDoc(orderRef, { 
        trackingId,
        updatedAt: new Date().toISOString()
      });
      toast({
        title: "TRACKING SYNCED",
        description: `LINKED TRACKING ID ${trackingId}.`,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="h-screen flex items-center justify-center text-[10px] tracking-[1em] uppercase opacity-20">
        Authenticating Protocol...
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
            <h1 className="text-4xl md:text-5xl font-black tracking-tight glow-text uppercase leading-none">Transmissions</h1>
          </div>
          <div className="bg-white/5 px-6 py-4 border border-white/10 flex items-center gap-4 backdrop-blur-md">
            <ShieldAlert className="w-4 h-4 text-white/40" />
            <span className="text-[10px] tracking-[0.3em] font-bold text-white/40 uppercase">LOGISTICS MODULE ACTIVE</span>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">ORDER_DATA</th>
                  <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">ENTITY</th>
                  <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">FULFILLMENT</th>
                  <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">TRACKING_ID</th>
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
                ) : orders && orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-10 py-8">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono tracking-widest text-white/80">{order.orderNumber || order.id.slice(0, 16)}</span>
                          <p className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-bold">₹{order.totalAmount}</p>
                          <p className="text-[8px] text-white/20 uppercase tracking-[0.1em]">{new Date(order.orderDate).toLocaleDateString()}</p>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="space-y-1">
                           <span className="text-[10px] text-white/80 tracking-widest font-bold uppercase">{order.userId.slice(0, 12)}</span>
                           <p className="text-[8px] text-white/20 uppercase tracking-widest">{order.paymentMethod}</p>
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
                          <SelectContent className="bg-black border-white/10 text-white rounded-none">
                            <SelectItem value="processing" className="text-[9px] tracking-widest uppercase">PROCESSING</SelectItem>
                            <SelectItem value="shipped" className="text-[9px] tracking-widest uppercase">SHIPPED</SelectItem>
                            <SelectItem value="delivered" className="text-[9px] tracking-widest uppercase">DELIVERED</SelectItem>
                            <SelectItem value="cancelled" className="text-[9px] tracking-widest uppercase text-red-500">CANCELLED</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-3">
                          <Input 
                            placeholder="TRACKING #"
                            defaultValue={order.trackingId || ''}
                            onBlur={(e) => handleTrackingUpdate(order.id, order.userId, e.target.value)}
                            className="bg-black/40 border-white/10 rounded-none h-10 w-48 text-[9px] font-mono tracking-widest uppercase focus:border-white/40"
                          />
                          {updatingId === order.id && <Clock className="w-3 h-3 animate-spin text-white/20" />}
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <Link href={`/admin/orders/${order.id}?user=${order.userId}`}>
                          <Button variant="ghost" size="icon" className="text-white/20 hover:text-white transition-colors">
                            <Info className="w-4 h-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-10 py-32 text-center opacity-20">
                      <div className="flex flex-col items-center gap-6">
                        <ShoppingBag className="w-12 h-12 stroke-[0.5px]" />
                        <p className="text-[10px] tracking-[1em] uppercase font-bold">NO SYSTEM LOGS FOUND</p>
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
