'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc, useAuth } from '@/firebase';
import { collection, query, orderBy, doc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Clock, ShieldCheck, ShoppingBag, Heart, Settings, User as UserIcon, Save, Loader2, Calendar, Zap, Download, Info, Star, MessageSquare, Hash, LogOut, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ProductCard } from '@/components/product-card';
import { saveUserToFirestore } from '@/firebase/user-actions';
import { initiateSignOut } from '@/firebase/non-blocking-login';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { generateInvoicePDF } from '@/lib/invoice-generator';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { useRouter } from 'next/navigation';
import { submitReview } from '@/firebase/review-actions';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
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
        toast({ title: "IDENTITY UPDATED", description: "SYSTEM METADATA SYNCHRONIZED." });
      })
      .catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: userRef.path,
          operation: 'update',
          requestResourceData: updateData,
        } satisfies SecurityRuleContext));
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const handleLogout = async () => {
    try {
      await initiateSignOut(auth);
      toast({ title: "LINK SEVERED", description: "LOGGED OUT SUCCESSFULLY." });
      router.push('/');
    } catch (e) {
      console.error(e);
    }
  };

  const isAdmin = user?.email?.toLowerCase() === 'voidwear26@gmail.com';

  if (isUserLoading || (user && isProfileLoading)) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-10 h-10 animate-spin text-white/20" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-8 bg-black">
        <h2 className="text-xl font-bold tracking-[0.5em] glow-text text-white uppercase">ACCESS DENIED</h2>
        <Link href="/login">
          <button className="px-12 py-4 border border-white/20 text-[10px] tracking-[0.5em] hover:bg-white hover:text-black transition-all font-bold uppercase">ESTABLISH LINK</button>
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
              <div className="relative group w-20 h-20 mx-auto lg:mx-0 cursor-pointer" onClick={handleLogout} title="CLICK TO LOGOUT">
                 <div className="absolute inset-0 bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-red-500/10 group-hover:border-red-500/50 transition-all">
                    <LogOut className="w-6 h-6 text-white/40 group-hover:text-red-500" />
                 </div>
              </div>
              <div className="space-y-2 text-center lg:text-left">
                <span className="text-[10px] font-bold tracking-[0.8em] text-white/40 uppercase">ENTITY // PROFILE</span>
                <h1 className="text-4xl font-black tracking-tight glow-text uppercase leading-none break-all">
                  {profile?.displayName || user.email?.split('@')[0].toUpperCase()}
                </h1>
                <p className="text-white/30 tracking-[0.2em] text-[10px] uppercase font-mono">UID: {user.uid.slice(0, 12)}...</p>
              </div>
            </div>

            {isAdmin && (
              <Link href="/admin">
                <Button className="w-full bg-white text-black hover:bg-white/90 rounded-none h-14 text-[10px] font-bold tracking-[0.4em] shadow-[0_0_20px_rgba(255,255,255,0.1)] uppercase">
                  <Settings className="w-4 h-4 mr-3" /> COMMAND CENTER
                </Button>
              </Link>
            )}

            <div className="p-8 border border-white/5 bg-white/[0.01] space-y-6 backdrop-blur-sm">
              <div className="flex items-center gap-4 text-white/60">
                <ShieldCheck className={`w-4 h-4 ${isAdmin ? 'text-white shadow-[0_0_10px_white]' : 'text-white/30'}`} />
                <span className="text-[9px] tracking-[0.3em] uppercase font-bold">ACCESS: {isAdmin ? 'ADMIN' : 'OPERATOR'}</span>
              </div>
              <div className="flex items-center gap-4 text-white/60">
                <Calendar className="w-4 h-4 text-white/30" />
                <span className="text-[9px] tracking-[0.3em] uppercase font-bold">JOINED: {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'INITIALIZING...'}</span>
              </div>
            </div>
            
            <nav className="flex flex-col gap-4 text-[10px] tracking-[0.5em] uppercase font-bold text-white/30">
              {[
                { id: 'identity', label: 'IDENTITY', icon: <UserIcon className="w-3.5 h-3.5" /> },
                { id: 'orders', label: 'TRANSMISSIONS', icon: <Package className="w-3.5 h-3.5" /> },
                { id: 'wishlist', label: 'STASIS', icon: <Heart className="w-3.5 h-3.5" /> }
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-4 transition-all duration-300 py-3 ${activeTab === tab.id ? 'text-white pl-4 border-l border-white' : 'hover:text-white/60'}`}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === 'identity' && (
                <motion.div key="identity" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
                  <div className="flex items-center justify-between border-b border-white/5 pb-8">
                    <h2 className="text-xs font-bold tracking-[0.5em] uppercase text-white/60">ENTITY IDENTITY</h2>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="bg-white/[0.01] border border-white/5 p-10 space-y-10 backdrop-blur-xl">
                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">FULL IDENTIFIER</label>
                        <Input value={formData.displayName} onChange={e => setFormData({ ...formData, displayName: e.target.value.toUpperCase() })} className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest focus:border-white/40 text-white uppercase" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">UPLINK MODULE (MOBILE)</label>
                        <Input value={formData.mobileNumber} onChange={e => setFormData({ ...formData, mobileNumber: e.target.value })} className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest focus:border-white/40 text-white" placeholder="+91 XXXX XXX XXX" />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">CITY</label>
                        <Input value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value.toUpperCase() })} className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest text-white uppercase" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">STATE</label>
                        <Input value={formData.stateProvince} onChange={e => setFormData({ ...formData, stateProvince: e.target.value.toUpperCase() })} className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest text-white uppercase" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">PINCODE</label>
                        <Input value={formData.postalCode} onChange={e => setFormData({ ...formData, postalCode: e.target.value })} className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest text-white" />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">PRIMARY ADDRESS NODE</label>
                        <Input value={formData.addressLine1} onChange={e => setFormData({ ...formData, addressLine1: e.target.value.toUpperCase() })} className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest text-white uppercase" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">LANDMARK</label>
                        <Input value={formData.landmark} onChange={e => setFormData({ ...formData, landmark: e.target.value.toUpperCase() })} className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest text-white uppercase" placeholder="E.G. NEAR ORBITAL TOWER" />
                      </div>
                    </div>

                    <Button type="submit" disabled={saving} className="w-full bg-white text-black hover:bg-white/90 h-16 text-[10px] font-bold tracking-[0.5em] rounded-none uppercase">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <>SYNC IDENTITY LOGS <Save className="ml-3 w-4 h-4" /></>}
                    </Button>
                  </form>
                </motion.div>
              )}

              {activeTab === 'orders' && (
                <motion.div key="orders" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
                  <div className="flex items-center justify-between border-b border-white/5 pb-8">
                    <h2 className="text-xs font-bold tracking-[0.5em] uppercase text-white/60">TRANSMISSION HISTORY</h2>
                    <span className="text-[10px] text-white/30 font-bold uppercase">{orders?.length || 0} LOGS</span>
                  </div>
                  <div className="space-y-8">
                    {orders?.map((order) => <OrderCard key={order.id} order={order} userId={user.uid} userName={profile?.displayName || 'OPERATOR'} db={db} />)}
                    {orders?.length === 0 && <EmptyState icon={<ShoppingBag />} message="NO TRANSMISSIONS LOGGED" />}
                  </div>
                </motion.div>
              )}

              {activeTab === 'wishlist' && (
                <motion.div key="wishlist" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
                  <div className="flex items-center justify-between border-b border-white/5 pb-8">
                    <h2 className="text-xs font-bold tracking-[0.5em] uppercase text-white/60">STASIS MODULES</h2>
                    <span className="text-[10px] text-white/30 font-bold uppercase">{wishlistItems?.length || 0} ITEMS</span>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {wishlistItems?.map(item => <ProductCard key={item.id} product={{ id: item.productId, name: item.name, basePrice: item.price, imageUrls: [item.image], category: item.category, description: '', slug: '' } as any} />)}
                    {wishlistItems?.length === 0 && <div className="sm:col-span-2 lg:col-span-3"><EmptyState icon={<Heart />} message="STASIS IS EMPTY" /></div>}
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
  return (
    <div className="border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] p-8 md:p-10 space-y-10 transition-all group">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <Package className="w-4 h-4 text-white/30" />
            <div className="flex flex-col gap-1">
               <div className="flex items-center gap-2">
                  <Hash className="w-3 h-3 text-white/20" />
                  <span className="text-[10px] font-black tracking-widest uppercase font-mono text-white">ORDER_ID: {order.order_ID || order.id}</span>
               </div>
               <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-white/20" />
                  <span className="text-[8px] font-bold tracking-widest uppercase text-white/40">TRANSITION_ID: {order.transition_ID || 'INTERNAL_TX'}</span>
               </div>
            </div>
            <span className={`text-[8px] px-3 py-1 border tracking-[0.2em] uppercase font-black ${order.shippingStatus === 'delivered' ? 'border-green-500/50 text-green-500' : 'border-white/10 text-white/60'}`}>{order.shippingStatus || 'PROCESSING'}</span>
          </div>
          <p className="text-[8px] text-white/20 tracking-widest uppercase font-bold">TRANSMITTED: {new Date(order.orderDate).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-right">
             <p className="text-[12px] font-black glow-text text-white">₹{order.totalAmount}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => { generateInvoicePDF(order); toast({ title: "LOG DOWNLOADED" }); }} className="text-white/20 hover:text-white hover:bg-white/5 rounded-none">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-6 pt-6 border-t border-white/5">
         <h4 className="text-[8px] font-bold tracking-[0.4em] text-white/30 uppercase">MODULES & FIELD REPORTS</h4>
         <div className="grid gap-6">
            {order.items?.map((item: any, idx: number) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white/[0.01] border border-white/5 p-6 group/item">
                 <div className="flex items-center gap-6">
                    <div className="relative w-12 aspect-[3/4] bg-white/5 border border-white/10 overflow-hidden">
                       <Image src={item.image} alt={item.name} fill className="object-cover grayscale" unoptimized />
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] font-bold tracking-widest uppercase text-white/80">{item.name}</p>
                       <p className="text-[8px] text-white/40 tracking-widest uppercase">SZ: {item.size} // QTY: {item.quantity}</p>
                    </div>
                 </div>
                 <ReviewDialog productId={item.productId} productName={item.name} userId={userId} userName={userName} db={db} />
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}

function ReviewDialog({ productId, productName, userId, userName, db }: { productId: string, productName: string, userId: string, userName: string, db: any }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleReviewSubmit = async () => {
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await submitReview(db, {
        productId,
        userId,
        userName,
        orderId: 'VERIFIED_TRANSMISSION',
        rating,
        comment,
        createdAt: new Date().toISOString()
      });
      toast({ title: "REPORT LOGGED", description: "FIELD DATA SYNCED SUCCESSFULLY." });
      setOpen(false);
    } catch (e) {
      toast({ variant: "destructive", title: "UPLINK FAILURE" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-10 border-white/10 text-[9px] tracking-[0.3em] font-black rounded-none uppercase hover:bg-white hover:text-black transition-all">
          LOG FIELD REPORT <MessageSquare className="ml-2 w-3 h-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black border border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold tracking-[0.5em] uppercase text-white/80">FIELD REPORT Protocol</DialogTitle>
          <DialogDescription className="text-[9px] tracking-widest uppercase text-white/40 font-medium">
             MODULE: {productName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-8 pt-6">
          <div className="space-y-4">
             <label className="text-[9px] font-bold tracking-[0.4em] text-white/40 uppercase">AESTHETIC CALIBRATION (STARS)</label>
             <div className="flex gap-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    className="transition-all hover:scale-125 focus:outline-none"
                  >
                    <Star 
                      className={`w-6 h-6 ${rating >= s ? 'text-white fill-current' : 'text-white/10'}`} 
                    />
                  </button>
                ))}
             </div>
          </div>
          <div className="space-y-4">
             <label className="text-[9px] font-bold tracking-[0.4em] text-white/40 uppercase">NARRATIVE PERFORMANCE DATA</label>
             <Textarea
               value={comment}
               onChange={(e) => setComment(e.target.value)}
               placeholder="INPUT DATA..."
               className="bg-white/[0.02] border-white/10 rounded-none min-h-[120px] text-[10px] tracking-widest focus:border-white/40 text-white uppercase"
             />
          </div>
          <Button disabled={submitting || !comment.trim()} onClick={handleReviewSubmit} className="w-full bg-white text-black hover:bg-white/90 h-14 text-[10px] font-black tracking-[0.5em] rounded-none">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>TRANSMIT REPORT <Zap className="ml-3 w-3.5 h-3.5" /></>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EmptyState({ icon, message }: any) {
  return (
    <div className="py-32 flex flex-col items-center justify-center space-y-8 opacity-30 border border-dashed border-white/5">
      <div className="scale-150">{icon}</div>
      <p className="text-[10px] tracking-[1em] uppercase font-bold">{message}</p>
    </div>
  );
}
