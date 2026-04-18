
'use client';

import { useFirestore, useDoc, useMemoFirebase, useUser, useCollection } from '@/firebase';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import { ChevronLeft, User as UserIcon, Mail, Phone, MapPin, Package, Clock, ShieldAlert, ShieldCheck, ShoppingBag, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect, use } from 'react';
import { Button } from '@/components/ui/button';

export default function UserDossierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: userId } = use(params);
  const { user: currentUser } = useUser();
  const db = useFirestore();
  const isAdmin = currentUser?.email?.toLowerCase() === 'voidwear26@gmail.com';

  const userRef = useMemoFirebase(() => {
    if (!db || !userId) return null;
    return doc(db, 'users', userId);
  }, [db, userId]);

  const { data: entity, isLoading: isEntityLoading } = useDoc(userRef);

  const ordersQuery = useMemoFirebase(() => {
    if (!db || !userId) return null;
    return query(
      collection(db, 'users', userId, 'orders'),
      orderBy('createdAt', 'desc')
    );
  }, [db, userId]);

  const { data: orders, isLoading: isOrdersLoading } = useCollection(ordersQuery);

  if (!isAdmin) {
    return <div className="h-screen flex items-center justify-center opacity-20 text-[10px] tracking-[1em] uppercase">ACCESS DENIED</div>;
  }

  if (isEntityLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white/20" />
      </div>
    );
  }

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="space-y-4 mb-16">
          <Link href="/admin/users" className="flex items-center gap-2 text-[10px] text-white/20 hover:text-white transition-colors uppercase tracking-widest mb-4 font-bold">
            <ChevronLeft className="w-3 h-3" />
            BACK TO ENTITIES
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tight glow-text uppercase leading-none">Entity Dossier</h1>
              <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">ENTITY_UID: {userId}</p>
            </div>
            <div className={`px-6 py-2 border text-[10px] tracking-[0.3em] font-bold uppercase ${
              entity?.isBlocked ? 'border-red-500/50 text-red-500' : 'border-green-500/50 text-green-500'
            }`}>
              {entity?.isBlocked ? 'ACCESS SEVERED' : 'UPLINK ACTIVE'}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="space-y-12">
            <div className="bg-white/[0.02] border border-white/5 p-10 space-y-8">
              <h3 className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase border-b border-white/5 pb-4">CORE IDENTITY</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/5 border border-white/10 flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-white/40" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[14px] font-black tracking-widest uppercase text-white">{entity?.displayName || 'OPERATOR'}</p>
                    <p className="text-[9px] text-white/40 tracking-widest uppercase font-mono">INITIALIZED: {entity?.createdAt ? new Date(entity.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
                
                <div className="space-y-4 pt-6 border-t border-white/5">
                  <div className="flex items-center gap-3 text-[10px] text-white/60 tracking-widest uppercase font-bold">
                    <Mail className="w-4 h-4 text-white/20" />
                    {entity?.email || 'N/A'}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-white/60 tracking-widest uppercase font-bold">
                    <Phone className="w-4 h-4 text-white/20" />
                    {entity?.mobileNumber || 'NOT PROVIDED'}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-10 space-y-6">
               <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-3 text-white/40">
                    <MapPin className="w-4 h-4" />
                    <span className="text-[10px] font-bold tracking-widest uppercase">LOGISTICAL NODE</span>
                  </div>
               </div>
               <div className="space-y-3">
                  <p className="text-[12px] text-white tracking-widest uppercase font-black">
                    {entity?.addressLine1 || 'NO PRIMARY ADDRESS'}
                  </p>
                  <p className="text-[10px] text-white/40 tracking-widest uppercase font-bold">
                    {entity?.city || 'UNKNOWN'}, {entity?.stateProvince || 'N/A'} {entity?.postalCode || ''}
                  </p>
                  {entity?.landmark && (
                    <p className="text-[9px] text-white/20 tracking-widest uppercase">LANDMARK: {entity.landmark}</p>
                  )}
               </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-12">
            <div className="bg-white/[0.02] border border-white/5 p-10 space-y-8">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">MISSION LOGS (ORDERS)</h3>
                <span className="text-[10px] font-bold tracking-widest text-white/20">{orders?.length || 0} TRANSMISSIONS</span>
              </div>

              {isOrdersLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-white/20" />
                </div>
              ) : orders && orders.length > 0 ? (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-6 border border-white/5 bg-white/[0.01] hover:bg-white/5 transition-all group">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Package className="w-3.5 h-3.5 text-white/20" />
                          <p className="text-[10px] font-mono tracking-widest uppercase text-white">{order.id.slice(0, 16)}</p>
                          <span className={`text-[8px] px-2 py-0.5 border tracking-[0.2em] uppercase font-bold ${
                            order.shippingStatus === 'delivered' ? 'border-green-500/50 text-green-500' : 'border-white/10 text-white/40'
                          }`}>
                            {order.shippingStatus || 'processing'}
                          </span>
                        </div>
                        <p className="text-[9px] text-white/20 tracking-widest uppercase font-bold">₹{order.totalAmount} // {new Date(order.orderDate).toLocaleDateString()}</p>
                      </div>
                      <Link href={`/admin/orders/${order.id}?user=${userId}`}>
                        <Button variant="ghost" size="icon" className="text-white/20 hover:text-white">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center gap-6 opacity-20">
                  <ShoppingBag className="w-12 h-12 stroke-[0.5px]" />
                  <p className="text-[10px] tracking-[1em] uppercase font-bold">NO MISSION DATA FOUND</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
