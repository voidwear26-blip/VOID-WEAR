'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc, useAuth } from '@/firebase';
import { collection, query, orderBy, doc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Clock, ShieldCheck, ShoppingBag, Heart, Settings, User as UserIcon, Save, Loader2, Calendar, Zap, Download, Info, Star, MessageSquare, Hash, LogOut, Trash2, Truck, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ProductCard } from '@/components/product-card';
import { initiateSignOut, updateAuthProfile } from '@/firebase/non-blocking-login';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { generateInvoicePDF } from '@/lib/invoice-generator';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { useRouter } from 'next/navigation';
import { submitReview } from '@/firebase/review-actions';
import { cn } from '@/lib/utils';
import { getDelhiveryTracking } from '@/app/actions/tracking';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('account');
  const [saving, setSaving] = useState(false);
  const [isConfirmingIdentity, setIsConfirmingIdentity] = useState(false);

  useEffect(() => {
    // Check if redirecting from a new Google sign-in/registration
    const wasNewReg = typeof window !== 'undefined' ? localStorage.getItem('void_new_reg_confirm') : null;
    if (wasNewReg) {
      setIsConfirmingIdentity(true);
      localStorage.removeItem('void_new_reg_confirm');
    }
  }, []);

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  const isAdmin = useMemo(() => {
    if (!user) return false;
    return user.email?.toLowerCase() === 'voidwear26@gmail.com' || 
           user.uid === 'A9vsqn10oddfmouKiKjWpTcFqZB2' ||
           profile?.role === 'ADMIN';
  }, [user, profile]);

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
        displayName: profile.displayName || user?.displayName || '',
        mobileNumber: profile.mobileNumber || '',
        city: profile.city || '',
        stateProvince: profile.stateProvince || '',
        postalCode: profile.postalCode || '',
        addressLine1: profile.addressLine1 || '',
        landmark: profile.landmark || ''
      });
    } else if (user) {
       // Pre-fill from Google if Firestore doc doesn't exist yet
       setFormData(prev => ({
         ...prev,
         displayName: user.displayName || '',
       }));
    }
  }, [profile, user]);

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

    Promise.all([
      setDoc(userRef, updateData, { merge: true }),
      updateAuthProfile(user, { displayName: formData.displayName })
    ])
      .then(() => {
        toast({ title: "PROFILE UPDATED", description: "ACCOUNT DETAILS SAVED." });
        setIsConfirmingIdentity(false);
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
      toast({ title: "LOGGED OUT", description: "SESSION ENDED." });
      router.push('/');
    } catch (e) {
      console.error(e);
    }
  };

  const isDossierIncomplete = !formData.mobileNumber || !formData.addressLine1 || !formData.city;

  if (isUserLoading || (user && isProfileLoading)) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-black/40" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-8 bg-background">
        <h2 className="text-xl font-bold tracking-[0.5em] text-black uppercase font-headline">ACCESS DENIED</h2>
        <Link href="/login">
          <button className="px-12 py-4 border border-black/20 text-[10px] tracking-[0.5em] hover:bg-black hover:text-white transition-all font-bold uppercase">LOGIN</button>
        </Link>
      </div>
    );
  }

  const displayTitle = formData.displayName || profile?.displayName || user.email?.split('@')[0].toUpperCase() || 'USER';

  return (
    <div className="pt-48 pb-32 bg-transparent min-h-screen text-black font-body">
      <div className="container mx-auto px-6 md:px-10">
        
        <AnimatePresence>
          {isConfirmingIdentity && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-16 overflow-hidden"
            >
              <div className="bg-black text-white p-10 border border-black/10 flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur-3xl shadow-2xl">
                 <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-white/10 border border-white/20 flex items-center justify-center rounded-full">
                       <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="space-y-1">
                       <h3 className="text-sm font-black tracking-[0.3em] uppercase">IDENTITY_LINKED</h3>
                       <p className="text-[9px] tracking-[0.2em] text-white/60 uppercase">Data retrieved from Google. Please confirm your details below.</p>
                    </div>
                 </div>
                 <Button onClick={() => setIsConfirmingIdentity(false)} variant="ghost" className="text-[10px] tracking-[0.4em] font-bold uppercase text-white/40 hover:text-white hover:bg-white/5">DISMISS</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-4 gap-16 md:gap-24 items-start">
          <div className="space-y-12 lg:sticky lg:top-48">
            <div className="space-y-6">
              <div className="relative group w-20 h-20 mx-auto lg:mx-0 cursor-pointer" onClick={handleLogout} title="CLICK TO LOGOUT">
                 <div className="absolute inset-0 bg-black/5 border border-black/10 flex items-center justify-center group-hover:bg-red-500/10 group-hover:border-red-500/50 transition-all">
                    <LogOut className="w-6 h-6 text-black/60 group-hover:text-red-500" />
                 </div>
              </div>
              <div className="space-y-2 text-center lg:text-left">
                <span className="text-[10px] font-bold tracking-[0.8em] text-black/60 uppercase">MY PROFILE</span>
                <h1 className="text-4xl font-black tracking-tight uppercase leading-none break-all font-headline">
                  {displayTitle}
                </h1>
                <p className="text-black/60 tracking-[0.2em] text-[10px] uppercase font-mono">ID: {user.uid.slice(0, 12)}...</p>
              </div>
            </div>

            {isAdmin && (
              <Link href="/admin">
                <Button className="w-full bg-black text-white hover:bg-black/90 rounded-none h-14 text-[10px] font-bold tracking-[0.4em] shadow-[0_0_20px_rgba(0,0,0,0.1)] uppercase">
                  <Settings className="w-4 h-4 mr-3" /> ADMIN DASHBOARD
                </Button>
              </Link>
            )}

            <div className="p-8 border border-black/5 bg-black/[0.01] space-y-6 backdrop-blur-sm">
              <div className="flex items-center gap-4 text-black/80">
                <ShieldCheck className={`w-4 h-4 ${isAdmin ? 'text-black shadow-[0_0_10px_rgba(0,0,0,0.1)]' : 'text-black/40'}`} />
                <span className="text-[9px] tracking-[0.3em] uppercase font-bold">ROLE: {isAdmin ? 'ADMIN' : 'CUSTOMER'}</span>
              </div>
              <div className="flex items-center gap-4 text-black/80">
                <Calendar className="w-4 h-4 text-black/40" />
                <span className="text-[9px] tracking-[0.3em] uppercase font-bold">MEMBER SINCE: {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
            
            <nav className="flex flex-col gap-4 text-[10px] tracking-[0.5em] uppercase font-bold text-black/60">
              {[
                { id: 'account', label: 'ACCOUNT', icon: <UserIcon className="w-3.5 h-3.5" /> },
                { id: 'orders', label: 'MY ORDERS', icon: <Package className="w-3.5 h-3.5" /> },
                { id: 'wishlist', label: 'WISHLIST', icon: <Heart className="w-3.5 h-3.5" /> }
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-4 transition-all duration-300 py-3 ${activeTab === tab.id ? 'text-black pl-4 border-l border-black' : 'hover:text-black/80'}`}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === 'account' && (
                <motion.div key="account" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
                  <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-black/5 pb-8 gap-6">
                    <div className="space-y-2">
                       <h2 className="text-xs font-bold tracking-[0.5em] uppercase text-black/80">ACCOUNT INFORMATION</h2>
                       <p className="text-[8px] tracking-[0.2em] text-black/40 uppercase font-black">Sync Source: {user.providerData[0]?.providerId === 'google.com' ? 'GOOGLE_UPLINK' : 'DIRECT_ENTRY'}</p>
                    </div>
                    {isDossierIncomplete && (
                      <div className="flex items-center gap-3 bg-red-500/5 border border-red-500/10 px-4 py-2">
                         <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                         <span className="text-[8px] font-black tracking-widest text-red-600 uppercase">DOSSIER_INCOMPLETE</span>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleUpdateProfile} className="bg-black/[0.01] border border-black/5 p-10 space-y-10 backdrop-blur-xl">
                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold tracking-[0.4em] text-black/60 uppercase">FULL NAME</label>
                        <Input value={formData.displayName} onChange={e => setFormData({ ...formData, displayName: e.target.value.toUpperCase() })} className="bg-white border-black/10 rounded-none h-14 text-[10px] tracking-widest focus:border-black/40 text-black uppercase" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold tracking-[0.4em] text-black/60 uppercase">MOBILE NUMBER</label>
                        <Input required value={formData.mobileNumber} onChange={e => setFormData({ ...formData, mobileNumber: e.target.value })} className={cn("bg-white border-black/10 rounded-none h-14 text-[10px] tracking-widest focus:border-black/40 text-black", !formData.mobileNumber && "border-red-500/30")} placeholder="+91 XXXX XXX XXX" />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold tracking-[0.4em] text-black/60 uppercase">CITY</label>
                        <Input required value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value.toUpperCase() })} className="bg-white border-black/10 rounded-none h-14 text-[10px] tracking-widest focus:border-black/40 text-black uppercase" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold tracking-[0.4em] text-black/60 uppercase">STATE</label>
                        <Input required value={formData.stateProvince} onChange={e => setFormData({ ...formData, stateProvince: e.target.value.toUpperCase() })} className="bg-white border-black/10 rounded-none h-14 text-[10px] tracking-widest focus:border-black/40 text-black uppercase" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold tracking-[0.4em] text-black/60 uppercase">PINCODE</label>
                        <Input required value={formData.postalCode} onChange={e => setFormData({ ...formData, postalCode: e.target.value })} className="bg-white border-black/10 rounded-none h-14 text-[10px] tracking-widest focus:border-black/40 text-black" />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold tracking-[0.4em] text-black/60 uppercase">ADDRESS</label>
                        <Input required value={formData.addressLine1} onChange={e => setFormData({ ...formData, addressLine1: e.target.value.toUpperCase() })} className="bg-white border-black/10 rounded-none h-14 text-[10px] tracking-widest focus:border-black/40 text-black uppercase" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold tracking-[0.4em] text-black/60 uppercase">LANDMARK</label>
                        <Input value={formData.landmark} onChange={e => setFormData({ ...formData, landmark: e.target.value.toUpperCase() })} className="bg-white border-black/10 rounded-none h-14 text-[10px] tracking-widest focus:border-black/40 text-black uppercase" />
                      </div>
                    </div>

                    <Button type="submit" disabled={saving} className="w-full bg-black text-white hover:bg-black/90 h-16 text-[10px] font-bold tracking-[0.5em] rounded-none uppercase">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <>CONFIRM DIGITAL ENTITY <Save className="ml-3 w-4 h-4" /></>}
                    </Button>
                  </form>
                </motion.div>
              )}

              {activeTab === 'orders' && (
                <motion.div key="orders" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
                  <div className="flex items-center justify-between border-b border-black/5 pb-8">
                    <h2 className="text-xs font-bold tracking-[0.5em] uppercase text-black/80">ORDER HISTORY</h2>
                    <span className="text-[10px] text-black/60 font-bold uppercase">{orders?.length || 0} RECORDS</span>
                  </div>
                  <div className="space-y-8">
                    {orders?.map((order) => <OrderCard key={order.id} order={order} userId={user.uid} userName={displayTitle} db={db} />)}
                    {orders?.length === 0 && <EmptyState icon={<ShoppingBag />} message="NO ORDERS FOUND" />}
                  </div>
                </motion.div>
              )}

              {activeTab === 'wishlist' && (
                <motion.div key="wishlist" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
                  <div className="flex items-center justify-between border-b border-black/5 pb-8">
                    <h2 className="text-xs font-bold tracking-[0.5em] uppercase text-black/80">WISHLIST</h2>
                    <span className="text-[10px] text-black/60 font-bold uppercase">{wishlistItems?.length || 0} ITEMS</span>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {wishlistItems?.map(item => <ProductCard key={item.id} product={{ id: item.productId, name: item.name, basePrice: item.price, imageUrls: [item.image], category: item.category, description: '', slug: '' } as any} />)}
                    {wishlistItems?.length === 0 && <div className="sm:col-span-2 lg:col-span-3"><EmptyState icon={<Heart />} message="WISHLIST IS EMPTY" /></div>}
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

function EmptyState({ icon, message }: { icon: React.ReactNode, message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center space-y-8 opacity-60 border border-dashed border-black/10">
      <div className="w-16 h-16 stroke-[0.5px]">
        {icon}
      </div>
      <p className="text-[10px] tracking-[1em] uppercase font-bold text-black">{message}</p>
    </div>
  );
}

function OrderCard({ order, userId, userName, db }: { order: any, userId: string, userName: string, db: any }) {
  const { toast } = useToast();
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [trackingOpen, setTrackingOpen] = useState(false);

  const handleDownload = () => {
    generateInvoicePDF(order);
    toast({ title: "INVOICE DOWNLOADED", description: "ORDER RECORD SAVED AS PDF." });
  };

  const handleTrackOrder = async () => {
    if (!order.trackingId) return;
    setTrackingLoading(true);
    setTrackingOpen(true);
    try {
      const data = await getDelhiveryTracking(order.trackingId);
      if (data.success) {
        setTrackingData(data);
      } else {
        toast({ variant: "destructive", title: "TRACKING ERROR", description: data.message });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "UPLINK FAILURE" });
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleReviewSubmit = async (productId: string, productName: string) => {
    if (!db || !userId) return;
    if (!reviewComment.trim()) {
      toast({ variant: "destructive", title: "INCOMPLETE", description: "PLEASE ENTER A REVIEW." });
      return;
    }

    setSubmittingReview(true);
    try {
      await submitReview(db, {
        productId,
        productName,
        userId,
        userName: userName,
        rating: reviewRating,
        comment: reviewComment,
        createdAt: new Date().toISOString(),
        orderId: order.id
      });
      toast({ title: "REVIEW SUBMITTED", description: `FEEDBACK SAVED FOR ${productName.toUpperCase()}.` });
      setReviewComment('');
      setReviewOpen(false);
    } catch (e) {
      toast({ variant: "destructive", title: "SUBMISSION FAILURE" });
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="bg-black/[0.02] border border-black/10 p-8 md:p-10 space-y-8 backdrop-blur-xl group hover:border-black/20 transition-all duration-500 text-black">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-black/5 pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Hash className="w-4 h-4 text-black/60" />
            <span className="text-[11px] font-black tracking-widest text-black uppercase">{order.order_ID || order.id}</span>
          </div>
          <div className="flex flex-wrap gap-8">
             <div className="space-y-1">
                <p className="text-[8px] tracking-widest text-black/60 uppercase font-bold">DATE</p>
                <p className="text-[10px] text-black/90 font-mono">{new Date(order.orderDate).toLocaleDateString()}</p>
             </div>
             <div className="space-y-1">
                <p className="text-[8px] tracking-widest text-black/60 uppercase font-bold">TOTAL PRICE</p>
                <p className="text-[10px] text-black font-black">₹{order.totalAmount}</p>
             </div>
             <div className="space-y-1">
                <p className="text-[8px] tracking-widest text-black/60 uppercase font-bold">STATUS</p>
                <div className="flex items-center gap-2">
                   <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", order.shippingStatus === 'delivered' ? 'bg-green-500' : 'bg-black/60')} />
                   <p className="text-[10px] text-black uppercase tracking-widest font-black">{order.shippingStatus || 'PROCESSING'}</p>
                </div>
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          {order.trackingId && (
            <Dialog open={trackingOpen} onOpenChange={setTrackingOpen}>
               <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    onClick={handleTrackOrder}
                    className="h-12 flex-1 md:flex-none border-black/10 bg-black text-white hover:bg-black/90 rounded-none text-[9px] font-bold tracking-[0.4em] uppercase transition-all"
                  >
                    TRACK ORDER <Truck className="ml-3 w-3.5 h-3.5" />
                  </Button>
               </DialogTrigger>
               <DialogContent className="bg-background border border-black/10 p-10 max-w-lg">
                  <DialogHeader className="space-y-4 mb-8">
                    <DialogTitle className="text-xl font-black tracking-tight uppercase">Courier Tracking</DialogTitle>
                    <DialogDescription className="text-[9px] tracking-widest uppercase text-black/60 font-bold">
                       WAYBILL: {order.trackingId}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-8">
                     {trackingLoading ? (
                       <div className="py-12 flex flex-col items-center justify-center gap-6 opacity-40">
                          <Loader2 className="w-8 h-8 animate-spin" />
                          <p className="text-[9px] tracking-[0.5em] uppercase">LINKING_COURIER_NODE...</p>
                       </div>
                     ) : trackingData ? (
                       <div className="space-y-10">
                          <div className="p-8 border border-black/5 bg-black/[0.02] space-y-6">
                             <div className="flex justify-between items-center border-b border-black/5 pb-4">
                                <span className="text-[8px] font-black tracking-widest uppercase text-black/40">CURRENT STATUS</span>
                                <span className="text-[10px] font-black tracking-widest uppercase text-black">{trackingData.status}</span>
                             </div>
                             <div className="flex justify-between items-center border-b border-black/5 pb-4">
                                <span className="text-[8px] font-black tracking-widest uppercase text-black/40">LOCATION</span>
                                <span className="text-[10px] font-black tracking-widest uppercase text-black">{trackingData.location}</span>
                             </div>
                             {trackingData.expectedDate && (
                               <div className="flex justify-between items-center">
                                  <span className="text-[8px] font-black tracking-widest uppercase text-black/40">EXPECTED DELIVERY</span>
                                  <span className="text-[10px] font-black tracking-widest uppercase text-green-600">{new Date(trackingData.expectedDate).toLocaleDateString()}</span>
                               </div>
                             )}
                          </div>
                          <p className="text-[8px] text-black/40 tracking-widest uppercase italic leading-relaxed text-center">
                             REAL-TIME SCAN DATA PROVIDED BY DELHIVERY SYSTEMS.
                          </p>
                       </div>
                     ) : (
                       <div className="py-12 text-center opacity-40">
                          <p className="text-[9px] tracking-widest uppercase">WAYBILL NOT DETECTED IN COURIER ARCHIVE.</p>
                       </div>
                     )}
                  </div>
                  <DialogFooter className="mt-8">
                     <Button onClick={() => setTrackingOpen(false)} className="w-full h-14 bg-black text-white hover:bg-black/90 rounded-none text-[10px] font-black tracking-[0.4em] uppercase">CLOSE ARCHIVE</Button>
                  </DialogFooter>
               </DialogContent>
            </Dialog>
          )}
          <Button 
            variant="outline" 
            onClick={handleDownload}
            className="h-12 flex-1 md:flex-none border-black/10 bg-black/5 hover:bg-black hover:text-white rounded-none text-[9px] font-bold tracking-[0.4em] uppercase transition-all"
          >
            INVOICE <Download className="ml-3 w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {order.items?.map((item: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between group/item">
            <div className="flex items-center gap-6">
              <div className="relative w-12 h-16 bg-black/5 border border-black/10 overflow-hidden shrink-0">
                <Image src={item.image || 'https://picsum.photos/seed/void/200/300'} alt={item.name} fill className="object-cover grayscale" unoptimized />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold tracking-widest uppercase text-black">{item.name}</p>
                <p className="text-[8px] text-black/60 tracking-widest uppercase">SZ: {item.size} // QTY: {item.quantity}</p>
              </div>
            </div>
            
            {order.shippingStatus === 'delivered' && (
              <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="h-10 text-[8px] tracking-[0.4em] font-black text-black/60 hover:text-black uppercase transition-all">
                    LEAVE A REVIEW <MessageSquare className="ml-2 w-3 h-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white border border-black/10 p-10 max-w-lg">
                  <DialogHeader className="space-y-4 mb-8">
                    <DialogTitle className="text-xl font-black tracking-tight uppercase text-black font-headline">Submit Review</DialogTitle>
                    <DialogDescription className="text-[9px] tracking-widest uppercase text-black/60 leading-relaxed font-bold">
                      TELL US WHAT YOU THINK ABOUT THE {item.name.toUpperCase()}.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-10">
                    <div className="space-y-4">
                      <label className="text-[9px] font-bold tracking-widest text-black/60 uppercase">RATING</label>
                      <div className="flex gap-4">
                        {[1,2,3,4,5].map((s) => (
                          <button key={s} onClick={() => setReviewRating(s)} className="transition-transform hover:scale-125">
                            <Star className={cn("w-5 h-5", reviewRating >= s ? "text-[#facc15] fill-current" : "text-black/10")} />
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <label className="text-[9px] font-bold tracking-widest text-black/60 uppercase">COMMENT</label>
                      <Textarea 
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="YOUR FEEDBACK..."
                        className="bg-black/5 border-black/10 rounded-none h-32 text-[10px] tracking-widest focus:border-black/40 text-black uppercase placeholder:text-black/20"
                      />
                    </div>
                    
                    <Button 
                      disabled={submittingReview}
                      onClick={() => handleReviewSubmit(item.productId, item.name)}
                      className="w-full h-14 bg-black text-white hover:bg-black/90 rounded-none text-[10px] font-black tracking-[0.4em] uppercase"
                    >
                      {submittingReview ? <Loader2 className="animate-spin w-4 h-4" /> : <>SAVE REVIEW <Zap className="ml-3 w-4 h-4" /></>}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
