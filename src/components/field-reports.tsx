'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { submitReview } from '@/firebase/review-actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, MessageSquare, Loader2, Zap, User as UserIcon, ShieldAlert, CheckCircle2, ShoppingBag, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface FieldReportsProps {
  productId: string;
  productName: string;
}

export function FieldReports({ productId, productName }: FieldReportsProps) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 1. Fetch Global Reports for this product
  const reviewsQuery = useMemoFirebase(() => {
    if (!db || !productId) return null;
    return query(
      collection(db, 'reviews'),
      where('productId', '==', productId),
      limit(50)
    );
  }, [db, productId]);

  const { data: rawReports, isLoading } = useCollection(reviewsQuery);

  const reports = useMemo(() => {
    if (!rawReports) return [];
    return [...rawReports].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [rawReports]);

  // 2. VERIFICATION PROTOCOL: Check if user has purchased this item
  const userOrdersQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'orders');
  }, [db, user]);

  const { data: userOrders, isLoading: checkingVerification } = useCollection(userOrdersQuery);

  const hasPurchased = useMemo(() => {
    if (!userOrders) return false;
    return userOrders.some(order => 
      order.items?.some((item: any) => item.productId === productId)
    );
  }, [userOrders, productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db || !hasPurchased) return;
    
    if (!comment.trim()) {
      toast({ variant: "destructive", title: "INCOMPLETE", description: "PLEASE WRITE A REVIEW." });
      return;
    }

    setSubmitting(true);
    try {
      await submitReview(db, {
        productId,
        productName,
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0].toUpperCase() || 'CUSTOMER',
        rating,
        comment,
        createdAt: new Date().toISOString(),
        orderId: 'VERIFIED_PURCHASE' 
      } as any);

      setComment('');
      setRating(5);
      toast({ title: "REVIEW SUBMITTED", description: "THANK YOU FOR YOUR FEEDBACK." });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "SUBMISSION FAILED" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-black/10 pb-12 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <MessageSquare className="w-5 h-5 text-black/40" />
            <span className="text-[10px] font-bold tracking-[0.8em] text-black/40 uppercase">CUSTOMER REVIEWS</span>
          </div>
          <h3 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none">Buyer <br /> Feedback</h3>
          <p className="text-[9px] tracking-[0.3em] text-black/60 uppercase font-black">AUTHENTIC REVIEWS FROM OUR CUSTOMERS</p>
        </div>
        <div className="bg-black/5 border border-black/10 px-8 py-4 backdrop-blur-md">
           <span className="text-[11px] font-black">{reports.length}</span>
           <span className="text-[9px] tracking-[0.2em] font-bold text-black/60 uppercase ml-3">TOTAL REVIEWS</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-16 md:gap-24">
        <div className="lg:col-span-1 space-y-12 lg:sticky lg:top-32 h-fit">
          {!user ? (
            <div className="p-12 border border-black/10 bg-black/[0.02] space-y-8 text-center backdrop-blur-xl">
              <ShieldAlert className="w-10 h-10 text-black/20 mx-auto" />
              <div className="space-y-2">
                <p className="text-[10px] tracking-[0.3em] text-black/80 uppercase font-bold">LOGIN REQUIRED</p>
                <p className="text-[8px] tracking-[0.2em] text-black/60 uppercase leading-relaxed font-black">PLEASE LOGIN TO LEAVE A REVIEW.</p>
              </div>
              <Button asChild variant="outline" className="w-full border-black/10 h-14 text-[9px] tracking-[0.4em] font-black rounded-none transition-all hover:bg-black hover:text-white uppercase">
                <Link href="/login">LOGIN</Link>
              </Button>
            </div>
          ) : checkingVerification ? (
            <div className="p-12 border border-black/10 bg-black/[0.02] flex flex-col items-center justify-center space-y-6">
              <Loader2 className="w-8 h-8 animate-spin text-black/20" />
              <p className="text-[9px] tracking-[0.3em] text-black/60 uppercase font-bold">Verifying...</p>
            </div>
          ) : !hasPurchased ? (
            <div className="p-12 border border-black/10 bg-black/[0.02] space-y-6 backdrop-blur-xl">
               <ShoppingBag className="w-10 h-10 text-black/10 mx-auto" />
               <p className="text-[9px] tracking-[0.3em] text-black/60 uppercase font-black text-center leading-relaxed">
                 ONLY CUSTOMERS WHO HAVE PURCHASED THIS ITEM CAN LEAVE A REVIEW.
               </p>
            </div>
          ) : (
            <div className="space-y-8">
              <form onSubmit={handleSubmit} className="bg-black/[0.02] border border-black/10 p-12 space-y-10 backdrop-blur-xl">
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-black/10 pb-4">
                    <label className="text-[9px] font-bold tracking-[0.4em] text-black/60 uppercase">RATING</label>
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600/60" />
                  </div>
                  <div className="flex gap-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        className="transition-all hover:scale-125 group focus:outline-none"
                      >
                        <Star 
                          className={`w-6 h-6 transition-all ${rating >= s ? 'text-yellow-400 fill-current' : 'text-black/10 group-hover:text-black/30'}`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <label className="text-[9px] font-bold tracking-[0.4em] text-black/60 uppercase block">YOUR REVIEW</label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="WHAT DID YOU THINK OF THIS ITEM?..."
                    className="bg-white border-black/10 rounded-none h-[150px] text-[10px] tracking-widest focus:border-black/40 text-black uppercase placeholder:text-black/10 leading-relaxed"
                  />
                </div>

                <Button disabled={submitting} className="w-full bg-black text-white hover:bg-black/90 h-16 text-[10px] font-black tracking-[0.5em] rounded-none uppercase transition-all shadow-sm">
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'SUBMIT REVIEW'}
                </Button>
              </form>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-12">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 opacity-20 border border-dashed border-black/10">
              <Loader2 className="w-10 h-10 animate-spin mb-6" />
              <span className="text-[10px] tracking-[0.5em] uppercase font-bold">Syncing...</span>
            </div>
          ) : reports && reports.length > 0 ? (
            <div className="grid gap-12">
              <AnimatePresence>
                {reports.map((report, idx) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1, duration: 0.8 }}
                    className="bg-black/[0.01] border border-black/10 p-12 space-y-8 hover:bg-white transition-all group relative overflow-hidden backdrop-blur-sm shadow-sm"
                  >
                    <div className="absolute top-0 right-0 px-4 py-1.5 bg-black/5 border-l border-b border-black/10 flex items-center gap-2">
                       <CheckCircle2 className="w-2.5 h-2.5 text-green-600" />
                       <span className="text-[7px] font-black tracking-[0.3em] text-black/60 uppercase">VERIFIED PURCHASE</span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-black/10 pb-8">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 border border-black/10 bg-black/5 flex items-center justify-center group-hover:border-black/30 transition-colors">
                          <UserIcon className="w-6 h-6 text-black/40" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[12px] font-black tracking-[0.3em] text-black uppercase">{report.userName}</p>
                          <div className="flex items-center gap-4 text-[8px] text-black/60 tracking-widest font-bold uppercase">
                             <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                             <span className="w-1 h-1 bg-black/20 rounded-full" />
                             <span className="font-mono">{report.userId.slice(0, 8)}...</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < report.rating ? 'text-yellow-400' : 'text-black/5'}`} fill={i < report.rating ? 'currentColor' : 'none'} />
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <p className="text-sm text-black/80 tracking-widest leading-relaxed uppercase whitespace-pre-wrap font-light group-hover:text-black transition-colors duration-700">
                        {report.comment}
                      </p>
                    </div>

                    {report.adminReply && (
                      <div className="p-8 bg-black/[0.02] border border-black/10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
                         <div className="flex items-center gap-3 text-green-600">
                            <Heart className="w-4 h-4 fill-current" />
                            <span className="text-[8px] font-black tracking-[0.5em] uppercase">SYSTEM REPLY</span>
                         </div>
                         <p className="text-[11px] text-black/80 tracking-[0.2em] leading-relaxed uppercase italic font-bold">
                           "{report.adminReply}"
                         </p>
                      </div>
                    )}

                    <div className="pt-4 flex justify-end opacity-20 group-hover:opacity-60 transition-opacity">
                       <div className="h-px flex-1 bg-gradient-to-r from-transparent to-black/10 mr-4 self-center" />
                       <span className="text-[7px] tracking-[1em] font-black uppercase">VOID WEAR REVIEWS</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="py-48 text-center opacity-20 border border-dashed border-black/10 flex flex-col items-center justify-center gap-10">
              <Zap className="w-16 h-16 stroke-[0.5px]" />
              <div className="space-y-3">
                <p className="text-[12px] tracking-[1em] uppercase font-black">NO REVIEWS</p>
                <p className="text-[8px] tracking-[0.5em] uppercase font-bold text-black/60">BE THE FIRST TO REVIEW THIS ITEM.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
