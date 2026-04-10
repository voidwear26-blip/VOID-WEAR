
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Package, Clock, ShieldCheck, ArrowRight, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const ordersQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'orders'),
      orderBy('createdAt', 'desc')
    );
  }, [db, user]);

  const { data: orders, isLoading: isOrdersLoading } = useCollection(ordersQuery);

  if (isUserLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-[10px] tracking-[1em] animate-pulse">SYNCING PROFILE...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-8">
        <h2 className="text-xl font-bold tracking-[0.5em] glow-text">ACCESS DENIED</h2>
        <p className="text-[10px] text-white/40 tracking-[0.3em]">PLEASE INITIALIZE AUTHENTICATION</p>
        <Link href="/login">
          <button className="px-12 py-4 border border-white/20 text-[10px] tracking-[0.5em] hover:bg-white hover:text-black transition-all">
            LOGIN
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-48 pb-32 bg-transparent min-h-screen">
      <div className="container mx-auto px-10">
        <div className="grid lg:grid-cols-3 gap-24">
          {/* User Info */}
          <div className="space-y-12">
            <div className="space-y-6">
              <span className="text-[10px] font-bold tracking-[0.8em] text-white/20 uppercase">ENTITY // PROFILE</span>
              <h1 className="text-4xl font-black tracking-tight glow-text uppercase leading-none">
                {user.email?.split('@')[0]}
              </h1>
              <p className="text-white/40 tracking-[0.2em] text-[10px] uppercase">
                UID: {user.uid.slice(0, 12)}...
              </p>
            </div>

            <div className="p-8 border border-white/5 bg-white/[0.02] space-y-6">
              <div className="flex items-center gap-4 text-white/40">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[9px] tracking-[0.3em] uppercase">Security Level: Standard</span>
              </div>
              <div className="flex items-center gap-4 text-white/40">
                <Clock className="w-4 h-4" />
                <span className="text-[9px] tracking-[0.3em] uppercase">Member Since: 2024</span>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="lg:col-span-2 space-y-12">
            <div className="flex items-center justify-between border-b border-white/5 pb-8">
              <h2 className="text-xs font-bold tracking-[0.5em] uppercase">TRANSMISSION HISTORY</h2>
              <span className="text-[10px] text-white/20">{orders?.length || 0} ITEMS</span>
            </div>

            <div className="space-y-6">
              {isOrdersLoading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="h-32 bg-white/[0.02] animate-pulse border border-white/5" />
                  ))}
                </div>
              ) : orders && orders.length > 0 ? (
                orders.map((order) => (
                  <motion.div 
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all p-10 flex flex-col md:flex-row md:items-center justify-between gap-8"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Package className="w-4 h-4 text-white/40" />
                        <span className="text-[10px] font-bold tracking-widest uppercase">{order.orderNumber}</span>
                      </div>
                      <div className="text-[9px] text-white/40 tracking-widest uppercase">
                        INITIALIZED: {new Date(order.orderDate).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-12">
                      <div className="text-right">
                        <div className="text-[10px] font-bold tracking-widest">${order.totalAmount}</div>
                        <div className="text-[8px] text-white/20 tracking-widest uppercase mt-1">
                          {order.paymentStatus}
                        </div>
                      </div>
                      <div className="w-px h-10 bg-white/5 hidden md:block" />
                      <div className="flex items-center gap-3 text-white/40 group-hover:text-white transition-colors">
                        <span className="text-[9px] tracking-widest uppercase">DETAILS</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-32 flex flex-col items-center justify-center space-y-8 opacity-20 border border-dashed border-white/10">
                  <ShoppingBag className="w-12 h-12 stroke-[0.5px]" />
                  <p className="text-[10px] tracking-[1em]">NO TRANSMISSIONS LOGGED</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
