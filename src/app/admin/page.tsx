
'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, collectionGroup } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Package, ShoppingBag, Users, Zap, ArrowUpRight, DollarSign, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

export default function AdminDashboard() {
  const db = useFirestore();

  // Fetch all orders for analytics
  const ordersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collectionGroup(db, 'orders');
  }, [db]);

  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'products');
  }, [db]);

  const { data: orders, isLoading: ordersLoading } = useCollection(ordersQuery);
  const { data: products, isLoading: productsLoading } = useCollection(productsQuery);

  const stats = useMemo(() => {
    if (!orders) return { totalSales: 0, orderCount: 0 };
    const totalSales = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);
    return { totalSales, orderCount: orders.length };
  }, [orders]);

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <span className="text-[10px] font-bold tracking-[0.8em] text-white/20 uppercase">SYSTEM COMMAND // DASHBOARD</span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight glow-text uppercase">Control Center</h1>
          </div>
          <div className="bg-white/5 border border-white/10 px-6 py-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />
              <span className="text-[10px] tracking-[0.3em] font-bold text-white/60 uppercase">OPERATIONS STABLE</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <StatCard 
            icon={<DollarSign />} 
            label="TOTAL REVENUE" 
            value={`$${stats.totalSales.toLocaleString()}`} 
            loading={ordersLoading}
          />
          <StatCard 
            icon={<ShoppingBag />} 
            label="TOTAL TRANSMISSIONS" 
            value={stats.orderCount.toString()} 
            loading={ordersLoading}
          />
          <StatCard 
            icon={<Package />} 
            label="INVENTORY UNITS" 
            value={products?.length.toString() || "0"} 
            loading={productsLoading}
          />
          <StatCard 
            icon={<TrendingUp />} 
            label="CONVERSION INDEX" 
            value="3.2%" 
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="bg-white/[0.02] border border-white/5 p-10 space-y-8 backdrop-blur-xl">
            <div className="flex justify-between items-center border-b border-white/5 pb-6">
              <h3 className="text-xs font-bold tracking-[0.4em] uppercase">QUICK ACTIONS</h3>
            </div>
            <div className="grid gap-4">
              <QuickActionButton href="/admin/products" label="MANAGE ASSEMBLAGES" description="Update catalog, stock, and pricing." />
              <QuickActionButton href="/admin/orders" label="TRACK TRANSMISSIONS" description="Fulfill orders and monitor payments." />
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-10 space-y-8 backdrop-blur-xl">
            <h3 className="text-xs font-bold tracking-[0.4em] uppercase">SYSTEM ANALYTICS</h3>
            <div className="space-y-6">
               <div className="flex justify-between items-center">
                  <span className="text-[10px] text-white/40 tracking-widest uppercase">NODE UPTIME</span>
                  <span className="text-[10px] font-mono">99.98%</span>
               </div>
               <div className="w-full h-1 bg-white/5 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "99.98%" }}
                    transition={{ duration: 2 }}
                    className="h-full bg-white shadow-[0_0_10px_white]"
                  />
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-[10px] text-white/40 tracking-widest uppercase">LATENCY (MS)</span>
                  <span className="text-[10px] font-mono">24ms</span>
               </div>
               <div className="w-full h-1 bg-white/5 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "15%" }}
                    transition={{ duration: 2 }}
                    className="h-full bg-white/40 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                  />
               </div>
            </div>
            <div className="pt-6 border-t border-white/5 flex items-center gap-2 text-white/20">
               <Zap className="w-3 h-3" />
               <span className="text-[8px] tracking-[0.5em] uppercase">NEURAL LOGGING ACTIVE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, loading }: { icon: React.ReactNode, label: string, value: string, loading?: boolean }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 p-8 space-y-4 hover:border-white/20 transition-all group backdrop-blur-sm">
      <div className="text-white/40 w-5 h-5 group-hover:text-white transition-colors">{icon}</div>
      <div className="space-y-1">
        <p className="text-[10px] tracking-[0.3em] text-white/40 uppercase font-bold">{label}</p>
        {loading ? (
          <div className="h-8 w-24 bg-white/5 animate-pulse" />
        ) : (
          <p className="text-3xl font-bold tracking-widest glow-text">{value}</p>
        )}
      </div>
    </div>
  );
}

function QuickActionButton({ href, label, description }: { href: string, label: string, description: string }) {
  return (
    <Link href={href} className="flex items-center justify-between p-8 border border-white/5 hover:border-white/40 bg-white/[0.01] transition-all group">
      <div className="space-y-2">
        <span className="text-[10px] font-bold tracking-[0.4em] uppercase group-hover:glow-text transition-all">{label}</span>
        <p className="text-[9px] text-white/20 tracking-widest uppercase">{description}</p>
      </div>
      <ArrowUpRight className="w-5 h-5 text-white/20 group-hover:text-white transition-all transform group-hover:translate-x-1 group-hover:-translate-y-1" />
    </Link>
  );
}
