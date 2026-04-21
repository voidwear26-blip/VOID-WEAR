'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, orderBy, doc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Clock, ShieldCheck, ShoppingBag, Heart, Settings, User as UserIcon, Save, Loader2, Calendar, Zap, Download, Info, Star, MessageSquare, Hash } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ProductCard } from '@/components/product-card';
import { saveUserToFirestore } from '@/firebase/user-actions';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { generateInvoicePDF } from '@/lib/invoice-generator';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { submitReview } from '@/firebase/review-actions';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('identity');
  const [saving, setSaving] = useState(false);

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  const ordersQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'orders'),
      orderBy('orderDate', 'desc')
    );
  }, [db, user]);

  const wishlistQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'wishlist');
  }, [db, user]);

  const { data: orders, isLoading: isOrdersLoading } = useCollection(ordersQuery);
  const { data: wishlistItems } = useCollection(wishlistQuery);

  const [formData, setFormData] = useState({
    displayName: '',
    mobileNumber: '',
    city: '',
    stateProvince: '',
    postalCode: '',
    addressLine1: '',
    landmark: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        mobileNumber: profile.mobileNumber || '',
        city: profile.city || '',
        stateProvince: profile.stateProvince || '',
        postalCode: profile.postalCode || '',
        addressLine1: profile.addressLine1 || '',
        landmark: profile.landmark || ''
      });
    }
  }, [profile]);

  useEffect(() => {
    if (user && db && !isProfileLoading && !profile) {
      saveUserToFirestore(db, user);
    }
  }, [user, db, isProfileLoading, profile]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user) return;

    setSaving(true);
    const userRef = doc(db, 'users', user.uid);
    const updateData = {
      ...formData,
      email: user.email,
      uid: user.uid,
      updatedAt: new Date().toISOString()
    };

    setDoc(userRef, updateData, { merge: true })
      .then(() => {
        toast({
          title: "IDENTITY UPDATED",
          description: "SYSTEM METADATA SYNCHRONIZED.",
        });
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: userRef.path,
          operation: 'update',
          requestResourceData: updateData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const isAdmin = user?.email?.toLowerCase() === 'voidwear26@gmail.com';

  if (isUserLoading || (user && isProfileLoading)) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="w-10 h-10 animate-spin text-white/20" />
          <div className="text-[10px] tracking-[1em] text-white/40 uppercase font-black">Syncing Profile...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-8 bg-black">
        <h2 className="text-xl font-bold tracking-[0.5em] glow-text text-white uppercase">ACCESS DENIED</h2>
        <p className="text-[10px] text-white/40 tracking-[0.3em] font-bold uppercase">PLEASE INITIALIZE AUTHENTICATION</p>
        <Link href="/login">
          <button className="px-12 py-4 border border-white/20 text-[10px] tracking-[0.5em] hover:bg-white hover:text-black transition-all font-bold uppercase">
            ESTABLISH LINK
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-48 pb-32 bg-transparent min-h-screen text-white">
      <div className="container mx-auto px-6 md:px-10">
        <div className="grid lg:grid-cols-4 gap-16 md:gap-24 items-start">
          <div className="space-y-12 lg:sticky lg:top-48">
            <div className="space-y-6">
              <span className="text-[10px] font-bold tracking-[0.8em] text-white/40 uppercase">ENTITY // PROFILE</span>
              <h1 className="text-4xl font-black tracking-tight glow-text uppercase leading-none break-all">
                {profile?.displayName || user.email?.split('@')[0].toUpperCase()}
              </h1>
              <p className="text-white/30 tracking-[0.2em] text-[10px] uppercase font-mono">
                UID: {user.uid.slice(0, 12)}...
              </p>
            </div>

            {isAdmin && (
              <Link href="/admin">
                <Button className="w-full bg-white text-black hover:bg-white/90 rounded-none h-14 text-[10px] font-bold tracking-[0.4em] mb-8 shadow-[0_0_20px_rgba(255,255,255,0.1)] uppercase">
                  <Settings className="w-4 h-4 mr-3" />
                  COMMAND CENTER
                </Button>
              </Link>
            )}

            <div className="p-8 border border-white/5 bg-white/[0.01] space-y-6 backdrop-blur-sm">
              <div className="flex items-center gap-4 text-white/60">
                <ShieldCheck className="w-4 h-4 text-white/30" />
                <span className="text-[9px] tracking-[0.3em] uppercase font-bold">ACCESS: {isAdmin ? 'ADMIN' : 'OPERATOR'}</span>
              </div>
              <div className="flex items-center gap-4 text-white/60">
                <Calendar className="w-4 h-4 text-white/30" />
                <span className="text-[9px] tracking-[0.3em] uppercase font-bold">
                  JOINED: {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'BUFFERING...'}
                </span>
              </div>
              <div className="flex items-center gap-4 text-white/60">
                <Clock className="w-4 h-4 text-white/30" />
                <span className="text-[9px] tracking-[0.3em] uppercase font-bold">STATUS: ACTIVE</span>
              </div>
            </div>
            
            <nav className="flex flex-col gap-4 text-[10px] tracking-[0.5em] uppercase font-bold text-white/30">
              {[
                { id: 'identity', label: 'IDENTITY', icon: <UserIcon className="w-3.5 h-3.5" /> },
                { id: 'orders', label: 'TRANSMISSIONS', icon: <Package className="w-3.5 h-3.5" /> },
                { id: 'wishlist', label: 'STASIS', icon: <Heart className="w-3.5 h-3.5" /> }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-4 transition-all duration-300 py-3 ${activeTab === tab.id ? 'text-white pl-4 border-l border-white' : 'hover:text-white/60'}`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === 'identity' && (
                <motion.div 
                  key="identity"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-12"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-8">
                    <h2 className="text-xs font-bold tracking-[0.5em] uppercase text-white/60">ENTITY IDENTITY</h2>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="bg-white/[0.01] border border-white/5 p-10 space-y-10 backdrop-blur-xl">
                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">FULL IDENTIFIER</label>
                        <Input 
                          value={formData.displayName}
                          onChange={e => setFormData({ ...formData, displayName: e.target.value.toUpperCase() })}
                          className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest focus:border-white/40 text-white uppercase"
                          placeholder="ENTER NAME"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">CONTACT PROTOCOL</label>
                        <Input 
                          value={formData.mobileNumber}
                          onChange={e => setFormData({ ...formData, mobileNumber: e.target.value })}
                          className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest focus:border-white/40 text-white"
                          placeholder="+91 XXXX XXX XXX"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">CITY / DISTRICT</label>
                        <Input 
                          value={formData.city}
                          onChange={e => setFormData({ ...formData, city: e.target.value.toUpperCase() })}
                          className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest focus:border-white/40 text-white uppercase"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">STATE</label>
                        <Input 
                          value={formData.stateProvince}
                          onChange={e => setFormData({ ...formData, stateProvince: e.target.value.toUpperCase() })}
                          className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest focus:border-white/40 text-white uppercase"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">PINCODE</label>
                        <Input 
                          value={formData.postalCode}
                          onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                          className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest focus:border-white/40 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">PRIMARY ADDRESS NODE</label>
                        <Input 
                          value={formData.addressLine1}
                          onChange={e => setFormData({ ...formData, addressLine1: e.target.value.toUpperCase() })}
                          className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest focus:border-white/40 text-white uppercase"
                          placeholder="STREET ADDRESS"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">LANDMARK (OPTIONAL)</label>
                        <Input 
                          value={formData.landmark}
                          onChange={e => setFormData({ ...formData, landmark: e.target.value.toUpperCase() })}
                          className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest focus:border-white/40 text-white uppercase"
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit"
                      disabled={saving}
                      className="w-full bg-white text-black hover:bg-white/90 h-16 text-[10px] font-bold tracking-[0.5em] rounded-none shadow-[0_0_20px_rgba(255,255,255,0.1)] uppercase"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                        <>
                          UPDATE IDENTITY LOGS
                          <Save className="ml-3 w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </motion.div>
              )}

              {activeTab === 'orders' && (
                <motion.div 
                  key="orders"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-12"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-8">
                    <h2 className="text-xs font-bold tracking-[0.5em] uppercase text-white/60">TRANSMISSION HISTORY</h2>
                    <span className="text-[10px] text-white/30 font-bold uppercase">{orders?.length || 0} LOGS</span>
                  </div>

                  <div className="space-y-8">
                    {isOrdersLoading ? (
                      <div className="space-y-4">
                        {[1, 2].map(i => (
                          <div key={i} className="h-32 bg-white/[0.01] animate-pulse border border-white/5" />
                        ))}
                      </div>
                    ) : orders && orders.length > 0 ? (
                      orders.map((order) => (
                        <OrderCard key={order.id} order={order} userId={user.uid} userName={profile?.displayName || 'OPERATOR'} db={db} />
                      ))
                    ) : (
                      <EmptyState icon={<ShoppingBag />} message="NO TRANSMISSIONS LOGGED" />
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'wishlist' && (
                <motion.div 
                  key="wishlist"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-12"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-8">
                    <h2 className="text-xs font-bold tracking-[0.5em] uppercase text-white/60">STASIS MODULES</h2>
                    <span className="text-[10px] text-white/30 font-bold uppercase">{wishlistItems?.length || 0} ITEMS</span>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {wishlistItems && wishlistItems.length > 0 ? (
                      wishlistItems.map(item => (
                        <ProductCard 
                          key={item.id} 
                          product={{
                            id: item.productId,
                            name: item.name,
                            basePrice: item.price,
                            imageUrls: [item.image],
                            category: item.category,
                            description: '',
                            slug: ''
                          } as any} 
                        />
                      ))
                    ) : (
                      <div className="sm:col-span-2 lg:col-span-3">
                        <EmptyState icon={<Heart />} message="STASIS IS EMPTY" />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order, userId, userName, db }: { order: any, userId: string, userName: string, db: any }) {
  const { toast } = useToast();
  const handleDownload = () => {
    generateInvoicePDF(order);
    toast({ title: "MANIFESTO RETRIEVED", description: "TRANSMISSION LOG DOWNLOADED." });
  };

  return (
    <div className="group border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-all p-8 md:p-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <Package className="w-4 h-4 text-white/30" />
            <span className="text-[10px] font-bold tracking-widest uppercase font-mono text-white/60">{order.id.slice(0, 16)}</span>
            <span className={`text-[8px] px-2 py-0.5 border tracking-[0.2em] uppercase font-bold ${
              order.shippingStatus === 'delivered' ? 'border-green-500/50 text-green-500' :
              order.shippingStatus === 'shipped' ? 'border-blue-500/50 text-blue-500' :
              'border-white/10 text-white/60'
            }`}>
              {order.shippingStatus || 'processing'}
            </span>
          </div>
          <div className="flex flex-col gap-1">
             <div className="flex items-center gap-2 text-[8px] text-white/40 tracking-widest uppercase font-bold">
                <Calendar className="w-3 h-3 text-white/20" />
                INITIALIZED: {new Date(order.orderDate).toLocaleDateString()}
             </div>
             <div className="flex items-center gap-2 text-[8px] text-white/40 tracking-widest uppercase font-bold">
                <Hash className="w-3 h-3 text-white/20" />
                ORDER_ID: {order.order_ID || order.id}
             </div>
          </div>
        </div>

        <div className="flex items-center gap-8 md:gap-12">
          <div className="text-right">
            <div className="text-[11px] font-bold tracking-widest uppercase text-white">₹{order.totalAmount}</div>
            <div className="text-[8px] text-white/30 tracking-widest uppercase mt-1 font-bold">
              {order.paymentStatus?.toUpperCase() || 'PAID'}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleDownload} className="text-white/30 hover:text-white transition-colors">
              <Download className="w-4 h-4" />
            </Button>
            <OrderDossierDialog order={order} userId={userId} userName={userName} db={db} />
          </div>
          
          {order.shippingStatus === 'delivered' && (
            <ReviewDialog order={order} userId={userId} userName={userName} db={db} />
          )}
        </div>
      </div>
    </div>
  );
}

function OrderDossierDialog({ order, userId, userName, db }: { order: any, userId: string, userName: string, db: any }) {
  const { toast } = useToast();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-white/30 hover:text-white transition-colors">
          <Info className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black border-white/20 rounded-none text-white max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar">
        <DialogHeader className="mb-10 text-white">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold tracking-[0.5em] uppercase glow-text">Mission Dossier</DialogTitle>
              <div className="flex flex-col gap-1 mt-2">
                 <DialogDescription className="text-[9px] tracking-[0.3em] uppercase text-white/40 font-mono">ORDER_ID: {order.order_ID || order.id}</DialogDescription>
                 <DialogDescription className="text-[9px] tracking-[0.3em] uppercase text-white/20 font-mono">TRANSITION_ID: {order.transition_ID || 'INTERNAL'}</DialogDescription>
              </div>
            </div>
            <Button onClick={() => { generateInvoicePDF(order); toast({ title: "LOG DOWNLOADED" }); }} size="sm" variant="outline" className="border-white/20 text-white text-[8px] tracking-[0.3em] font-black hover:bg-white hover:text-black rounded-none h-10 px-6 bg-transparent">
               BILL (PDF) <Download className="ml-2 w-3 h-3" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-16">
          {/* 1. PRODUCT DETAILS */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold tracking-[0.5em] text-white/40 uppercase border-l-2 border-white/20 pl-4">MODULES IN TRANSMISSION</h4>
            <div className="grid gap-6">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-6 items-center p-6 border border-white/5 bg-white/[0.01]">
                   <div className="relative w-20 aspect-[3/4] bg-white/5 border border-white/10">
                      <Image src={item.image} alt={item.name} fill className="object-cover grayscale" unoptimized />
                   </div>
                   <div className="flex-1 space-y-2">
                      <p className="text-xs font-bold tracking-widest uppercase">{item.name}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[9px] tracking-widest text-white/40 uppercase">
                         <div>SIZE: <span className="text-white">{item.size}</span></div>
                         <div>COLOR: <span className="text-white">{item.color || 'OBSIDIAN'}</span></div>
                         <div>QTY: <span className="text-white">{item.quantity}</span></div>
                         <div>PRICE: <span className="text-white">₹{item.price}</span></div>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. ADDRESS & CONTACT */}
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h4 className="text-[10px] font-bold tracking-[0.5em] text-white/40 uppercase border-l-2 border-white/20 pl-4">DESTINATION NODE</h4>
              <div className="p-8 border border-white/5 bg-white/[0.01] space-y-4">
                 <div className="space-y-1">
                    <p className="text-[8px] text-white/30 tracking-widest uppercase">RECIPIENT</p>
                    <p className="text-xs font-black tracking-widest uppercase">{order.displayName || userName}</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[8px] text-white/30 tracking-widest uppercase">ADDRESS</p>
                    <p className="text-[10px] text-white/80 tracking-widest leading-relaxed uppercase">
                      {order.addressLine1}, {order.landmark && `${order.landmark}, `}{order.city}<br />
                      {order.stateProvince} - {order.postalCode}
                    </p>
                 </div>
              </div>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-bold tracking-[0.5em] text-white/40 uppercase border-l-2 border-white/20 pl-4">CONTACT PROTOCOLS</h4>
              <div className="p-8 border border-white/5 bg-white/[0.01] space-y-6">
                 <div className="space-y-1">
                    <p className="text-[8px] text-white/30 tracking-widest uppercase">COMM CHANNEL (EMAIL)</p>
                    <p className="text-[10px] text-white/80 tracking-widest uppercase font-bold">{order.email}</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[8px] text-white/30 tracking-widest uppercase">UPLINK MODULE (MOBILE)</p>
                    <p className="text-[10px] text-white/80 tracking-widest uppercase font-bold">{order.mobileNumber}</p>
                 </div>
              </div>
            </div>
          </div>

          {/* 3. PAYMENT & TRANSACTION */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold tracking-[0.5em] text-white/40 uppercase border-l-2 border-white/20 pl-4">TRANSACTION AUDIT</h4>
            <div className="p-10 border border-white/5 bg-white/[0.01] grid md:grid-cols-3 gap-10 items-center">
               <div className="space-y-2">
                  <p className="text-[8px] text-white/30 tracking-widest uppercase font-bold">METHOD</p>
                  <div className="flex items-center gap-3 text-white/80">
                     <Zap className="w-4 h-4 text-white/30" />
                     <span className="text-xs font-bold tracking-widest uppercase">{order.paymentMethod || 'RAZORPAY_HYBRID'}</span>
                  </div>
               </div>
               <div className="space-y-2">
                  <p className="text-[8px] text-white/30 tracking-widest uppercase font-bold">VALUATION</p>
                  <p className="text-2xl font-black tracking-tight glow-text">₹{order.totalAmount}</p>
               </div>
               <div className="space-y-2">
                  <p className="text-[8px] text-white/30 tracking-widest uppercase font-bold">TRANSITION_ID</p>
                  <p className="text-[10px] font-mono tracking-widest text-white/40 truncate uppercase">{order.transition_ID || order.paymentProviderId || 'INTERNAL_SYNC'}</p>
               </div>
            </div>
          </div>

          {/* 4. TRACKING & TRANSMISSIONS */}
          <div className="space-y-8">
            <div className="flex items-center justify-between border-l-2 border-white/20 pl-4">
               <h4 className="text-[10px] font-bold tracking-[0.5em] text-white/40 uppercase">SYSTEM TRANSMISSIONS</h4>
               <span className="text-[9px] px-3 py-1 border border-white/10 tracking-widest font-black uppercase text-green-500/60">{order.shippingStatus?.replace(/-/g, ' ')}</span>
            </div>
            
            <div className="space-y-8">
              {order.transmissions?.length > 0 ? (
                order.transmissions.slice().reverse().map((t: any, i: number) => (
                  <div key={i} className="p-8 border border-white/5 bg-white/[0.01] space-y-4">
                    <div className="flex justify-between items-center text-[8px] tracking-widest text-white/30 font-bold uppercase">
                      <span>TRANS_STATUS: {t.status}</span>
                      <span>{new Date(t.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="space-y-3">
                      <p className="text-[11px] text-white/80 leading-relaxed tracking-wide uppercase italic">"{t.content?.smsContent}"</p>
                      <div className="h-px w-8 bg-white/10" />
                      <p className="text-[10px] text-white/50 leading-relaxed tracking-widest uppercase whitespace-pre-line">
                        {t.content?.emailContent}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 border border-dashed border-white/5 flex flex-col items-center gap-6 opacity-30">
                   <Zap className="w-8 h-8 stroke-[0.5px]" />
                   <p className="text-[10px] tracking-[1em] uppercase font-bold text-center px-8 text-white">TRANSMISSION LOGS BUFFERING...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ReviewDialog({ order, userId, userName, db }: { order: any, userId: string, userName: string, db: any }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleReviewSubmit = async () => {
    if (!comment.trim()) {
      toast({ title: "INPUT REQUIRED", description: "FEEDBACK COMMENT CANNOT BE EMPTY." });
      return;
    }
    setLoading(true);
    try {
      await submitReview(db, {
        productId: order.items?.[0]?.productId || 'global_order_review',
        userId,
        userName,
        orderId: order.id,
        rating,
        comment,
        createdAt: new Date().toISOString()
      });
      toast({ title: "FEEDBACK TRANSMITTED", description: "SYSTEM LOG UPDATED." });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-white/30 hover:text-white transition-colors">
          <MessageSquare className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black border-white/20 rounded-none text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold tracking-[0.5em] uppercase mb-4">Transmit Feedback</DialogTitle>
        </DialogHeader>
        <div className="space-y-8">
          <div className="space-y-4">
            <label className="text-[10px] font-bold tracking-widest text-white/40 uppercase">AESTHETIC RATING</label>
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  onClick={() => setRating(star)}
                  className={`transition-all ${star <= rating ? 'text-white' : 'text-white/20'}`}
                >
                  <Star className="w-6 h-6" fill={star <= rating ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-bold tracking-widest text-white/40 uppercase">TRANSMISSION LOG</label>
            <Textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="bg-black/40 border-white/10 rounded-none min-h-[120px] text-[10px] tracking-widest focus:border-white/40 text-white uppercase"
              placeholder="ENTER EXPERIENCE DATA..."
            />
          </div>
          <Button 
            disabled={loading}
            onClick={handleReviewSubmit}
            className="w-full bg-white text-black hover:bg-white/90 h-14 text-[10px] font-bold tracking-[0.4em] rounded-none uppercase"
          >
            {loading ? 'SYNCING...' : 'SYNC FEEDBACK'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EmptyState({ icon, message }: { icon: React.ReactNode, message: string }) {
  return (
    <div className="py-32 flex flex-col items-center justify-center space-y-8 opacity-30 border border-dashed border-white/5">
      <div className="scale-150">{icon}</div>
      <p className="text-[10px] tracking-[1em] uppercase text-center px-6 font-bold">{message}</p>
    </div>
  );
}
