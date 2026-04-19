
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, orderBy, doc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Clock, ShieldCheck, ShoppingBag, Heart, FileText, Settings, Star, MessageSquare, User as UserIcon, Save, Loader2, ExternalLink, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ProductCard } from '@/components/product-card';
import { submitReview } from '@/firebase/review-actions';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('identity');
  const [saving, setSaving] = useState(false);

  // Firestore User Profile
  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  // Transmissions (Orders)
  const ordersQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'orders'),
      orderBy('createdAt', 'desc')
    );
  }, [db, user]);

  // Stasis (Wishlist)
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

  // Neural Sync: Initialize or handle missing join date
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

      // Auto-initialize join date if missing (legacy recovery)
      if (!profile.createdAt && db && user) {
        setDoc(doc(db, 'users', user.uid), {
          createdAt: new Date().toISOString()
        }, { merge: true });
      }
    }
  }, [profile, db, user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user) return;

    setSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        ...formData,
        email: user.email,
        uid: user.uid,
        updatedAt: new Date().toISOString(),
        // Ensure createdAt is never overwritten by manual saves
        ...(profile?.createdAt ? {} : { createdAt: new Date().toISOString() })
      }, { merge: true });
      
      toast({
        title: "IDENTITY UPDATED",
        description: "SYSTEM METADATA SYNCHRONIZED.",
      });
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "UPLINK ERROR",
        description: "COULD NOT SYNC IDENTITY CHANGES.",
      });
    } finally {
      setSaving(false);
    }
  };

  const isAdmin = user?.email?.toLowerCase() === 'voidwear26@gmail.com';

  if (isUserLoading || (user && isProfileLoading)) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="w-10 h-10 animate-spin text-white/40" />
          <div className="text-[10px] tracking-[1em] text-white/80 uppercase font-bold">Syncing Profile...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-8">
        <h2 className="text-xl font-bold tracking-[0.5em] glow-text text-white">ACCESS DENIED</h2>
        <p className="text-[10px] text-white/60 tracking-[0.3em] font-bold">PLEASE INITIALIZE AUTHENTICATION</p>
        <Link href="/login">
          <button className="px-12 py-4 border border-white/30 text-[10px] tracking-[0.5em] hover:bg-white hover:text-black transition-all font-bold uppercase">
            ESTABLISH LINK
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-48 pb-32 bg-transparent min-h-screen">
      <div className="container mx-auto px-6 md:px-10">
        <div className="grid lg:grid-cols-4 gap-16 md:gap-24 items-start">
          <div className="space-y-12 lg:sticky lg:top-48">
            <div className="space-y-6">
              <span className="text-[10px] font-bold tracking-[0.8em] text-white/50 uppercase">ENTITY // PROFILE</span>
              <h1 className="text-4xl font-black tracking-tight glow-text uppercase leading-none break-all text-white">
                {profile?.displayName || user.email?.split('@')[0]}
              </h1>
              <p className="text-white/60 tracking-[0.2em] text-[10px] uppercase font-mono">
                UID: {user.uid.slice(0, 12)}...
              </p>
            </div>

            {isAdmin && (
              <Link href="/admin">
                <Button className="w-full bg-white text-black hover:bg-white/90 rounded-none h-14 text-[10px] font-bold tracking-[0.4em] mb-8 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  <Settings className="w-4 h-4 mr-3" />
                  COMMAND CENTER
                </Button>
              </Link>
            )}

            <div className="p-8 border border-white/10 bg-white/[0.02] space-y-6 backdrop-blur-sm">
              <div className="flex items-center gap-4 text-white/80">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[9px] tracking-[0.3em] uppercase font-bold">ACCESS: {isAdmin ? 'ADMIN' : 'OPERATOR'}</span>
              </div>
              <div className="flex items-center gap-4 text-white/80">
                <Calendar className="w-4 h-4" />
                <span className="text-[9px] tracking-[0.3em] uppercase font-bold">
                  JOINED: {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'INITIALIZING...'}
                </span>
              </div>
              <div className="flex items-center gap-4 text-white/80">
                <Clock className="w-4 h-4" />
                <span className="text-[9px] tracking-[0.3em] uppercase font-bold">STATUS: ACTIVE</span>
              </div>
            </div>
            
            <nav className="flex flex-col gap-4 text-[10px] tracking-[0.5em] uppercase font-bold text-white/60">
              {[
                { id: 'identity', label: 'IDENTITY', icon: <UserIcon className="w-3.5 h-3.5" /> },
                { id: 'orders', label: 'TRANSMISSIONS', icon: <Package className="w-3.5 h-3.5" /> },
                { id: 'wishlist', label: 'STASIS', icon: <Heart className="w-3.5 h-3.5" /> }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-4 transition-all duration-300 py-3 ${activeTab === tab.id ? 'text-white pl-4 border-l border-white' : 'hover:text-white/80'}`}
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
                  <div className="flex items-center justify-between border-b border-white/10 pb-8">
                    <h2 className="text-xs font-bold tracking-[0.5em] uppercase text-white/80">ENTITY IDENTITY</h2>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="bg-white/[0.02] border border-white/10 p-10 space-y-10 backdrop-blur-xl">
                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold tracking-[0.4em] text-white/80 uppercase">FULL IDENTIFIER</label>
                        <Input 
                          value={formData.displayName}
                          onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                          className="bg-black/40 border-white/20 rounded-none h-14 text-[10px] tracking-widest focus:border-white/60 text-white uppercase"
                          placeholder="ENTER NAME"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold tracking-[0.4em] text-white/80 uppercase">CONTACT PROTOCOL</label>
                        <Input 
                          value={formData.mobileNumber}
                          onChange={e => setFormData({ ...formData, mobileNumber: e.target.value })}
                          className="bg-black/40 border-white/20 rounded-none h-14 text-[10px] tracking-widest focus:border-white/60 text-white"
                          placeholder="+91 XXXX XXX XXX"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold tracking-[0.4em] text-white/80 uppercase">CITY</label>
                        <Input 
                          value={formData.city}
                          onChange={e => setFormData({ ...formData, city: e.target.value })}
                          className="bg-black/40 border-white/20 rounded-none h-14 text-[10px] tracking-widest focus:border-white/60 text-white uppercase"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold tracking-[0.4em] text-white/80 uppercase">STATE</label>
                        <Input 
                          value={formData.stateProvince}
                          onChange={e => setFormData({ ...formData, stateProvince: e.target.value })}
                          className="bg-black/40 border-white/20 rounded-none h-14 text-[10px] tracking-widest focus:border-white/60 text-white uppercase"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold tracking-[0.4em] text-white/80 uppercase">PINCODE</label>
                        <Input 
                          value={formData.postalCode}
                          onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                          className="bg-black/40 border-white/20 rounded-none h-14 text-[10px] tracking-widest focus:border-white/60 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold tracking-[0.4em] text-white/80 uppercase">PRIMARY ADDRESS</label>
                        <Input 
                          value={formData.addressLine1}
                          onChange={e => setFormData({ ...formData, addressLine1: e.target.value })}
                          className="bg-black/40 border-white/20 rounded-none h-14 text-[10px] tracking-widest focus:border-white/60 text-white uppercase"
                          placeholder="STREET ADDRESS"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold tracking-[0.4em] text-white/80 uppercase">LANDMARK (OPTIONAL)</label>
                        <Input 
                          value={formData.landmark}
                          onChange={e => setFormData({ ...formData, landmark: e.target.value })}
                          className="bg-black/40 border-white/20 rounded-none h-14 text-[10px] tracking-widest focus:border-white/60 text-white uppercase"
                        />
                      </div>
                    </div>

                    <Button 
                      disabled={saving}
                      className="w-full bg-white text-black hover:bg-white/90 h-16 text-[10px] font-bold tracking-[0.5em] rounded-none shadow-[0_0_20px_rgba(255,255,255,0.1)]"
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
                  <div className="flex items-center justify-between border-b border-white/10 pb-8">
                    <h2 className="text-xs font-bold tracking-[0.5em] uppercase text-white/80">TRANSMISSION HISTORY</h2>
                    <span className="text-[10px] text-white/60 font-bold">{orders?.length || 0} LOGS</span>
                  </div>

                  <div className="space-y-6">
                    {isOrdersLoading ? (
                      <div className="space-y-4">
                        {[1, 2].map(i => (
                          <div key={i} className="h-32 bg-white/[0.02] animate-pulse border border-white/10" />
                        ))}
                      </div>
                    ) : orders && orders.length > 0 ? (
                      orders.map((order) => (
                        <div 
                          key={order.id}
                          className="group border border-white/10 bg-white/[0.01] hover:bg-white/[0.03] transition-all p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-8"
                        >
                          <div className="space-y-4 flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                              <Package className="w-4 h-4 text-white/60" />
                              <span className="text-[10px] font-bold tracking-widest uppercase font-mono text-white/80">{order.id.slice(0, 16)}</span>
                              <span className={`text-[8px] px-2 py-0.5 border tracking-[0.2em] uppercase font-bold ${
                                order.shippingStatus === 'delivered' ? 'border-green-500/50 text-green-500' :
                                order.shippingStatus === 'shipped' ? 'border-blue-500/50 text-blue-500' :
                                'border-white/30 text-white/80'
                              }`}>
                                {order.shippingStatus || 'processing'}
                              </span>
                            </div>
                            <div className="flex flex-col gap-1">
                              <div className="text-[9px] text-white/80 tracking-widest uppercase font-bold">
                                INITIALIZED: {new Date(order.orderDate).toLocaleDateString()}
                              </div>
                              {order.trackingId && (
                                <div className="text-[9px] text-white font-mono tracking-widest flex items-center gap-2">
                                  <span className="text-white/40 font-bold">TRACKING:</span> {order.trackingId}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-8 md:gap-12">
                            <div className="text-right">
                              <div className="text-[11px] font-bold tracking-widest uppercase text-white">₹{order.totalAmount}</div>
                              <div className="text-[8px] text-white/60 tracking-widest uppercase mt-1 font-bold">
                                {order.paymentStatus || 'PAYMENT_LOGGED'}
                              </div>
                            </div>
                            
                            {order.shippingStatus === 'delivered' && (
                              <ReviewDialog order={order} userId={user.uid} userName={profile?.displayName || 'Entity'} db={db} />
                            )}
                            
                            <Button variant="ghost" size="icon" className="text-white/60 hover:text-white transition-colors">
                              <FileText className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
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
                  <div className="flex items-center justify-between border-b border-white/10 pb-8">
                    <h2 className="text-xs font-bold tracking-[0.5em] uppercase text-white/80">STASIS MODULES</h2>
                    <span className="text-[10px] text-white/60 font-bold">{wishlistItems?.length || 0} ITEMS</span>
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
        <Button variant="ghost" size="icon" className="text-white/60 hover:text-white transition-colors">
          <MessageSquare className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black border-white/20 rounded-none text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold tracking-[0.5em] uppercase mb-4">Transmit Feedback</DialogTitle>
        </DialogHeader>
        <div className="space-y-8">
          <div className="space-y-4">
            <label className="text-[10px] font-bold tracking-widest text-white/80 uppercase">AESTHETIC RATING</label>
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
            <label className="text-[10px] font-bold tracking-widest text-white/80 uppercase">TRANSMISSION LOG</label>
            <Textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="bg-white/5 border-white/20 rounded-none min-h-[120px] text-[10px] tracking-widest focus:border-white/60 text-white uppercase"
              placeholder="ENTER EXPERIENCE DATA..."
            />
          </div>
          <Button 
            disabled={loading}
            onClick={handleReviewSubmit}
            className="w-full bg-white text-black hover:bg-white/90 h-14 text-[10px] font-bold tracking-[0.4em] rounded-none"
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
    <div className="py-32 flex flex-col items-center justify-center space-y-8 opacity-60 border border-dashed border-white/10">
      <div className="scale-150">{icon}</div>
      <p className="text-[10px] tracking-[1em] uppercase text-center px-6 font-bold">{message}</p>
    </div>
  );
}
