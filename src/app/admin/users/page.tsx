'use client';

import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { ChevronLeft, ShieldAlert, ShieldCheck, Loader2, Phone, Mail, User as UserIcon, MapPin, Search, SlidersHorizontal, Trash2, Shield, UserCog } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useMemo } from 'react';

export default function AdminUsersPage() {
  const { user: currentUser, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const profileRef = useMemoFirebase(() => {
    if (!db || !currentUser) return null;
    return doc(db, 'users', currentUser.uid);
  }, [db, currentUser]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  const isAdmin = useMemo(() => {
    if (isUserLoading || !currentUser) return false;
    return currentUser.email?.toLowerCase() === 'voidwear26@gmail.com' || 
           currentUser.uid === 'A9vsqn10oddfmouKiKjWpTcFqZB2' ||
           profile?.role === 'ADMIN';
  }, [currentUser, isUserLoading, profile]);

  const usersQuery = useMemoFirebase(() => {
    if (!db || !currentUser?.uid || !isAdmin) return null;
    return collection(db, 'users');
  }, [db, currentUser?.uid, isAdmin]);

  const { data: users, isLoading: isCollectionLoading } = useCollection(usersQuery);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(u => {
      const search = searchTerm.toLowerCase();
      return (u.displayName || '').toLowerCase().includes(search) || (u.email || '').toLowerCase().includes(search);
    });
  }, [users, searchTerm]);

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
            <Link href="/admin" className="flex items-center gap-2 text-[10px] text-black/60 hover:text-black transition-colors uppercase tracking-widest mb-4 font-bold">
              <ChevronLeft className="w-3 h-3" />
              BACK TO SYSTEM
            </Link>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none font-headline">Customers</h1>
          </div>
        </div>

        <div className="relative max-w-xl mb-12">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
          <Input 
            placeholder="SEARCH CUSTOMERS..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-black/5 border-black/10 h-14 pl-12 rounded-none text-[10px] tracking-[0.2em] font-bold text-black uppercase transition-all"
          />
        </div>

        <div className="bg-black/[0.01] border border-black/5 overflow-hidden backdrop-blur-xl">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/5 bg-black/[0.02]">
                <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-black/40">CUSTOMER</th>
                <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-black/40">CONTACT</th>
                <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-black/40 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {isCollectionLoading ? (
                <tr><td colSpan={3} className="px-10 py-32 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-black/20" /></td></tr>
              ) : filteredUsers.map((entity) => (
                <tr key={entity.id} className="hover:bg-black/[0.02] transition-colors group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 border border-black/10 bg-black/5 flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-black/40" />
                      </div>
                      <span className="text-[10px] font-bold tracking-widest text-black uppercase">{entity.displayName || 'UNNAMED'}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <p className="text-[9px] text-black/80 tracking-widest font-bold">{entity.email}</p>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <Link href={`/admin/users/${entity.id}`}>
                      <Button variant="ghost" size="icon" className="text-black/40 hover:text-black"><UserCog className="w-4 h-4" /></Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
