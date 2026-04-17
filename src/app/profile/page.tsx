
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Clock, ShieldCheck, ArrowRight, ShoppingBag, MapPin, Heart, FileText, Plus, Trash2, Settings, Star, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { ProductCard } from '@/components/product-card';
import { submitReview } from '@/firebase/review-actions';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('orders');

  const ordersQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'orders'),
      orderBy('createdAt', 'desc')
    );
  }, [db, user]);

  const addressesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'addresses');
  }, [db, user]);

  const wishlistQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'wishlist');
  }, [db, user]);

  const { data: orders, isLoading: isOrdersLoading } = useCollection(ordersQuery);
  const { data: addresses } = useCollection(addressesQuery);
  const { data: wishlistItems } = useCollection(wishlistQuery);

  const isAdmin = user?.email === 'voidwear26@gmail.com';

  if (isUserLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-[10px] tracking-[1em] animate-pulse">SYNCING PROFILE...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-8">
        <h2 className="text-xl font-bold tracking-[0.5em] glow-text">ACCESS DENIED</h2>
        <p className="text-[10px] text-white/40 tracking-[0.3em]">PLEASE INITIALIZE AUTHENTICATION</p>
        <Link href="/login">
          <button className="px-12 py-4 border border-white/20 text-[10px] tracking-[0.5em] hover:bg-white hover:text-black transition-all">
            LOGIN
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-48 pb-32 bg-transparent min-h-screen">
      <div className="container mx-auto px-6 md:px-10">
        <div className="grid lg:grid-cols-4 gap-16 md:gap-24">
          <div className="space-y-12">
            <div className="space-y-6">
              <span className="text-[10px] font-bold tracking-[0.8em] text-white/20 uppercase">ENTITY // PROFILE</span>
              <h1 className="text-4xl font-black tracking-tight glow-text uppercase leading-none break-all">
                {user.email?.split('@')[0]}
              </h1>
              <p className="text-white/40 tracking-[0.2em] text-[10px] uppercase">
                UID: {user.uid.slice(0, 12)}...
              </p>
            </div>

            {isAdmin && (
              <Link href="/admin">
                <Button className="w-full bg-white text-black hover:bg-white/90 rounded-none h-14 text-[10px] font-bold tracking-[0.4em] mb-8">
                  <Settings className="w-4 h-4 mr-3" />
                  ADMIN COMMAND
                </Button>
              </Link>
            )}

            <div className="p-8 border border-white/5 bg-white/[0.02] space-y-6 backdrop-blur-sm">
              <div className="flex items-center gap-4 text-white/40">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[9px] tracking-[0.3em] uppercase">Security Level: {isAdmin ? 'Administrator' : 'Standard'}</span>
              </div>
              <div className="flex items-center gap-4 text-white/40">
                <Clock className="w-4 h-4" />
                <span className="text-[9px] tracking-[0.3em] uppercase">Status: Online</span>
              </div>
            </div>
            
            <nav className="flex flex-col gap-4 text-[10px] tracking-[0.5em] uppercase font-bold text-white/20">
              {['orders', 'addresses', 'wishlist'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-left transition-all duration-300 ${activeTab === tab ? 'text-white pl-4 border-l border-white' : 'hover:text-white/60'}`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === 'orders' && (
                <motion.div 
                  key="orders"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-12"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-8">
                    <h2 className="text-xs font-bold tracking-[0.5em] uppercase">TRANSMISSION HISTORY</h2>
                    <span className="text-[10px] text-white/20">{orders?.length || 0} ITEMS</span>
                  </div>

                  <div className="space-y-6">
                    {isOrdersLoading ? (
                      <div className="space-y-4">
                        {[1, 2].map(i => (
                          <div key={i} className="h-32 bg-white/[0.02] animate-pulse border border-white/5" />
                        ))}
                      </div>
                    ) : orders && orders.length > 0 ? (
                      orders.map((order) => (
                        <div 
                          key={order.id}
                          className="group border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-8"
                        >
                          <div className="space-y-4 flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                              <Package className="w-4 h-4 text-white/40" />
                              <span className="text-[10px] font-bold tracking-widest uppercase">{order.orderNumber}</span>
                              <span className={`text-[8px] px-2 py-0.5 border tracking-[0.2em] uppercase font-bold ${
                                order.shippingStatus === 'delivered' ? 'border-green-500/50 text-green-500' :
                                order.shippingStatus === 'shipped' ? 'border-blue-500/50 text-blue-500' :
                                'border-white/20 text-white/40'
                              }`}>
                                {order.shippingStatus || 'processing'}
                              </span>
                            </div>
                            <div className="flex flex-col gap-1">
                              <div className="text-[9px] text-white/40 tracking-widest uppercase">
                                INITIALIZED: {new Date(order.orderDate).toLocaleDateString()}
                              </div>
                              {order.trackingId && (
                                <div className="text-[9px] text-white font-mono tracking-widest flex items-center gap-2">
                                  <span className="text-white/20">TRACKING:</span> {order.trackingId}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-8 md:gap-12">
                            <div className="text-right">
                              <div className="text-[10px] font-bold tracking-widest">₹{order.totalAmount}</div>
                              <div className="text-[8px] text-white/20 tracking-widest uppercase mt-1">
                                {order.paymentStatus}
                              </div>
                            </div>
                            
                            {order.shippingStatus === 'delivered' && (
                              <ReviewDialog order={order} userId={user.uid} userName={user.email?.split('@')[0] || 'Entity'} db={db} />
                            )}
                            
                            <Button variant="ghost" size="icon" className="text-white/20 hover:text-white transition-colors">
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

              {activeTab === 'addresses' && (
                <motion.div 
                  key="addresses"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-12"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-8">
                    <h2 className="text-xs font-bold tracking-[0.5em] uppercase">DELIVERY NODES</h2>
                    <Button variant="outline" className="border-white/10 text-[9px] tracking-[0.3em] uppercase rounded-none h-8 px-4">
                      <Plus className="w-3 h-3 mr-2" /> ADD NODE
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {addresses && addresses.length > 0 ? (
                      addresses.map(addr => (
                        <div key={addr.id} className="p-8 border border-white/5 bg-white/[0.01] space-y-4 group">
                          <div className="flex justify-between items-start">
                            <MapPin className="w-4 h-4 text-white/40" />
                            <button 
                              onClick={() => deleteDocumentNonBlocking(doc(db, 'users', user.uid, 'addresses', addr.id))}
                              className="text-white/0 group-hover:text-white/20 hover:text-red-500 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold tracking-widest uppercase">{addr.addressType || 'HOME'}</p>
                            <p className="text-[9px] text-white/40 tracking-widest uppercase leading-relaxed">
                              {addr.addressLine1}<br />
                              {addr.city}, {addr.stateProvince} {addr.postalCode}<br />
                              {addr.country}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="md:col-span-2">
                        <EmptyState icon={<MapPin />} message="NO NODES REGISTERED" />
                      </div>
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
                    <h2 className="text-xs font-bold tracking-[0.5em] uppercase">STASIS MODULES</h2>
                    <span className="text-[10px] text-white/20">{wishlistItems?.length || 0} ITEMS</span>
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
      // For simplicity in this proto, we review the first item or the order as a whole
      // In a full app, we'd map over products in the order
      await submitReview(db, {
        productId: 'global_order_review', // Or specific ID if available
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
        <Button variant="ghost" size="icon" className="text-white/20 hover:text-white transition-colors">
          <MessageSquare className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black border-white/10 rounded-none text-white max-w-md">
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
                  className={`transition-all ${star <= rating ? 'text-white' : 'text-white/10'}`}
                >
                  <Star className="w-6 h-6" fill={star <= rating ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-bold tracking-widest text-white/40 uppercase">TRANSMISSION LOG (COMMENT)</label>
            <Textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="bg-white/5 border-white/10 rounded-none min-h-[120px] text-[10px] tracking-widest focus:border-white/40 text-white uppercase"
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
    <div className="py-32 flex flex-col items-center justify-center space-y-8 opacity-20 border border-dashed border-white/10">
      <div className="scale-150">{icon}</div>
      <p className="text-[10px] tracking-[1em] uppercase text-center px-6">{message}</p>
    </div>
  );
}
