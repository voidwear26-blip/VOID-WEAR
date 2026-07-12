'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { doc, collection, query, orderBy, setDoc, deleteDoc } from 'firebase/firestore';
import { ChevronLeft, User as UserIcon, Mail, Phone, MapPin, Package, Clock, ShieldAlert, Loader2, Save, Trash2, Shield, Fingerprint, ExternalLink, Zap, Info } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, use } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function UserDossierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: userId } = use(params);
  const { user: currentUser, isUserLoading: isAuthLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const currentProfileRef = useMemoFirebase(() => {
    if (!db || !currentUser) return null;
    return doc(db, 'users', currentUser.uid);
  }, [db, currentUser]);

  const { data: currentProfile, isLoading: isProfileLoading } = useDoc(currentProfileRef);

  const isAdmin = currentUser?.email?.toLowerCase() === 'voidwear26@gmail.com' || 
                  currentUser?.uid === 'A9vsqn10oddfmouKiKjWpTcFqZB2' ||
                  currentProfile?.role === 'ADMIN';

  const userRef = useMemoFirebase(() => {
    if (!db || !userId || !isAdmin) return null;
    return doc(db, 'users', userId);
  }, [db, userId, isAdmin]);

  const { data: entity, isLoading: isEntityLoading } = useDoc(userRef);

  const ordersQuery = useMemoFirebase(() => {
    if (!db || !userId || !isAdmin) return null;
    return query(
      collection(db, 'users', userId, 'orders'),
      orderBy('orderDate', 'desc')
    );
  }, [db, userId, isAdmin]);

  const { data: orders } = useCollection(ordersQuery);

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
    if (!db || !userId || !isAdmin) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', userId), {
        ...formData,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      toast({ title: "PROFILE UPDATED", description: "Customer logs synchronized." });
    } catch (e) {
      toast({ variant: "destructive", title: "UPDATE FAILURE" });
    } finally {
      setSaving(false);
    }
  };

  const handlePurge = async () => {
    if (!db || !userId || !isAdmin) return;
    if (!confirm('Permanently delete this customer account?')) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      toast({ title: "ACCOUNT DELETED" });
      router.push('/admin/users');
    } catch (e) {
      toast({ variant: "destructive", title: "DELETE FAILURE" });
    }
  };

  if (isAuthLoading || isProfileLoading || isEntityLoading) {
    return <div className="h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-black/20" /></div>;
  }

  if (!isAdmin) return null;

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen text-black font-body">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="space-y-4 mb-16">
          <Link href="/admin/users" className="flex items-center gap-2 text-[10px] text-black/60 hover:text-black transition-colors uppercase tracking-widest mb-4 font-bold">
            <ChevronLeft className="w-3 h-3" />
            BACK TO CUSTOMERS
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tight uppercase leading-none font-headline">Customer Profile</h1>
              <p className="text-[10px] font-mono text-black/40 uppercase tracking-widest">ID: {userId}</p>
            </div>
            <Button variant="ghost" onClick={handlePurge} className="text-[10px] tracking-widest text-red-600 hover:text-red-700 font-bold uppercase">
              DELETE ACCOUNT <Trash2 className="ml-2 w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <div className="bg-black/[0.01] border border-black/5 p-12 space-y-10 backdrop-blur-xl shadow-sm">
              <h3 className="text-[10px] font-bold tracking-[0.5em] text-black/60 uppercase border-b border-black/10 pb-4">CORE IDENTITY</h3>
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[9px] font-bold tracking-[0.4em] text-black/60 uppercase">FULL NAME</label>
                  <Input value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value.toUpperCase()})} className="bg-white border-black/10 rounded-none h-14 text-[10px] text-black" />
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-bold tracking-[0.4em] text-black/60 uppercase">EMAIL ADDRESS</label>
                  <Input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="bg-white border-black/10 rounded-none h-14 text-[10px] text-black" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[9px] font-bold tracking-[0.4em] text-black/60 uppercase">MOBILE NUMBER</label>
                  <Input value={formData.mobileNumber} onChange={e => setFormData({...formData, mobileNumber: e.target.value})} className="bg-white border-black/10 rounded-none h-14 text-[10px] text-black" />
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-bold tracking-[0.4em] text-black/60 uppercase">SYSTEM ROLE</label>
                  <Select value={formData.role} onValueChange={v => setFormData({...formData, role: v})}>
                    <SelectTrigger className="bg-white border-black/10 rounded-none h-14 text-[10px] text-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-black/10 text-black rounded-none">
                      <SelectItem value="OPERATOR" className="text-[10px]">CUSTOMER</SelectItem>
                      <SelectItem value="ADMIN" className="text-[10px]">ADMINISTRATOR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="bg-black/[0.01] border border-black/5 p-12 space-y-10 backdrop-blur-xl shadow-sm">
              <h3 className="text-[10px] font-bold tracking-[0.5em] text-black/60 uppercase border-b border-black/10 pb-4">DELIVERY INFO</h3>
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[9px] font-bold tracking-[0.4em] text-black/60 uppercase">STREET ADDRESS</label>
                  <Input value={formData.addressLine1} onChange={e => setFormData({...formData, addressLine1: e.target.value.toUpperCase()})} className="bg-white border-black/10 rounded-none h-14 text-[10px] text-black" />
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-bold tracking-[0.4em] text-black/60 uppercase">LANDMARK</label>
                  <Input value={formData.landmark} onChange={e => setFormData({...formData, landmark: e.target.value.toUpperCase()})} className="bg-white border-black/10 rounded-none h-14 text-[10px] text-black" />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-10">
                <div className="space-y-3">
                  <label className="text-[9px] font-bold tracking-[0.4em] text-black/60 uppercase">CITY</label>
                  <Input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value.toUpperCase()})} className="bg-white border-black/10 rounded-none h-14 text-[10px] text-black" />
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-bold tracking-[0.4em] text-black/60 uppercase">STATE</label>
                  <Input value={formData.stateProvince} onChange={e => setFormData({...formData, stateProvince: e.target.value.toUpperCase()})} className="bg-white border-black/10 rounded-none h-14 text-[10px] text-black" />
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-bold tracking-[0.4em] text-black/60 uppercase">PINCODE</label>
                  <Input value={formData.postalCode} onChange={e => setFormData({...formData, postalCode: e.target.value})} className="bg-white border-black/10 rounded-none h-14 text-[10px] text-black" />
                </div>
              </div>
            </div>

            <Button disabled={saving} className="w-full bg-black text-white hover:bg-black/90 h-20 text-[11px] font-black tracking-[0.6em] rounded-none uppercase transition-all shadow-sm">
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <>SAVE PROFILE UPDATES <Save className="ml-4 w-5 h-5" /></>}
            </Button>
          </div>

          <div className="space-y-12">
            <div className="bg-black/[0.01] border border-black/5 p-10 space-y-8 backdrop-blur-xl shadow-sm">
               <h3 className="text-[10px] font-bold tracking-[0.4em] text-black/60 uppercase border-b border-black/10 pb-4">ACCOUNT STATUS</h3>
               <div className="space-y-4">
                 <Select value={formData.isBlocked ? 'BANNED' : 'ACTIVE'} onValueChange={v => setFormData({...formData, isBlocked: v === 'BANNED'})}>
                   <SelectTrigger className={`rounded-none h-12 text-[10px] font-black uppercase ${formData.isBlocked ? 'text-red-600' : 'text-green-600'}`}>
                      <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="bg-background border-black/10 text-black rounded-none">
                      <SelectItem value="ACTIVE" className="text-[10px] text-green-600">ACTIVE</SelectItem>
                      <SelectItem value="BANNED" className="text-[10px] text-red-600">BANNED</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
            </div>

            <div className="bg-black/[0.01] border border-black/5 p-10 space-y-8 backdrop-blur-xl shadow-sm">
               <h3 className="text-[10px] font-bold tracking-[0.4em] text-black/60 uppercase border-b border-black/10 pb-4">ORDER SUMMARY</h3>
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                     <p className="text-[8px] tracking-widest text-black/40 font-bold uppercase">TOTAL ORDERS</p>
                     <p className="text-2xl font-black">{orders?.length || 0}</p>
                  </div>
                  <div className="space-y-1 text-right">
                     <p className="text-[8px] tracking-widest text-black/40 font-bold uppercase">TOTAL SPENT</p>
                     <p className="text-xl font-bold">₹{orders?.reduce((acc, o) => acc + (o.totalAmount || 0), 0).toLocaleString()}</p>
                  </div>
               </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
