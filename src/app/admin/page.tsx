'use client';

import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, collectionGroup, writeBatch, doc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Package, ShoppingBag, Users, Zap, ArrowUpRight, DollarSign, Settings, Lock, Loader2, Database, RefreshCw, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { products as fallbackProducts } from '@/app/lib/products';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [seeding, setSeeding] = useState(false);

  // Hardened Identity Verification
  const isAdmin = user?.email?.toLowerCase() === 'voidwear26@gmail.com';

  // Guarded Queries: Explicitly wait for admin verification to prevent premature query denial
  const ordersQuery = useMemoFirebase(() => {
    if (!db || !isAdmin) return null;
    return collectionGroup(db, 'orders');
  }, [db, isAdmin]);

  const productsQuery = useMemoFirebase(() => {
    if (!db || !isAdmin) return null;
    return collection(db, 'products');
  }, [db, isAdmin]);

  const usersQuery = useMemoFirebase(() => {
    if (!db || !isAdmin) return null;
    return collection(db, 'users');
  }, [db, isAdmin]);

  const { data: orders, isLoading: ordersLoading } = useCollection(ordersQuery);
  const { data: products, isLoading: productsLoading } = useCollection(productsQuery);
  const { data: users, isLoading: usersLoading } = useCollection(usersQuery);

  const stats = useMemo(() => {
    if (!orders) return { totalSales: 0, orderCount: 0 };
    const totalSales = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);
    return { totalSales, orderCount: orders.length };
  }, [orders]);

  const handleSeedData = async () => {
    if (!db) return;
    setSeeding(true);
    try {
      const batch = writeBatch(db);
      fallbackProducts.forEach(product => {
        const productRef = doc(db, 'products', product.id);
        batch.set(productRef, {
          ...product,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { merge: true });
      });
      await batch.commit();
      toast({
        title: "SYSTEM SYNC COMPLETE",
        description: "ALL ASSEMBLAGES (INCLUDING TECHNICAL TOPS) INITIALIZED.",
      });
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "SYNC FAILURE",
        description: "COULD NOT ESTABLISH UPLINK FOR SEED DATA.",
      });
    } finally {
      setSeeding(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="w-10 h-10 animate-spin text-white/20" />
          <div className="text-[10px] tracking-[1em] text-white/40 uppercase font-bold">Authenticating Protocol...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-8 p-6 text-center bg-black">
        <Lock className="w-12 h-12 text-white/20" />
        <h2 className="text-xl font-bold tracking-[0.5em] glow-text">ACCESS DENIED</h2>
        <p className="text-[10px] text-white/40 tracking-[0.3em] max-w-xs uppercase leading-relaxed font-bold">
          THIS TERMINAL IS RESTRICTED TO MASTER ADMINISTRATOR: VOIDWEAR26@GMAIL.COM.
        </p>
        <div className="pt-8">
          <p className="text-[8px] text-white/10 tracking-[0.4em] uppercase mb-8">CURRENT ENTITY: {user?.email || 'ANONYMOUS'}</p>
          <Link href="/">
            <button className="px-12 py-4 border border-white/20 text-[10px] tracking-[0.5em] hover:bg-white hover:text-black transition-all uppercase font-bold">
              RETURN TO SURFACE
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <span className="text-[10px] font-bold tracking-[0.8em] text-white/20 uppercase">SYSTEM COMMAND // DASHBOARD</span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight glow-text uppercase leading-none">Control Center</h1>
          </div>
          <div className="flex flex-wrap gap-4">
             <div className="bg-white/5 border border-white/10 px-6 py-4 flex items-center gap-4 backdrop-blur-md">
                <ShieldAlert className="w-4 h-4 text-white/40" />
                <span className="text-[10px] tracking-[0.3em] font-bold text-white/40 uppercase">MASTER AUTHORITY ACTIVE</span>
             </div>
             <Button 
                onClick={handleSeedData} 
                disabled={seeding}
                className="bg-white text-black hover:bg-white/90 border border-white/10 px-8 py-7 h-auto rounded-none text-[10px] tracking-[0.3em] font-bold uppercase transition-all group"
             >
                {seeding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />}
                {seeding ? 'SYNCING...' : 'SYNC INITIAL CATALOG'}
             </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <StatCard icon={<DollarSign className="w-5 h-5" />} label="TOTAL REVENUE" value={`$${stats.totalSales.toLocaleString()}`} loading={ordersLoading} />
          <StatCard icon={<ShoppingBag className="w-5 h-5" />} label="TOTAL TRANSMISSIONS" value={stats.orderCount.toString()} loading={ordersLoading} />
          <StatCard icon={<Users className="w-5 h-5" />} label="ENTITIES REGISTERED" value={users?.length.toString() || "0"} loading={usersLoading} />
          <StatCard icon={<Package className="w-5 h-5" />} label="INVENTORY UNITS" value={products?.length.toString() || "0"} loading={productsLoading} />
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="bg-white/[0.02] border border-white/5 p-10 space-y-8 backdrop-blur-xl">
            <div className="flex justify-between items-center border-b border-white/5 pb-6">
              <h3 className="text-xs font-bold tracking-[0.4em] uppercase">COMMAND MODULES</h3>
            </div>
            <div className="grid gap-4">
              <QuickActionButton href="/admin/products" label="MANAGE ASSEMBLAGES" description="Update catalog and stock." icon={<Package className="w-4 h-4" />} />
              <QuickActionButton href="/admin/orders" label="TRACK TRANSMISSIONS" description="Fulfill orders." icon={<ShoppingBag className="w-4 h-4" />} />
              <QuickActionButton href="/admin/users" label="ENTITY MANAGEMENT" description="Monitor users." icon={<Users className="w-4 h-4" />} />
              <QuickActionButton href="/admin/content" label="BRAND CONTROL" description="Update global content." icon={<Settings className="w-4 h-4" />} />
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-10 space-y-8 backdrop-blur-xl">
            <h3 className="text-xs font-bold tracking-[0.4em] uppercase">SYSTEM ANALYTICS</h3>
            <div className="space-y-6">
               <div className="flex justify-between items-center text-[10px] text-white/40 tracking-widest uppercase">
                  <span>NODE UPTIME</span>
                  <span className="font-mono text-white">99.98%</span>
               </div>
               <div className="w-full h-1 bg-white/5 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: "99.98%" }} transition={{ duration: 2 }} className="h-full bg-white shadow-[0_0_10px_white]" />
               </div>
               <div className="flex justify-between items-center text-[10px] text-white/40 tracking-widest uppercase">
                  <span>LATENCY (MS)</span>
                  <span className="font-mono text-white">24ms</span>
               </div>
               <div className="w-full h-1 bg-white/5 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: "15%" }} transition={{ duration: 2 }} className="h-full bg-white/40" />
               </div>
            </div>
            <div className="pt-6 border-t border-white/5 flex items-center gap-2 text-white/20">
               <Zap className="w-3 h-3 animate-pulse" />
               <span className="text-[8px] tracking-[0.5em] uppercase font-bold">NEURAL LOGGING ACTIVE</span>
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
      <div className="text-white/40 group-hover:text-white transition-colors">{icon}</div>
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

function QuickActionButton({ href, label, description, icon }: { href: string, label: string, description: string, icon?: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center justify-between p-8 border border-white/5 hover:border-white/40 bg-white/[0.01] transition-all group">
      <div className="flex items-center gap-6">
        <div className="text-white/20 group-hover:text-white transition-colors">{icon}</div>
        <div className="space-y-2">
          <span className="text-[10px] font-bold tracking-[0.4em] uppercase group-hover:glow-text transition-all">{label}</span>
          <p className="text-[9px] text-white/20 tracking-widest uppercase font-bold">{description}</p>
        </div>
      </div>
      <ArrowUpRight className="w-5 h-5 text-white/20 group-hover:text-white transition-all" />
    </Link>
  );
}