
'use client';

import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, limit, deleteDoc, doc } from 'firebase/firestore';
import { MessageSquare, ChevronLeft, Trash2, Mail, Calendar, ShieldAlert, Loader2, User as UserIcon, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo, useEffect } from 'react';

export default function AdminMessagesPage() {
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

  const messagesQuery = useMemoFirebase(() => {
    if (!db || !mounted || !isAdmin) return null;
    return query(
      collection(db, 'contacts'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
  }, [db, isAdmin, mounted]);

  const { data: messages, isLoading } = useCollection(messagesQuery);

  const handleDelete = async (messageId: string) => {
    if (!db || !confirm('CONFIRM DESTRUCTION OF MESSAGE LOG?')) return;
    try {
      await deleteDoc(doc(db, 'contacts', messageId));
      toast({
        title: "MESSAGE PURGED",
        description: "TRANSMISSION REMOVED FROM ARCHIVE.",
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
            <h1 className="text-4xl md:text-5xl font-black tracking-tight glow-text uppercase leading-none text-white">Incoming Feed</h1>
          </div>
          <div className="bg-white/5 px-6 py-4 border border-white/10 flex items-center gap-4 backdrop-blur-md">
            <ShieldAlert className="w-4 h-4 text-white/60" />
            <span className="text-[10px] tracking-[0.3em] font-bold text-white/60 uppercase">COMM-CHANNEL MONITORING</span>
          </div>
        </div>

        <div className="grid gap-8">
          {isLoading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-white/[0.02] border border-white/5 animate-pulse" />
            ))
          ) : messages && messages.length > 0 ? (
            messages.map((msg) => (
              <div key={msg.id} className="bg-white/[0.02] border border-white/5 p-10 space-y-8 backdrop-blur-xl group hover:border-white/20 transition-all">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-white/5 pb-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 border border-white/10 bg-white/5 flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-white/40" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-[11px] font-black tracking-[0.3em] uppercase text-white">{msg.name}</h3>
                        <div className="flex items-center gap-4 text-[9px] text-white/40 tracking-widest font-bold">
                           <span className="flex items-center gap-2"><Mail className="w-3 h-3" /> {msg.email}</span>
                           <span className="flex items-center gap-2"><Calendar className="w-3 h-3" /> {new Date(msg.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                       <span className="text-[8px] font-bold tracking-[0.4em] text-white/30 uppercase">SUBJECT:</span>
                       <p className="text-[10px] font-black tracking-widest uppercase text-white/80">{msg.subject}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(msg.id)}
                    className="text-white/20 hover:text-red-500 transition-colors self-start"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-white/20">
                    <Zap className="w-3 h-3" />
                    <span className="text-[8px] tracking-[0.4em] font-bold uppercase">MESSAGE_BODY</span>
                  </div>
                  <p className="text-sm text-white/60 tracking-widest leading-relaxed uppercase whitespace-pre-wrap font-light">
                    {msg.message}
                  </p>
                </div>
                
                <div className="pt-4 flex justify-end">
                   <a href={`mailto:${msg.email}?subject=RE: ${msg.subject}`} className="text-[9px] font-bold tracking-[0.5em] text-white/40 hover:text-white border-b border-white/10 pb-2 transition-all uppercase">
                      INITIALIZE REPLY PROTOCOL
                   </a>
                </div>
              </div>
            ))
          ) : (
            <div className="py-32 flex flex-col items-center justify-center gap-6 opacity-20 border border-dashed border-white/10">
              <MessageSquare className="w-12 h-12 stroke-[0.5px]" />
              <p className="text-[10px] tracking-[1em] uppercase font-bold">COMM-CHANNEL IDLE</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
