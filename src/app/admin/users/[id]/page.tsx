
'use client';

import { useFirestore, useDoc, useMemoFirebase, useUser, useCollection } from '@/firebase';
import { doc, collection, query, orderBy, setDoc, deleteDoc } from 'firebase/firestore';
import { ChevronLeft, User as UserIcon, Mail, Phone, MapPin, Package, Clock, ShieldAlert, ShieldCheck, ShoppingBag, Loader2, Save, Trash2, Shield, Fingerprint, ExternalLink, Zap, Info } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, use } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function UserDossierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: userId } = use(params);
  const { user: currentUser } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const isAdmin = currentUser?.email?.toLowerCase() === 'voidwear26@gmail.com';

  const userRef = useMemoFirebase(() => {
    if (!db || !userId || !isAdmin) return null;
    return doc(db, 'users', userId);
  }, [db, userId, isAdmin]);

  const { data: entity, isLoading: isEntityLoading } = useDoc(userRef);

  const ordersQuery = useMemoFirebase(() => {
    if (!db || !userId || !isAdmin) return null;
    return query(
      collection(db, 'users', userId, 'orders'),
      orderBy('createdAt', 'desc')
    );
  }, [db, userId, isAdmin]);

  const { data: orders, isLoading: isOrdersLoading } = useCollection(ordersQuery);

  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    mobileNumber: '',
    role: 'OPERATOR',
    city: '',
    stateProvince: '',
    postalCode: '',
    addressLine1: '',
    landmark: '',
    isBlocked: false
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (entity) {
      setFormData({
        displayName: entity.displayName || '',
        email: entity.email || '',
        mobileNumber: entity.mobileNumber || '',
        role: entity.role || 'OPERATOR',
        city: entity.city || '',
        stateProvince: entity.stateProvince || '',
        postalCode: entity.postalCode || '',
        addressLine1: entity.addressLine1 || '',
        landmark: entity.landmark || '',
        isBlocked: entity.isBlocked || false
      });
    }
  }, [entity]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !userId) return;
    setSaving(true);
    try {
      // Optimistic non-blocking save
      setDoc(doc(db, 'users', userId), {
        ...formData,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      toast({ title: "ENTITY RECONFIGURED", description: "SYSTEM LOGS SYNCHRONIZED SUCCESSFULLY." });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "UPLINK FAILURE", description: "COULD NOT SYNC CHANGES." });
    } finally {
      setSaving(false);
    }
  };

  const handlePurge = async () => {
    if (!db || !userId) return;
    if (!confirm('INITIATE TOTAL DATA PURGE FOR THIS ENTITY?')) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      toast({ title: "ENTITY PURGED", description: "ALL LOGS SEVERED." });
      router.push('/admin/users');
    } catch (e) {
      console.error(e);
    }
  };

  if (!isAdmin) {
    return <div className="h-screen flex items-center justify-center opacity-20 text-[10px] tracking-[1em] uppercase text-white">Authenticating Protocol...</div>;
  }

  if (isEntityLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white/20" />
      </div>
    );
  }

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen text-white">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="space-y-4 mb-16">
          <Link href="/admin/users" className="flex items-center gap-2 text-[10px] text-white/20 hover:text-white transition-colors uppercase tracking-widest mb-4 font-bold">
            <ChevronLeft className="w-3 h-3" />
            BACK TO ENTITIES
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tight glow-text uppercase leading-none">Entity Dossier</h1>
              <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">ENTITY_UID: {userId}</p>
            </div>
            <div className="flex items-center gap-4">
               <Button variant="ghost" onClick={handlePurge} className="text-[10px] tracking-widest text-red-500/60 hover:text-red-500 font-bold uppercase">
                  PURGE LOGS <Trash2 className="ml-2 w-3.5 h-3.5" />
               </Button>
               <div className={`px-6 py-2 border text-[10px] tracking-[0.3em] font-bold uppercase ${
                 formData.isBlocked ? 'border-red-500/50 text-red-500' : 'border-green-500/50 text-green-500'
               }`}>
                 {formData.isBlocked ? 'ACCESS SEVERED' : 'UPLINK ACTIVE'}
               </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <div className="bg-white/[0.02] border border-white/5 p-12 space-y-10 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-6">
                 <h3 className="text-[10px] font-bold tracking-[0.5em] text-white/60 uppercase">CORE IDENTITY MODULE</h3>
                 <UserIcon className="w-4 h-4 text-white/20" />
              </div>
              
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[9px] font-bold tracking-[0.4em] text-white/40 uppercase">ENTITY IDENTIFIER (NAME)</label>
                  <Input 
                    value={formData.displayName} 
                    onChange={e => setFormData({...formData, displayName: e.target.value.toUpperCase()})}
                    className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest focus:border-white/40 text-white"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-bold tracking-[0.4em] text-white/40 uppercase">COMM-CHANNEL (EMAIL)</label>
                  <Input 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest focus:border-white/40 text-white"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[9px] font-bold tracking-[0.4em] text-white/40 uppercase">UPLINK MODULE (MOBILE)</label>
                  <Input 
                    value={formData.mobileNumber} 
                    onChange={e => setFormData({...formData, mobileNumber: e.target.value})}
                    className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest focus:border-white/40 text-white"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-bold tracking-[0.4em] text-white/40 uppercase">SYSTEM ROLE</label>
                  <Select value={formData.role} onValueChange={v => setFormData({...formData, role: v})}>
                    <SelectTrigger className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest focus:ring-0 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-white/20 text-white rounded-none">
                      <SelectItem value="OPERATOR" className="text-[10px] tracking-widest">OPERATOR</SelectItem>
                      <SelectItem value="ADMIN" className="text-[10px] tracking-widest">ADMINISTRATOR</SelectItem>
                      <SelectItem value="COURIER" className="text-[10px] tracking-widest">COURIER</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-12 space-y-10 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-6">
                 <h3 className="text-[10px] font-bold tracking-[0.5em] text-white/60 uppercase">LOGISTICAL NODE MODULE</h3>
                 <MapPin className="w-4 h-4 text-white/20" />
              </div>
              
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[9px] font-bold tracking-[0.4em] text-white/40 uppercase">PRIMARY ADDRESS NODE</label>
                  <Input 
                    value={formData.addressLine1} 
                    onChange={e => setFormData({...formData, addressLine1: e.target.value.toUpperCase()})}
                    className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest focus:border-white/40 text-white"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-bold tracking-[0.4em] text-white/40 uppercase">LANDMARK</label>
                  <Input 
                    value={formData.landmark} 
                    onChange={e => setFormData({...formData, landmark: e.target.value.toUpperCase()})}
                    className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest focus:border-white/40 text-white"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-10">
                <div className="space-y-3">
                  <label className="text-[9px] font-bold tracking-[0.4em] text-white/40 uppercase">CITY / DISTRICT</label>
                  <Input 
                    value={formData.city} 
                    onChange={e => setFormData({...formData, city: e.target.value.toUpperCase()})}
                    className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest focus:border-white/40 text-white"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-bold tracking-[0.4em] text-white/40 uppercase">STATE / PROVINCE</label>
                  <Input 
                    value={formData.stateProvince} 
                    onChange={e => setFormData({...formData, stateProvince: e.target.value.toUpperCase()})}
                    className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest focus:border-white/40 text-white"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-bold tracking-[0.4em] text-white/40 uppercase">POSTAL CODE</label>
                  <Input 
                    value={formData.postalCode} 
                    onChange={e => setFormData({...formData, postalCode: e.target.value})}
                    className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest focus:border-white/40 text-white"
                  />
                </div>
              </div>
            </div>

            <Button 
              disabled={saving}
              className="w-full bg-white text-black hover:bg-white/90 h-20 text-[11px] font-black tracking-[0.6em] rounded-none shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all uppercase"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  RECONFIGURE ENTITY LOGS <Save className="ml-4 w-5 h-5" />
                </>
              )}
            </Button>
          </div>

          <div className="space-y-12">
            <div className="bg-white/[0.02] border border-white/5 p-10 space-y-8 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                 <h3 className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">SECURITY MODULE</h3>
                 <Fingerprint className="w-4 h-4 text-white/20" />
              </div>
              <div className="p-6 border border-white/5 bg-black/20 space-y-4">
                <div className="flex items-center gap-3 text-white/40">
                   <ShieldAlert className="w-3.5 h-3.5" />
                   <span className="text-[8px] tracking-[0.2em] font-black uppercase">ACCESS KEY PROTOCOL</span>
                </div>
                <p className="text-[9px] text-white/40 tracking-widest leading-relaxed uppercase font-bold italic">
                   FIREBASE SECURITY PROTOCOLS PREVENT PLAIN-TEXT PASSWORD RETRIEVAL. ACCESS KEYS ARE SALTED AND HASHED AT THE ARCHITECTURAL LEVEL. 
                </p>
              </div>
              <div className="space-y-4">
                 <label className="text-[9px] font-bold tracking-[0.4em] text-white/40 uppercase">UPLINK STATUS</label>
                 <div className="flex items-center gap-4">
                   <Select value={formData.isBlocked ? 'SEVERED' : 'ACTIVE'} onValueChange={v => setFormData({...formData, isBlocked: v === 'SEVERED'})}>
                     <SelectTrigger className={`rounded-none h-12 text-[10px] tracking-widest font-black uppercase ${formData.isBlocked ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-green-500/10 border-green-500/20 text-green-500'}`}>
                        <SelectValue />
                     </SelectTrigger>
                     <SelectContent className="bg-black border-white/20 text-white rounded-none">
                        <SelectItem value="ACTIVE" className="text-[10px] tracking-widest text-green-500">ACTIVE_UPLINK</SelectItem>
                        <SelectItem value="SEVERED" className="text-[10px] tracking-widest text-red-500">SEVER_ACCESS</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-10 space-y-8 backdrop-blur-xl">
               <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">MISSION SUMMARY</h3>
                  <Zap className="w-4 h-4 text-white/20" />
               </div>
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                     <p className="text-[8px] tracking-widest text-white/40 font-bold uppercase">TRANSMISSIONS</p>
                     <p className="text-2xl font-black glow-text">{orders?.length || 0}</p>
                  </div>
                  <div className="space-y-1 text-right">
                     <p className="text-[8px] tracking-widest text-white/40 font-bold uppercase">VALUATION</p>
                     <p className="text-xl font-bold tracking-tighter">₹{orders?.reduce((acc, o) => acc + (o.totalAmount || 0), 0).toLocaleString()}</p>
                  </div>
               </div>
               {orders && orders.length > 0 && (
                 <div className="space-y-4 pt-6 border-t border-white/5">
                    {orders.slice(0, 3).map(o => (
                      <div key={o.id} className="flex justify-between items-center text-[9px] tracking-widest uppercase text-white/40 font-bold">
                         <span>{o.id.slice(0, 8)}...</span>
                         <span className="text-white/60">₹{o.totalAmount}</span>
                      </div>
                    ))}
                    <Link href={`/admin/orders?user=${userId}`} className="block text-[8px] tracking-[0.4em] text-white/60 hover:text-white transition-colors uppercase font-black pt-2 flex items-center gap-2">
                       VIEW ALL MISSION LOGS <ExternalLink className="w-3 h-3" />
                    </Link>
                 </div>
               )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
