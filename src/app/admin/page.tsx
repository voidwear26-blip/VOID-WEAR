
'use client';

import { useUser } from '@/firebase';
import { motion } from 'framer-motion';
import { Package, ShoppingBag, Users, Zap, ArrowUpRight, DollarSign, Settings, Loader2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <span className="text-[10px] font-bold tracking-[0.8em] text-white/20 uppercase">SYSTEM COMMAND // ONLINE</span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight glow-text uppercase leading-none">Control Center</h1>
          </div>
          <div className="bg-white/5 border border-white/10 px-6 py-4 flex items-center gap-4 backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-white" />
            <span className="text-[10px] tracking-[0.3em] font-bold text-white uppercase">NEURAL UPLINK SECURE</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <StatCard icon={<DollarSign className="w-5 h-5" />} label="TOTAL REVENUE" value="₹0" />
          <StatCard icon={<ShoppingBag className="w-5 h-5" />} label="TRANSMISSIONS" value="0" />
          <StatCard icon={<Users className="w-5 h-5" />} label="ENTITIES" value="0" />
          <StatCard icon={<Package className="w-5 h-5" />} label="INVENTORY" value="--" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="bg-white/[0.02] border border-white/5 p-10 space-y-8 backdrop-blur-xl">
            <div className="flex justify-between items-center border-b border-white/5 pb-6">
              <h3 className="text-xs font-bold tracking-[0.4em] uppercase">COMMAND MODULES</h3>
            </div>
            <div className="grid gap-4">
              <QuickActionButton href="/admin/products" label="MANAGE ASSEMBLAGES" description="Configure product database." icon={<Package className="w-4 h-4" />} />
              <QuickActionButton href="/admin/orders" label="TRACK TRANSMISSIONS" description="Monitor customer orders." icon={<ShoppingBag className="w-4 h-4" />} />
              <QuickActionButton href="/admin/users" label="MODERATE ENTITIES" description="User account management." icon={<Users className="w-4 h-4" />} />
              <QuickActionButton href="/admin/content" label="BRAND OVERRIDE" description="Homepage content control." icon={<Settings className="w-4 h-4" />} />
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-10 space-y-8 backdrop-blur-xl">
            <h3 className="text-xs font-bold tracking-[0.4em] uppercase">SYSTEM ANALYTICS</h3>
            <div className="space-y-6">
               <div className="flex justify-between items-center text-[10px] text-white/40 tracking-widest uppercase">
                  <span>DATABASE UPTIME</span>
                  <span className="font-mono text-white">99.99%</span>
               </div>
               <div className="w-full h-1 bg-white/5 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: "99.99%" }} transition={{ duration: 2 }} className="h-full bg-white shadow-[0_0_10px_white]" />
               </div>
            </div>
            <div className="pt-6 border-t border-white/5 flex items-center gap-2 text-white/20">
               <Zap className="w-3 h-3 text-white" />
               <span className="text-[8px] tracking-[0.5em] uppercase font-bold text-white/40">SYSTEM RUNNING STABLE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 p-8 space-y-4 hover:border-white/20 transition-all group backdrop-blur-sm">
      <div className="text-white/40 group-hover:text-white transition-colors">{icon}</div>
      <div className="space-y-1">
        <p className="text-[10px] tracking-[0.3em] text-white/40 uppercase font-bold">{label}</p>
        <p className="text-3xl font-bold tracking-widest glow-text">{value}</p>
      </div>
    </div>
  );
}

function QuickActionButton({ href, label, description, icon }: { href: string, label: string, description: string, icon?: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center justify-between p-8 border border-white/5 bg-white/[0.01] hover:bg-white/5 hover:border-white/20 transition-all group">
      <div className="flex items-center gap-6">
        <div className="text-white/20 group-hover:text-white transition-colors">{icon}</div>
        <div className="space-y-2">
          <span className="text-[10px] font-bold tracking-[0.4em] uppercase">{label}</span>
          <p className="text-[9px] text-white/20 tracking-widest uppercase font-bold">{description}</p>
        </div>
      </div>
      <ArrowUpRight className="w-5 h-5 text-white/20 group-hover:text-white transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
    </Link>
  );
}
