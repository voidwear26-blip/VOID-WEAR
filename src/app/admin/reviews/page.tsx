'use client';

import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, limit, deleteDoc, doc } from 'firebase/firestore';
import { MessageSquare, ChevronLeft, Trash2, Star, ShieldAlert, Loader2, Package } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo, useEffect } from 'react';

export default function AdminReviewsPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin = useMemo(() => {
    if (isUserLoading || !user) return false;
    return user.email?.toLowerCase() === 'voidwear26@gmail.com' || 
           user.uid === 'A9vsqn10oddfmouKiKjWpTcFqZB2';
  }, [user, isUserLoading]);

  const reviewsQuery = useMemoFirebase(() => {
    if (!db || !mounted || !isAdmin) return null;
    return query(
      collection(db, 'reviews'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
  }, [db, isAdmin, mounted]);

  const { data: reviews, isLoading } = useCollection(reviewsQuery);

  const handleDelete = async (reviewId: string) => {
    if (!db || !confirm('CONFIRM DESTRUCTION OF FEEDBACK ENTRY?')) return;
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      toast({
        title: "FEEDBACK DELETED",
        description: "ENTRY PURGED FROM SYSTEM.",
      });
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "PURGE_FAILURE",
      });
    }
  };

  if (isUserLoading || !mounted) {
    return (
      <div className="h-screen flex items-center justify-center text-[10px] tracking-[1em] uppercase opacity-40 font-bold text-white bg-black">
        Authenticating Protocol...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-6 text-white bg-black">
        <p className="text-[10px] tracking-[1em] uppercase opacity-40 font-bold">ACCESS DENIED // MASTER ONLY</p>
        <Link href="/" className="text-[10px] tracking-widest border-b border-white/20 pb-2">RETURN TO SURFACE</Link>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen text-white">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="space-y-4">
            <Link href="/admin" className="flex items-center gap-2 text-[10px] text-white/80 hover:text-white transition-colors uppercase tracking-widest mb-4 font-bold">
              <ChevronLeft className="w-3 h-3" />
              BACK TO SYSTEM
            </Link>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight glow-text uppercase leading-none text-white">Feedback Audit</h1>
          </div>
          <div className="bg-white/5 px-6 py-4 border border-white/10 flex items-center gap-4 backdrop-blur-md">
            <ShieldAlert className="w-4 h-4 text-white/60" />
            <span className="text-[10px] tracking-[0.3em] font-bold text-white/60 uppercase">MODERATION CHANNEL ACTIVE</span>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">ENTITY</th>
                  <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">MODULE_ID</th>
                  <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">CALIBRATION</th>
                  <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">NARRATIVE</th>
                  <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/40 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  [1, 2, 3].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-10 py-12 bg-white/[0.01]" />
                    </tr>
                  ))
                ) : reviews && reviews.length > 0 ? (
                  reviews.map((review) => (
                    <tr key={review.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-10 py-8">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold tracking-widest text-white/80 uppercase">{review.userName || 'Anonymous'}</span>
                          <p className="text-[8px] text-white/20 uppercase tracking-[0.2em] font-bold font-mono">{review.userId.slice(0, 12)}...</p>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                         <div className="flex items-center gap-2 text-[10px] text-white/40 tracking-widest font-bold">
                            <Package className="w-3 h-3" />
                            {review.productId.slice(0, 12)}...
                         </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < (review.rating || 0) ? 'text-white' : 'text-white/10'}`} fill={i < (review.rating || 0) ? 'currentColor' : 'none'} />
                          ))}
                        </div>
                      </td>
                      <td className="px-10 py-8 max-w-md">
                        <p className="text-[10px] text-white/60 tracking-widest leading-relaxed uppercase line-clamp-2">{review.comment}</p>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(review.id)}
                          className="text-white/20 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-10 py-32 text-center opacity-20">
                      <div className="flex flex-col items-center gap-6">
                        <MessageSquare className="w-12 h-12 stroke-[0.5px]" />
                        <p className="text-[10px] tracking-[1em] uppercase font-bold">NO FEEDBACK LOGS DETECTED</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
