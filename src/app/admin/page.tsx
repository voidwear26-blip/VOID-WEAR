
"use client"

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { motion } from 'framer-motion';
import { Package, ShoppingBag, Users, Zap, ArrowUpRight, DollarSign, Settings, Loader2, ShieldCheck, Megaphone, Database } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, collectionGroup, query } from 'firebase/firestore';

export default function AdminDashboard() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin = user?.email?.toLowerCase() === 'voidwear26@gmail.com';

  useEffect(() => {
    if (mounted && !isUserLoading && !isAdmin) {
      router.push('/');
    }
  }, [mounted, isUserLoading, isAdmin, router]);

  // Sync real-time data for stats - Dependency on user.uid ensures listeners re-trigger after auth
  const productsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid || !isAdmin) return null;
    return collection(db, 'products');
  }, [db, user?.uid, isAdmin]);

  const ordersQuery = useMemoFirebase(() => {
    if (!db || !user?.uid || !isAdmin) return null;
    return collectionGroup(db, 'orders');
  }, [db, user?.uid, isAdmin]);

  const usersQuery = useMemoFirebase(() => {
    if (!db || !user?.uid || !isAdmin) return null;
    return collection(db, 'users');
  }, [db, user?.uid, isAdmin]);

  const { data: products } = useCollection(productsQuery);
  const { data: orders } = useCollection(ordersQuery);
  const { data: users } = useCollection(usersQuery);

  const totalRevenue = orders?.reduce((acc, order) => acc + (order.totalAmount || 0), 0) || 0;
  const totalInventoryUnits = products?.reduce((acc, prod) => acc + (prod.stockQuantity || 0), 0) || 0;

  if (!mounted || isUserLoading || !isAdmin) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="w-10 h-10 animate-spin text-white/60" />
          <div className="text-[10px] tracking-[1em] text-white/80 uppercase font-bold">Authenticating Protocol...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <span className="text-[10px] font-bold tracking-[0.8em] text-white/40 uppercase">SYSTEM COMMAND // ONLINE</span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight glow-text uppercase leading-none">Control Center</h1>
          </div>
          <div className="bg-white/5 border border-white/10 px-6 py-4 flex items-center gap-4 backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-white" />
            <span className="text-[10px] tracking-[0.3em] font-bold text-white uppercase">NEURAL UPLINK SECURE</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <StatCard 
            href="/admin/orders"
            icon={<DollarSign className="w-5 h-5" />} 
            label="TOTAL REVENUE" 
            value={`₹${totalRevenue.toLocaleString()}`} 
          />
          <StatCard 
            href="/admin/orders"
            icon={<ShoppingBag className="w-5 h-5" />} 
            label="TRANSMISSIONS" 
            value={orders?.length.toString() || "0"} 
          />
          <StatCard 
            href="/admin/users"
            icon={<Users className="w-5 h-5" />} 
            label="ENTITIES" 
            value={users?.length.toString() || "0"} 
          />
          <StatCard 
            href="/admin/products"
            icon={<Package className="w-5 h-5" />} 
            label="INVENTORY" 
            value={totalInventoryUnits.toString()} 
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="bg-white/[0.02] border border-white/5 p-10 space-y-8 backdrop-blur-xl">
            <div className="flex justify-between items-center border-b border-white/5 pb-6">
              <h3 className="text-xs font-bold tracking-[0.4em] uppercase text-white/80">COMMAND MODULES</h3>
            </div>
            <div className="grid gap-4">
              <QuickActionButton href="/admin/products" label="MANAGE ASSEMBLAGES" description="Configure product database." icon={<Package className="w-4 h-4" />} />
              <QuickActionButton href="/admin/orders" label="TRACK TRANSMISSIONS" description="Monitor customer orders." icon={<ShoppingBag className="w-4 h-4" />} />
              <QuickActionButton href="/admin/stories" label="STORY NARRATIVE" description="Post trends and arrivals." icon={<Megaphone className="w-4 h-4" />} />
              <QuickActionButton href="/admin/system" label="SYSTEM ARCHIVE" description="Import / Export all database logs." icon={<Database className="w-4 h-4" />} />
              <QuickActionButton href="/admin/content" label="BRAND OVERRIDE" description="Homepage content control." icon={<Settings className="w-4 h-4" />} />
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-10 space-y-8 backdrop-blur-xl">
            <h3 className="text-xs font-bold tracking-[0.4em] uppercase text-white/80">SYSTEM ANALYTICS</h3>
            <div className="space-y-6">
               <div className="flex justify-between items-center text-[10px] text-white/60 tracking-widest uppercase">
                  <span>DATABASE UPTIME</span>
                  <span className="font-mono text-white/80">99.99%</span>
               </div>
               <div className="w-full h-1 bg-white/5 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: "99.99%" }} transition={{ duration: 2 }} className="h-full bg-white shadow-[0_0_10px_white]" />
               </div>
            </div>
            <div className="pt-6 border-t border-white/5 flex items-center gap-2 text-white/40">
               <Zap className="w-3 h-3 text-white/80" />
               <span className="text-[8px] tracking-[0.5em] uppercase font-bold text-white/60">SYSTEM RUNNING STABLE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, href }: { icon: React.ReactNode, label: string, value: string, href: string }) {
  return (
    <Link href={href}>
      <div className="bg-white/[0.02] border border-white/5 p-8 space-y-4 hover:border-white/20 transition-all group backdrop-blur-sm cursor-pointer">
        <div className="text-white/60 group-hover:text-white transition-colors flex justify-between items-center">
          {icon}
          <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] tracking-[0.3em] text-white/60 uppercase font-bold">{label}</p>
          <p className="text-3xl font-bold tracking-widest glow-text">{value}</p>
        </div>
      </div>
    </Link>
  );
}

function QuickActionButton({ href, label, description, icon }: { href: string, label: string, description: string, icon?: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center justify-between p-8 border border-white/5 bg-white/[0.01] hover:bg-white/5 hover:border-white/20 transition-all group">
      <div className="flex items-center gap-6">
        <div className="text-white/40 group-hover:text-white transition-colors">{icon}</div>
        <div className="space-y-2">
          <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-white/80">{label}</span>
          <p className="text-[9px] text-white/40 tracking-widest uppercase font-bold">{description}</p>
        </div>
      </div>
      <ArrowUpRight className="w-5 h-5 text-white/40 group-hover:text-white transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
    </Link>
  );
}
