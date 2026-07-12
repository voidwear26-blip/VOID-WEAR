'use client';

import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
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
    if (!db || !confirm('Permanently delete this message?')) return;
    try {
      await deleteDoc(doc(db, 'contacts', messageId));
      toast({
        title: "MESSAGE DELETED",
        description: "Communication removed from system.",
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "DELETE_FAILURE",
      });
    }
  };

  if (isUserLoading || !mounted || isProfileLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-black/20" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-6 bg-background text-black">
        <p className="text-[10px] tracking-[1em] uppercase opacity-40 font-bold">ACCESS DENIED</p>
        <Link href="/" className="text-[10px] tracking-widest border-b border-black/20 pb-2">BACK</Link>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen text-black font-body">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="space-y-4">
            <Link href="/admin" className="flex items-center gap-2 text-[10px] text-black/60 hover:text-black transition-colors uppercase tracking-widest mb-4 font-bold">
              <ChevronLeft className="w-3 h-3" />
              BACK TO DASHBOARD
            </Link>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none font-headline">Messages</h1>
          </div>
          <div className="bg-black/5 px-6 py-4 border border-black/10 flex items-center gap-4 backdrop-blur-md">
            <ShieldAlert className="w-4 h-4 text-black/40" />
            <span className="text-[10px] tracking-[0.3em] font-bold text-black/60 uppercase">INBOX MONITORING</span>
          </div>
        </div>

        <div className="grid gap-8">
          {isLoading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-black/[0.01] border border-black/5 animate-pulse" />
            ))
          ) : messages && messages.length > 0 ? (
            messages.map((msg) => (
              <div key={msg.id} className="bg-black/[0.01] border border-black/5 p-10 space-y-8 backdrop-blur-xl group hover:border-black/20 transition-all shadow-sm">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-black/5 pb-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 border border-black/10 bg-black/5 flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-black/40" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-[11px] font-black tracking-[0.3em] uppercase text-black">{msg.name}</h3>
                        <div className="flex items-center gap-4 text-[9px] text-black/60 tracking-widest font-bold">
                           <span className="flex items-center gap-2"><Mail className="w-3 h-3" /> {msg.email}</span>
                           <span className="flex items-center gap-2"><Calendar className="w-3 h-3" /> {new Date(msg.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                       <span className="text-[8px] font-bold tracking-[0.4em] text-black/40 uppercase">SUBJECT:</span>
                       <p className="text-[10px] font-black tracking-widest uppercase text-black/80">{msg.subject}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(msg.id)}
                    className="text-black/20 hover:text-red-600 transition-colors self-start"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-black/40">
                    <Zap className="w-3 h-3" />
                    <span className="text-[8px] tracking-[0.4em] font-bold uppercase">MESSAGE CONTENT</span>
                  </div>
                  <p className="text-sm text-black/80 tracking-widest leading-relaxed uppercase whitespace-pre-wrap font-light">
                    {msg.message}
                  </p>
                </div>
                
                <div className="pt-4 flex justify-end">
                   <a href={`mailto:${msg.email}?subject=RE: ${msg.subject}`} className="text-[9px] font-bold tracking-[0.5em] text-black/40 hover:text-black border-b border-black/10 pb-2 transition-all uppercase">
                      REPLY VIA EMAIL
                   </a>
                </div>
              </div>
            ))
          ) : (
            <div className="py-32 flex flex-col items-center justify-center gap-6 opacity-20 border border-dashed border-black/10">
              <MessageSquare className="w-12 h-12 stroke-[0.5px]" />
              <p className="text-[10px] tracking-[1em] uppercase font-bold">NO MESSAGES</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
