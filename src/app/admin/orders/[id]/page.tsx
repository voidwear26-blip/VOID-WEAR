'use client';

import { useFirestore, useDoc, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { ChevronLeft, ShoppingBag, User as UserIcon, Calendar, CreditCard, Truck, Package, Loader2, Phone, Mail, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function OrderDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.id as string;
  const userId = searchParams.get('user');
  
  const { user: currentUser } = useUser();
  const db = useFirestore();
  const isAdmin = currentUser?.email?.toLowerCase() === 'voidwear26@gmail.com';

  const orderRef = useMemoFirebase(() => {
    if (!db || !userId || !orderId) return null;
    return doc(db, 'users', userId, 'orders', orderId);
  }, [db, userId, orderId]);

  const { data: order, isLoading } = useDoc(orderRef);

  const entityRef = useMemoFirebase(() => {
    if (!db || !userId) return null;
    return doc(db, 'users', userId);
  }, [db, userId]);

  const { data: entity } = useDoc(entityRef);

  if (!isAdmin) {
    return <div className="h-screen flex items-center justify-center opacity-20 text-[10px] tracking-[1em] uppercase">Authenticating...</div>;
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white/20" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-6">
        <p className="text-[10px] tracking-[1em] uppercase text-white/20">TRANSMISSION LOG NOT FOUND</p>
        <Link href="/admin/orders" className="text-[10px] tracking-widest text-white border-b border-white pb-2 font-bold uppercase">Back to System</Link>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="space-y-4 mb-16">
          <Link href="/admin/orders" className="flex items-center gap-2 text-[10px] text-white/20 hover:text-white transition-colors uppercase tracking-widest mb-4 font-bold">
            <ChevronLeft className="w-3 h-3" />
            BACK TO TRANSMISSIONS
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tight glow-text uppercase leading-none">Transmission Detail</h1>
              <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">ORDER_UID: {orderId}</p>
            </div>
            <div className={`px-6 py-2 border text-[10px] tracking-[0.3em] font-bold uppercase ${
              order.shippingStatus === 'delivered' ? 'border-green-500/50 text-green-500' : 'border-white/10 text-white/40'
            }`}>
              {order.shippingStatus?.toUpperCase() || 'PROCESSING'}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <div className="bg-white/[0.02] border border-white/5 p-10 space-y-8">
              <h3 className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase border-b border-white/5 pb-4">MODULES IN TRANSMISSION</h3>
              {order.items && order.items.length > 0 ? (
                <div className="space-y-6">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between group">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-16 bg-white/5 border border-white/10 flex items-center justify-center">
                          <Package className="w-5 h-5 text-white/20" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[11px] font-bold tracking-widest uppercase">{item.name || 'ASSEMBLAGE MODULE'}</p>
                          <p className="text-[9px] text-white/40 tracking-widest uppercase">SIZE: {item.size || 'N/A'} // QTY: {item.quantity || 1}</p>
                        </div>
                      </div>
                      <p className="text-[11px] font-bold tracking-widest">₹{item.price || 0}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 flex flex-col items-center gap-4 opacity-20">
                  <Package className="w-8 h-8 stroke-[0.5px]" />
                  <p className="text-[10px] tracking-widest uppercase">AGGREGATED TRANSACTION LOG</p>
                </div>
              )}
              
              <div className="pt-8 border-t border-white/5 flex justify-between items-center">
                <span className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">TOTAL VALUE</span>
                <span className="text-2xl font-black tracking-tight glow-text">₹{order.totalAmount}</span>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-10 space-y-8">
              <h3 className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase border-b border-white/5 pb-4">LOGISTICS & TRACKING</h3>
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-2">
                  <p className="text-[9px] font-bold tracking-widest text-white/20 uppercase">TRACKING IDENTIFIER</p>
                  <p className="text-[11px] font-mono tracking-widest uppercase text-white">{order.trackingId || 'UNASSIGNED'}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[9px] font-bold tracking-widest text-white/20 uppercase">PAYMENT CHANNEL</p>
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-4 h-4 text-white/40" />
                    <p className="text-[11px] font-bold tracking-widest uppercase text-white">{order.paymentMethod || 'RAZORPAY GATEWAY'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-12">
            <div className="bg-white/[0.02] border border-white/5 p-10 space-y-8">
              <h3 className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase border-b border-white/5 pb-4">ENTITY DOSSIER</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-white/40" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[12px] font-black tracking-widest uppercase text-white">{entity?.displayName || 'OPERATOR'}</p>
                    <p className="text-[9px] text-white/40 tracking-widest uppercase font-mono">{userId?.slice(0, 16)}...</p>
                  </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-3 text-[10px] text-white/60 tracking-widest uppercase">
                    <Mail className="w-3.5 h-3.5 text-white/20" />
                    {entity?.email || 'N/A'}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-white/60 tracking-widest uppercase">
                    <Phone className="w-3.5 h-3.5 text-white/20" />
                    {entity?.mobileNumber || 'NOT PROVIDED'}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-white/60 tracking-widest uppercase">
                    <Calendar className="w-3.5 h-3.5 text-white/20" />
                    INITIALIZED: {new Date(order.orderDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-10 space-y-6">
               <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-3 text-white/40">
                    <MapPin className="w-4 h-4" />
                    <span className="text-[10px] font-bold tracking-widest uppercase">DESTINATION NODE</span>
                  </div>
               </div>
               <div className="space-y-2">
                  <p className="text-[11px] text-white tracking-widest uppercase font-bold">
                    {entity?.addressLine1 || 'NO ADDRESS LOGGED'}
                  </p>
                  <p className="text-[10px] text-white/40 tracking-widest uppercase">
                    {entity?.city || 'UNKNOWN'}, {entity?.stateProvince || 'N/A'} {entity?.postalCode || ''}
                  </p>
                  <div className="pt-4 flex items-center gap-3 text-[9px] text-white/20 tracking-widest uppercase font-bold">
                    <Truck className="w-3.5 h-3.5" />
                    DELIVERY PROTOCOL: STANDARD ORBITAL
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
