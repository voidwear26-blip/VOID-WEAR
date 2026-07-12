
"use client"

import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, doc, deleteDoc } from 'firebase/firestore';
import { Plus, Trash2, Edit2, ChevronLeft, Loader2, Megaphone } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function AdminStoriesPage() {
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
    if (isUserLoading || !user) return false;
    return user.email?.toLowerCase() === 'voidwear26@gmail.com' || 
           user.uid === 'A9vsqn10oddfmouKiKjWpTcFqZB2' ||
           profile?.role === 'ADMIN';
  }, [user, isUserLoading, profile]);

  const storiesQuery = useMemoFirebase(() => {
    if (!db || !isAdmin) return null;
    return collection(db, 'stories');
  }, [db, isAdmin]);

  const { data: stories, isLoading } = useCollection(storiesQuery);

  const handleDelete = async (id: string) => {
    if (!db) return;
    if (!confirm('Delete this story?')) return;
    
    try {
      await deleteDoc(doc(db, 'stories', id));
      toast({ title: "STORY REMOVED" });
    } catch (e) {
      toast({ variant: "destructive", title: "ERROR" });
    }
  };

  if (!mounted || isUserLoading || isProfileLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-black/20" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen text-black font-body">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="space-y-4">
            <Link href="/admin" className="flex items-center gap-2 text-[10px] text-black/60 hover:text-black transition-all hover:scale-105 uppercase tracking-widest mb-4 font-bold">
              <ChevronLeft className="w-3 h-3" />
              BACK TO DASHBOARD
            </Link>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none font-headline">Stories</h1>
          </div>
          <Button asChild className="bg-black text-white hover:bg-black/90 rounded-none h-14 px-8 text-[10px] font-bold tracking-[0.4em] uppercase shadow-sm">
            <Link href="/admin/stories/new">
              <Plus className="w-4 h-4 mr-3" />
              NEW STORY
            </Link>
          </Button>
        </div>

        <div className="bg-black/[0.01] border border-black/5 overflow-hidden backdrop-blur-xl shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/5 bg-black/[0.02]">
                <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-black/40">TITLE</th>
                <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-black/40">TYPE</th>
                <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-black/40">DATE</th>
                <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-black/40 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {isLoading ? (
                <tr><td colSpan={4} className="px-10 py-32 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-black/20" />
                </td></tr>
              ) : stories && stories.length > 0 ? (
                stories.map((story) => (
                  <tr key={story.id} className="hover:bg-black/[0.02] transition-colors group">
                    <td className="px-10 py-8">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-black">{story.title}</span>
                    </td>
                    <td className="px-10 py-8">
                      <span className="text-[8px] px-3 py-1 border border-black/10 tracking-[0.2em] font-bold text-black/60 uppercase">
                        {story.type}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-[10px] text-black/60 font-mono">
                      {new Date(story.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Button variant="ghost" size="icon" asChild className="text-black/40 hover:text-black transition-all hover:scale-125 bg-transparent hover:bg-transparent">
                          <Link href={`/admin/stories/${story.id}`}>
                            <Edit2 className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(story.id)} className="text-black/40 hover:text-red-600 transition-all hover:scale-125 bg-transparent hover:bg-transparent">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-10 py-32 text-center opacity-20">
                    <div className="flex flex-col items-center gap-6">
                      <Megaphone className="w-12 h-12 stroke-[0.5px] text-black" />
                      <p className="text-[10px] tracking-[1em] uppercase font-bold text-black">NO STORIES FOUND</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
