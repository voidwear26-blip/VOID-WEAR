
'use client';

import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Package, ShoppingBag, Users, Zap, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const db = useFirestore();
  const { user } = useUser();

  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'products');
  }, [db]);

  const { data: products } = useCollection(productsQuery);

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <span className="text-[10px] font-bold tracking-[0.8em] text-white/20 uppercase">SYSTEM COMMAND // DASHBOARD</span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight glow-text uppercase">Control Center</h1>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <StatCard icon={<ShoppingBag />} label="TOTAL ORDERS" value="0" />
          <StatCard icon={<Package />} label="INVENTORY UNITS" value={products?.length.toString() || "0"} />
          <StatCard icon={<Users />} label="ACTIVE USERS" value="-" />
          <StatCard icon={<Zap />} label="SYSTEM STATUS" value="STABLE" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="bg-white/[0.02] border border-white/5 p-10 space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold tracking-[0.4em] uppercase">QUICK ACTIONS</h3>
            </div>
            <div className="grid gap-4">
              <QuickActionButton href="/admin/products" label="MANAGE ASSEMBLAGES" />
              <QuickActionButton href="/admin/orders" label="TRACK TRANSMISSIONS" />
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-10 space-y-8">
            <h3 className="text-xs font-bold tracking-[0.4em] uppercase">SYSTEM ANALYTICS</h3>
            <div className="h-48 flex items-center justify-center border border-dashed border-white/10 text-[10px] text-white/20 tracking-[0.5em]">
              [ NEURAL CHART DATA PENDING ]
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 p-8 space-y-4 hover:border-white/20 transition-colors">
      <div className="text-white/40 w-5 h-5">{icon}</div>
      <div className="space-y-1">
        <p className="text-[10px] tracking-[0.3em] text-white/40 uppercase">{label}</p>
        <p className="text-2xl font-bold tracking-widest">{value}</p>
      </div>
    </div>
  );
}

function QuickActionButton({ href, label }: { href: string, label: string }) {
  return (
    <Link href={href} className="flex items-center justify-between p-6 border border-white/5 hover:border-white/40 bg-white/[0.01] transition-all group">
      <span className="text-[10px] font-bold tracking-[0.4em] uppercase">{label}</span>
      <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
    </Link>
  );
}
