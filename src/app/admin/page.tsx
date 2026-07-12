"use client"

import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { motion } from 'framer-motion';
import { Package, ShoppingBag, Users, Zap, ArrowUpRight, DollarSign, Settings, Loader2, ShieldCheck, Megaphone, Database, AlertCircle, TrendingUp, MessageSquare, Star, Activity, Cpu, PlaySquare } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { collection, collectionGroup, doc, query, limit, getCountFromServer } from 'firebase/firestore';

export default function AdminDashboard() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);
  
  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'products'), limit(100));
  }, [db]);

  const ordersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collectionGroup(db, 'orders'), limit(100));
  }, [db]);

  const { data: products, isLoading: productsLoading } = useCollection(productsQuery);
  const { data: orders, isLoading: ordersLoading, error: ordersError } = useCollection(ordersQuery);

  const [counts, setCounts] = useState({
    users: 0,
    messages: 0,
    stories: 0,
    reviews: 0
  });

  useEffect(() => {
    setMounted(true);
    if (db) {
       const fetchMetadata = async () => {
          try {
             const [uSnap, mSnap, sSnap, rSnap] = await Promise.all([
                getCountFromServer(collection(db, 'users')),
                getCountFromServer(collection(db, 'contacts')),
                getCountFromServer(collection(db, 'stories')),
                getCountFromServer(collection(db, 'reviews'))
             ]);
             setCounts({
                users: uSnap.data().count,
                messages: mSnap.data().count,
                stories: sSnap.data().count,
                reviews: rSnap.data().count
             });
          } catch (e) {
             console.error("[METADATA_SYNC_FAILURE]", e);
          }
       };
       fetchMetadata();
    }
  }, [db]);

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  const isAdmin = useMemo(() => {
    if (isUserLoading || !user || isProfileLoading) return false;
    return user.email?.toLowerCase() === 'voidwear26@gmail.com' || 
           user.uid === 'A9vsqn10oddfmouKiKjWpTcFqZB2' ||
           profile?.role === 'ADMIN';
  }, [user, isUserLoading, profile, isProfileLoading]);

  const totalRevenue = useMemo(() => {
    if (!orders) return 0;
    return orders.reduce((acc, order) => acc + (Number(order.totalAmount) || 0), 0);
  }, [orders]);

  const totalInventoryUnits = useMemo(() => {
    if (!products) return 0;
    return products.reduce((acc, prod) => acc + (Number(prod.stockQuantity) || 0), 0);
  }, [products]);

  if (!mounted || isUserLoading || isProfileLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="w-10 h-10 animate-spin text-black/20" />
          <div className="text-[10px] tracking-[1em] text-black/60 uppercase font-bold">Connecting to System...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin && !isProfileLoading) return null;

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen text-black">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <span className="text-[10px] font-bold tracking-[0.8em] text-black/40 uppercase">ADMIN PANEL // ONLINE</span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight uppercase leading-none font-headline">Control Center</h1>
          </div>
          <div className="bg-black/5 border border-black/10 px-6 py-4 flex items-center gap-4 backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-black/60" />
            <span className="text-[10px] tracking-[0.3em] font-bold text-black/60 uppercase">SYSTEM SECURE</span>
          </div>
        </div>

        {ordersError && (
          <div className="mb-12 p-6 border border-red-500/20 bg-red-500/5 flex items-center gap-4 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <div className="space-y-1">
              <p className="text-[10px] tracking-widest font-black uppercase">SYNC FAILURE</p>
              <p className="text-[8px] tracking-widest uppercase opacity-60">RETRYING CONNECTION...</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4 mb-16">
          <StatCard href="/admin/revenue" icon={<TrendingUp className="w-5 h-5" />} label="REVENUE" value={ordersLoading ? "..." : `₹${totalRevenue.toLocaleString()}`} />
          <StatCard href="/admin/orders" icon={<ShoppingBag className="w-5 h-5" />} label="ORDERS" value={ordersLoading ? "..." : (orders?.length.toString() || "0")} />
          <StatCard href="/admin/users" icon={<Users className="w-5 h-5" />} label="CUSTOMERS" value={counts.users ? counts.users.toString() : "..."} />
          <StatCard href="/admin/stories" icon={<Megaphone className="w-5 h-5" />} label="STORIES" value={counts.stories ? counts.stories.toString() : "..."} />
          <StatCard href="/admin/messages" icon={<MessageSquare className="w-5 h-5" />} label="MESSAGES" value={counts.messages ? counts.messages.toString() : "..."} />
          <StatCard href="/admin/reviews" icon={<Star className="w-5 h-5" />} label="REVIEWS" value={counts.reviews ? counts.reviews.toString() : "..."} />
          <StatCard href="/admin/products" icon={<Package className="w-5 h-5" />} label="STOCK" value={productsLoading ? "..." : totalInventoryUnits.toString()} />
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <div className="bg-black/[0.01] border border-black/5 p-10 space-y-8 backdrop-blur-xl">
              <div className="flex justify-between items-center border-b border-black/10 pb-6">
                <h3 className="text-xs font-bold tracking-[0.4em] uppercase text-black/80">COMMAND MODULES</h3>
                <Cpu className="w-4 h-4 text-black/20" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <QuickActionButton href="/admin/products" label="MANAGE PRODUCTS" description="EDIT CATALOGUE" icon={<Package className="w-4 h-4" />} />
                <QuickActionButton href="/admin/stories" label="MANAGE STORIES" description="POST UPDATES" icon={<Megaphone className="w-4 h-4" />} />
                <QuickActionButton href="/admin/orders" label="MANAGE ORDERS" description="TRACK SALES" icon={<ShoppingBag className="w-4 h-4" />} />
                <QuickActionButton href="/admin/users" label="CUSTOMER LIST" description="MANAGE PROFILES" icon={<Users className="w-4 h-4" />} />
                <QuickActionButton href="/admin/messages" label="MESSAGES" description="CUSTOMER INQUIRIES" icon={<MessageSquare className="w-4 h-4" />} />
                <QuickActionButton href="/admin/reviews" label="REVIEWS" description="MANAGE FEEDBACK" icon={<Star className="w-4 h-4" />} />
                <QuickActionButton href="/admin/ads" label="ADVERTISING" description="MANAGE BANNERS" icon={<PlaySquare className="w-4 h-4" />} />
                <QuickActionButton href="/admin/content" label="BRAND CONTROL" description="HOMEPAGE CONTENT" icon={<Settings className="w-4 h-4" />} />
              </div>
            </div>
          </div>

          <div className="space-y-12">
            <div className="bg-black/[0.01] border border-black/5 p-10 space-y-10 backdrop-blur-xl h-full">
              <div className="flex justify-between items-center border-b border-black/10 pb-6">
                <h3 className="text-xs font-bold tracking-[0.4em] uppercase text-black/80">SYSTEM STATUS</h3>
                <Activity className="w-4 h-4 text-black/20" />
              </div>
              
              <div className="space-y-10">
                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] text-black/60 tracking-widest uppercase font-bold">
                       <span>DATABASE UPTIME</span>
                       <span className="font-mono text-black/80">99.9%</span>
                    </div>
                    <div className="w-full h-1 bg-black/5 overflow-hidden">
                       <motion.div initial={{ width: 0 }} animate={{ width: "99.9%" }} transition={{ duration: 2 }} className="h-full bg-black shadow-[0_0_10px_black]" />
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] text-black/60 tracking-widest uppercase font-bold">
                       <span>SERVER LOAD</span>
                       <span className="font-mono text-black/80">STABLE</span>
                    </div>
                    <div className="w-full h-1 bg-black/5 overflow-hidden">
                       <motion.div initial={{ width: 0 }} animate={{ width: "20%" }} transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }} className="h-full bg-black/20" />
                    </div>
                 </div>

                 <div className="pt-10 space-y-6">
                    <div className="flex items-start gap-4">
                       <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1" />
                       <div className="space-y-1">
                          <p className="text-[9px] font-black tracking-widest uppercase text-black/80">CONNECTION STABLE</p>
                          <p className="text-[8px] tracking-widest uppercase text-black/40 font-bold">ENCRYPTION ACTIVE</p>
                       </div>
                    </div>
                 </div>
              </div>
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
      <div className="bg-black/[0.01] border border-black/5 p-6 space-y-4 hover:border-black/20 transition-all group backdrop-blur-sm cursor-pointer h-full">
        <div className="text-black/40 group-hover:text-black transition-colors flex justify-between items-center">
          {icon}
          <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="space-y-1">
          <p className="text-[8px] tracking-[0.3em] text-black/40 uppercase font-bold">{label}</p>
          <p className="text-xl font-bold tracking-widest text-black">{value}</p>
        </div>
      </div>
    </Link>
  );
}

function QuickActionButton({ href, label, description, icon }: { href: string, label: string, description: string, icon?: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center justify-between p-6 border border-black/5 bg-black/[0.01] hover:bg-black/5 hover:border-black/20 transition-all group">
      <div className="flex items-center gap-6">
        <div className="text-black/20 group-hover:text-black transition-colors">{icon}</div>
        <div className="space-y-2">
          <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-black/80">{label}</span>
          <p className="text-[8px] text-black/40 tracking-widest uppercase font-bold">{description}</p>
        </div>
      </div>
      <ArrowUpRight className="w-5 h-5 text-black/20 group-hover:text-black transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
    </Link>
  );
}
