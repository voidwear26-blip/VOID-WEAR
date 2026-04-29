'use client';

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { submitReview } from '@/firebase/review-actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, MessageSquare, Loader2, Zap, User as UserIcon, ShieldAlert } from 'lucide-react';
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

  const reviewsQuery = useMemoFirebase(() => {
    if (!db || !productId) return null;
    return query(
      collection(db, 'reviews'),
      where('productId', '==', productId),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
  }, [db, productId]);

  const { data: reports, isLoading } = useCollection(reviewsQuery);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) return;
    if (!comment.trim()) {
      toast({ variant: "destructive", title: "REPORT_INCOMPLETE", description: "INPUT NARRATIVE DATA." });
      return;
    }

    setSubmitting(true);
    try {
      await submitReview(db, {
        productId,
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0].toUpperCase() || 'OPERATOR',
        rating,
        comment,
        createdAt: new Date().toISOString(),
        orderId: 'INTERNAL_UPLINK' // Optional metadata
      } as any);

      setComment('');
      setRating(5);
      toast({ title: "REPORT TRANSMITTED", description: "FEEDBACK LOGGED IN ARCHIVE." });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "TRANSMISSION_FAILURE" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-20">
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div className="space-y-1">
          <h3 className="text-[10px] font-bold tracking-[0.5em] text-white/40 uppercase">FIELD REPORTS</h3>
          <p className="text-[8px] tracking-[0.2em] text-white/20 uppercase font-black">LOGGED BY ACTIVE OPERATORS</p>
        </div>
        <MessageSquare className="w-4 h-4 text-white/20" />
      </div>

      <div className="grid lg:grid-cols-3 gap-16">
        <div className="lg:col-span-1 space-y-12">
          {!user ? (
            <div className="p-10 border border-white/5 bg-white/[0.01] space-y-6 text-center">
              <ShieldAlert className="w-8 h-8 text-white/20 mx-auto" />
              <p className="text-[10px] tracking-[0.3em] text-white/40 uppercase font-bold">AUTHENTICATION REQUIRED TO LOG REPORTS.</p>
              <Button asChild variant="outline" className="w-full border-white/10 h-12 text-[9px] tracking-[0.3em] font-black rounded-none">
                <Link href="/login">ESTABLISH LINK</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white/[0.02] border border-white/10 p-10 space-y-8 backdrop-blur-xl">
              <div className="space-y-4">
                <label className="text-[9px] font-bold tracking-[0.4em] text-white/40 uppercase">AESTHETIC CALIBRATION (1-5)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className={`w-10 h-10 border transition-all flex items-center justify-center ${
                        rating >= s ? 'bg-white text-black border-white shadow-[0_0_15px_white]' : 'border-white/10 text-white/20 hover:border-white/40'
                      }`}
                    >
                      <span className="text-[10px] font-black">0{s}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-bold tracking-[0.4em] text-white/40 uppercase">NARRATIVE CONTENT</label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="INPUT PERFORMANCE DATA..."
                  className="bg-black/40 border-white/10 rounded-none min-h-[120px] text-[10px] tracking-widest focus:border-white/40 text-white uppercase placeholder:text-white/5"
                />
              </div>

              <Button disabled={submitting} className="w-full bg-white text-black hover:bg-white/90 h-14 text-[10px] font-black tracking-[0.5em] rounded-none">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>LOG TRANSMISSION <Zap className="ml-3 w-3.5 h-3.5" /></>}
              </Button>
            </form>
          )}

          <div className="p-8 border border-white/5 bg-white/[0.01] space-y-4">
            <h4 className="text-[8px] font-bold tracking-[0.3em] text-white/40 uppercase">SYSTEM ADVISORY</h4>
            <p className="text-[9px] text-white/30 tracking-[0.2em] leading-relaxed uppercase">
              FIELD REPORTS ARE AUDITED FOR ACCURACY AND INTEGRITY. SPAM TRANSMISSIONS WILL RESULT IN PERMANENT DOSSIER SEVERANCE.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-10">
          {isLoading ? (
            <div className="flex items-center gap-4 opacity-20">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-[10px] tracking-[0.5em] uppercase">Syncing reports...</span>
            </div>
          ) : reports && reports.length > 0 ? (
            <div className="grid gap-8">
              {reports.map((report, idx) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white/[0.01] border border-white/5 p-10 space-y-6 hover:bg-white/[0.02] transition-all group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-white/30" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] font-black tracking-widest text-white uppercase">{report.userName}</p>
                        <p className="text-[8px] text-white/20 tracking-[0.2em] font-bold uppercase">{new Date(report.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-2.5 h-2.5 ${i < report.rating ? 'text-white' : 'text-white/5'}`} fill={i < report.rating ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-white/60 tracking-widest leading-relaxed uppercase whitespace-pre-wrap font-light">
                    {report.comment}
                  </p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center opacity-20 border border-dashed border-white/10 flex flex-col items-center justify-center gap-6">
              <Zap className="w-12 h-12 stroke-[0.5px]" />
              <p className="text-[10px] tracking-[1em] uppercase font-bold">NO PERFORMANCE DATA LOGGED FOR THIS MODULE</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
