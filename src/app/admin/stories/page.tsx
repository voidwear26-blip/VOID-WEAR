"use client"

import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, deleteDoc } from 'firebase/firestore';
import { Plus, Trash2, ChevronLeft, Loader2, MessageSquare, Megaphone } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function AdminStoriesPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin = user?.email?.toLowerCase() === 'voidwear26@gmail.com';

  useEffect(() => {
    if (mounted && !isUserLoading && !isAdmin) {
      router.push('/');
    }
  }, [mounted, isUserLoading, isAdmin, router]);

  const storiesQuery = useMemoFirebase(() => {
    if (!db || !isAdmin) return null;
    return collection(db, 'stories');
  }, [db, isAdmin]);

  const { data: stories, isLoading } = useCollection(storiesQuery);

  const handleDelete = async (id: string) => {
    if (!db) return;
    if (!confirm('PURGE STORY FROM TRANSMISSION CHANNEL?')) return;
    
    try {
      await deleteDoc(doc(db, 'stories', id));
      toast({ title: "STORY REMOVED", description: "Narrative updated." });
    } catch (e) {
      console.error(e);
    }
  };

  if (!mounted || isUserLoading || !isAdmin) return null;

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="space-y-4">
            <Link href="/admin" className="flex items-center gap-2 text-[10px] text-white/20 hover:text-white transition-colors uppercase tracking-widest mb-4 font-bold">
              <ChevronLeft className="w-3 h-3" />
              BACK TO SYSTEM
            </Link>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight glow-text uppercase leading-none">Story Protocol</h1>
          </div>
          <Button asChild className="bg-white text-black hover:bg-white/90 rounded-none h-14 px-8 text-[10px] font-bold tracking-[0.4em] uppercase">
            <Link href="/admin/stories/new">
              <Plus className="w-4 h-4 mr-3" />
              NEW TRANSMISSION
            </Link>
          </Button>
        </div>

        <div className="bg-white/[0.02] border border-white/5 overflow-hidden backdrop-blur-xl">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">TITLE</th>
                <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">TYPE</th>
                <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">DATE</th>
                <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/40 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr><td colSpan={4} className="px-10 py-12 text-center text-white/20">LOADING TRANSMISSIONS...</td></tr>
              ) : stories && stories.length > 0 ? (
                stories.map((story) => (
                  <tr key={story.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-10 py-8">
                      <span className="text-[10px] font-bold tracking-widest uppercase">{story.title}</span>
                    </td>
                    <td className="px-10 py-8">
                      <span className="text-[8px] px-3 py-1 border border-white/10 tracking-[0.2em] font-bold text-white/60">
                        {story.type}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-[10px] text-white/40 font-mono">
                      {new Date(story.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-10 py-8 text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(story.id)} className="text-white/20 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-10 py-32 text-center opacity-20">
                    <div className="flex flex-col items-center gap-6">
                      <Megaphone className="w-12 h-12 stroke-[0.5px]" />
                      <p className="text-[10px] tracking-[1em] uppercase">NO STORIES LOGGED</p>
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