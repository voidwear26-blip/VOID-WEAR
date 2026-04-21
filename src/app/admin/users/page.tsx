
'use client';

import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { ChevronLeft, ShieldAlert, ShieldCheck, Loader2, Phone, Mail, User as UserIcon, MapPin, Search, SlidersHorizontal, Trash2, Shield, UserCog } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useMemo } from 'react';

type UserSortOption = 'joined-newest' | 'joined-oldest' | 'name-asc' | 'name-desc' | 'state-asc' | 'city-asc' | 'month-asc';

export default function AdminUsersPage() {
  const { user: currentUser, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<UserSortOption>('joined-newest');

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin = currentUser?.email?.toLowerCase() === 'voidwear26@gmail.com';

  const usersQuery = useMemoFirebase(() => {
    // CRITICAL: Depend on user.uid to ensure query resets after auth
    if (!db || !currentUser?.uid || !isAdmin) return null;
    return collection(db, 'users');
  }, [db, currentUser?.uid, isAdmin]);

  const { data: users, isLoading: isCollectionLoading } = useCollection(usersQuery);

  const filteredAndSortedUsers = useMemo(() => {
    if (!users) return [];

    let result = users.filter(u => {
      const search = searchTerm.toLowerCase();
      return (
        (u.displayName || '').toLowerCase().includes(search) ||
        (u.email || '').toLowerCase().includes(search) ||
        (u.city || '').toLowerCase().includes(search) ||
        (u.stateProvince || '').toLowerCase().includes(search)
      );
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'joined-oldest':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case 'name-asc':
          return (a.displayName || '').localeCompare(b.displayName || '');
        case 'name-desc':
          return (b.displayName || '').localeCompare(a.displayName || '');
        case 'state-asc':
          return (a.stateProvince || '').localeCompare(b.stateProvince || '');
        case 'city-asc':
          return (a.city || '').localeCompare(b.city || '');
        case 'month-asc':
          const monthA = a.createdAt ? new Date(a.createdAt).getMonth() : 0;
          const monthB = b.createdAt ? new Date(b.createdAt).getMonth() : 0;
          return monthA - monthB;
        case 'joined-newest':
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });

    return result;
  }, [users, searchTerm, sortBy]);

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

  const deleteUserRecord = async (userId: string) => {
    if (!db) return;
    if (!confirm('CONFIRM PERMANENT DESTRUCTION OF ENTITY LOGS? THIS ACTION IS IRREVERSIBLE.')) return;
    
    try {
      await deleteDoc(doc(db, 'users', userId));
      toast({
        title: "ENTITY PURGED",
        description: "LOGS SUCCESSFULLY REMOVED FROM ARCHIVE.",
      });
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "PURGE FAILED",
        description: "SYSTEM ERROR DURING DELETION SEQUENCE.",
      });
    }
  };

  if (!mounted || isUserLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="w-10 h-10 animate-spin text-white/60" />
          <div className="text-[10px] tracking-[1em] text-white/80 uppercase font-bold">Authenticating Protocol...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="h-screen flex items-center justify-center text-[10px] tracking-[1em] uppercase opacity-40 text-white font-bold">
        ACCESS DENIED // MASTER ONLY
      </div>
    );
  }

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="space-y-4">
            <Link href="/admin" className="flex items-center gap-2 text-[10px] text-white/60 hover:text-white transition-colors uppercase tracking-widest mb-4 font-bold">
              <ChevronLeft className="w-3 h-3" />
              BACK TO SYSTEM
            </Link>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight glow-text uppercase leading-none">Entity Archive</h1>
          </div>
          <div className="bg-white/5 px-6 py-4 border border-white/10 flex items-center gap-4 backdrop-blur-md">
            <ShieldAlert className="w-4 h-4 text-white/60" />
            <span className="text-[10px] tracking-[0.3em] font-bold text-white/60 uppercase">USER MODERATION ACTIVE</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 mb-12 items-start md:items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-white/80 transition-colors" />
            <Input 
              placeholder="SEARCH ENTITIES (NAME, CITY, STATE)..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border-white/10 h-14 pl-12 rounded-none text-[10px] tracking-[0.3em] focus-visible:ring-0 focus-visible:border-white/40 font-bold text-white uppercase placeholder:text-white/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="hidden sm:flex items-center gap-2 text-[8px] tracking-[0.4em] text-white/40 uppercase font-bold mr-2">
              <SlidersHorizontal className="w-3 h-3" />
              SORT_PROTOCOL:
            </div>
            <Select value={sortBy} onValueChange={(val) => setSortBy(val as UserSortOption)}>
              <SelectTrigger className="w-full md:w-64 bg-white/5 border-white/10 rounded-none h-14 text-[9px] tracking-[0.3em] uppercase focus:ring-0 text-white font-bold transition-all hover:bg-white/10">
                <SelectValue placeholder="SORT_BY" />
              </SelectTrigger>
              <SelectContent className="bg-black border-white/20 text-white rounded-none">
                <SelectItem value="joined-newest" className="text-[9px] tracking-widest uppercase">RECENT INITIALIZATION</SelectItem>
                <SelectItem value="joined-oldest" className="text-[9px] tracking-widest uppercase">LEGACY ENTITIES</SelectItem>
                <SelectItem value="name-asc" className="text-[9px] tracking-widest uppercase">IDENTITY: A - Z</SelectItem>
                <SelectItem value="name-desc" className="text-[9px] tracking-widest uppercase">IDENTITY: Z - A</SelectItem>
                <SelectItem value="state-asc" className="text-[9px] tracking-widest uppercase">GEO: STATE</SelectItem>
                <SelectItem value="city-asc" className="text-[9px] tracking-widest uppercase">GEO: CITY (DISTRICT)</SelectItem>
                <SelectItem value="month-asc" className="text-[9px] tracking-widest uppercase">CYCLE: JOIN MONTH</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/60">ENTITY IDENTIFIER</th>
                  <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/60">CONTACT PROTOCOLS</th>
                  <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/60">ROLE // GEO</th>
                  <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/60">STATUS</th>
                  <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/60 text-right">COMMAND</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isCollectionLoading ? (
                  [1, 2, 3].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-10 py-12 bg-white/[0.01]" />
                    </tr>
                  ))
                ) : filteredAndSortedUsers && filteredAndSortedUsers.length > 0 ? (
                  filteredAndSortedUsers.map((entity) => (
                    <tr key={entity.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 border border-white/10 bg-white/5 flex items-center justify-center group-hover:border-white/40 transition-colors">
                            <UserIcon className="w-4 h-4 text-white/40" />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold tracking-widest text-white uppercase">{entity.displayName || 'UNIDENTIFIED OPERATOR'}</span>
                            <p className="text-[8px] font-mono tracking-widest text-white/40 uppercase">UID: {entity.id.slice(0, 12)}...</p>
                            <p className="text-[7px] font-bold text-white/20 tracking-widest uppercase">JOINED: {entity.createdAt ? new Date(entity.createdAt).toLocaleDateString() : 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-[9px] text-white/80 tracking-widest font-bold uppercase">
                            <Mail className="w-3.5 h-3.5 text-white/40" /> {entity.email}
                          </div>
                          {entity.mobileNumber && (
                            <div className="flex items-center gap-2 text-[9px] text-white/80 tracking-widest font-bold">
                              <Phone className="w-3.5 h-3.5 text-white/40" /> {entity.mobileNumber}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="space-y-2">
                           <div className="flex items-center gap-2 text-[9px] font-black tracking-widest uppercase">
                              <Shield className={`w-3 h-3 ${entity.role === 'ADMIN' ? 'text-white' : 'text-white/20'}`} />
                              <span className={entity.role === 'ADMIN' ? 'text-white' : 'text-white/40'}>{entity.role || 'OPERATOR'}</span>
                           </div>
                           <div className="flex items-center gap-2 text-[9px] text-white/40 tracking-widest font-bold uppercase">
                             <MapPin className="w-3.5 h-3.5" />
                             {entity.city || 'GRID'}{entity.stateProvince ? `, ${entity.stateProvince}` : ' UNSET'}
                           </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-2">
                          {entity.isBlocked ? (
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
                        <div className="flex items-center justify-end gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                          <Link href={`/admin/users/${entity.id}`}>
                            <Button variant="ghost" size="icon" className="text-white hover:text-white transition-colors">
                              <UserCog className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => deleteUserRecord(entity.id)}
                            className="text-white hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => toggleBlockStatus(entity.id, entity.isBlocked || false)}
                            className={`text-[9px] tracking-widest uppercase h-10 rounded-none px-6 border font-bold ${entity.isBlocked ? 'border-green-500/20 text-green-500 hover:bg-green-500/10' : 'border-red-500/20 text-red-500 hover:bg-red-500/10'}`}
                          >
                            {entity.isBlocked ? 'RESTORE' : 'SEVER'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-10 py-32 text-center opacity-40">
                      <p className="text-[10px] tracking-[1em] uppercase font-bold text-white">NO ENTITIES MATCH SEARCH COORDINATES</p>
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
