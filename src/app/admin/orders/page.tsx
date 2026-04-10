
'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collectionGroup, query, orderBy, limit } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { ShoppingBag, ChevronLeft, ExternalLink, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function AdminOrdersPage() {
  const db = useFirestore();

  // Use collectionGroup to fetch all orders across all users
  const allOrdersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collectionGroup(db, 'orders'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
  }, [db]);

  const { data: orders, isLoading } = useCollection(allOrdersQuery);

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="space-y-4">
            <Link href="/admin" className="flex items-center gap-2 text-[10px] text-white/20 hover:text-white transition-colors uppercase tracking-widest mb-4">
              <ChevronLeft className="w-3 h-3" />
              BACK TO SYSTEM
            </Link>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight glow-text uppercase">Transmissions</h1>
          </div>
          <div className="bg-white/5 px-6 py-4 border border-white/10 flex items-center gap-4">
            <ShieldAlert className="w-4 h-4 text-white/40" />
            <span className="text-[10px] tracking-[0.3em] font-bold text-white/40 uppercase">MONITORING ACTIVE</span>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">ORDER_ID</th>
                  <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">DATE</th>
                  <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">USER_UID</th>
                  <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">AMOUNT</th>
                  <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">STATUS</th>
                  <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/40 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  [1, 2, 3].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-10 py-8 bg-white/[0.01]" />
                    </tr>
                  ))
                ) : orders && orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-10 py-6">
                        <span className="text-[10px] font-mono tracking-widest">{order.id.slice(0, 16)}...</span>
                      </td>
                      <td className="px-10 py-6 text-[10px] text-white/40 tracking-widest">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </td>
                      <td className="px-10 py-6">
                        <span className="text-[10px] text-white/40 font-mono">{order.userId.slice(0, 8)}...</span>
                      </td>
                      <td className="px-10 py-6 text-[10px] font-bold tracking-widest">
                        ${order.totalAmount}
                      </td>
                      <td className="px-10 py-6">
                        <span className="text-[9px] bg-white/10 px-3 py-1 border border-white/5 tracking-[0.2em] uppercase">
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <button className="text-white/20 hover:text-white transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-10 py-32 text-center opacity-20">
                      <div className="flex flex-col items-center gap-6">
                        <ShoppingBag className="w-12 h-12 stroke-[0.5px]" />
                        <p className="text-[10px] tracking-[1em] uppercase">NO SYSTEM LOGS FOUND</p>
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
