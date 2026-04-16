
'use client';

import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, updateDoc, doc } from 'firebase/firestore';
import { ChevronLeft, ShieldAlert, ShieldCheck, UserMinus, UserCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

export default function AdminUsersPage() {
  const { user: currentUser, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin = mounted && currentUser?.email?.toLowerCase() === 'voidwear26@gmail.com';

  const usersQuery = useMemoFirebase(() => {
    if (!db || !isAdmin) return null;
    return collection(db, 'users');
  }, [db, isAdmin]);

  const { data: users, isLoading: isCollectionLoading } = useCollection(usersQuery);

  const toggleBlockStatus = async (userId: string, currentStatus: boolean) => {
    if (!db) return;
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { 
        isBlocked: !currentStatus,
        updatedAt: new Date().toISOString()
      });
      toast({
        title: "ACCESS UPDATED",
        description: `ENTITY ${userId.slice(0, 8)} ${!currentStatus ? 'BLOCKED' : 'UNBLOCKED'}.`,
      });
    } catch (e) {
      console.error(e);
    }
  };

  if (!mounted || isUserLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="w-10 h-10 animate-spin text-white/20" />
          <div className="text-[10px] tracking-[1em] text-white/40 uppercase font-bold">Authenticating Protocol...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="h-screen flex items-center justify-center text-[10px] tracking-[1em] uppercase opacity-20">
        ACCESS DENIED // MASTER ONLY
      </div>
    );
  }

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="space-y-4">
            <Link href="/admin" className="flex items-center gap-2 text-[10px] text-white/20 hover:text-white transition-colors uppercase tracking-widest mb-4 font-bold">
              <ChevronLeft className="w-3 h-3" />
              BACK TO SYSTEM
            </Link>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight glow-text uppercase leading-none">Entities</h1>
          </div>
          <div className="bg-white/5 px-6 py-4 border border-white/10 flex items-center gap-4 backdrop-blur-md">
            <ShieldAlert className="w-4 h-4 text-white/40" />
            <span className="text-[10px] tracking-[0.3em] font-bold text-white/40 uppercase">USER MODERATION ACTIVE</span>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">ENTITY_ID</th>
                  <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">EMAIL</th>
                  <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">STATUS</th>
                  <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/40 text-right">PROTOCOL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isCollectionLoading ? (
                  [1, 2, 3].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="px-10 py-12 bg-white/[0.01]" />
                    </tr>
                  ))
                ) : users && users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-10 py-8">
                        <span className="text-[10px] font-mono tracking-widest text-white/80">{user.id.slice(0, 16)}...</span>
                      </td>
                      <td className="px-10 py-8 text-[10px] text-white/40 tracking-widest font-bold">
                        {user.email}
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-2">
                          {user.isBlocked ? (
                            <span className="flex items-center gap-2 text-[8px] tracking-widest text-red-500 font-bold border border-red-500/20 px-3 py-1 uppercase">
                              <ShieldAlert className="w-3 h-3" /> BLOCKED
                            </span>
                          ) : (
                            <span className="flex items-center gap-2 text-[8px] tracking-widest text-green-500 font-bold border border-green-500/20 px-3 py-1 uppercase">
                              <ShieldCheck className="w-3 h-3" /> ACTIVE
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => toggleBlockStatus(user.id, user.isBlocked || false)}
                          className={`text-[9px] tracking-widest uppercase h-10 rounded-none px-6 border font-bold ${user.isBlocked ? 'border-green-500/20 text-green-500 hover:bg-green-500/10' : 'border-red-500/20 text-red-500 hover:bg-red-500/10'}`}
                        >
                          {user.isBlocked ? (
                            <>
                              <UserCheck className="w-3 h-3 mr-2" /> RESTORE ACCESS
                            </>
                          ) : (
                            <>
                              <UserMinus className="w-3 h-3 mr-2" /> SEVER LINK
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-10 py-32 text-center opacity-20">
                      <p className="text-[10px] tracking-[1em] uppercase font-bold text-white/40">NO ENTITIES DETECTED</p>
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
