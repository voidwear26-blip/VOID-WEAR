
'use client';

import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, doc, setDoc, query, limit, orderBy } from 'firebase/firestore';
import { ChevronLeft, User as UserIcon, Package, Search, Plus, Trash2, Save, Loader2, Zap, ShieldCheck, MapPin, Calendar, CreditCard } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function NewTransmissionPage() {
  const { user: currentUser, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  
  const [orderMetadata, setOrderMetadata] = useState({
    subtotal: 0,
    taxAmount: 0,
    shippingFee: 0,
    totalAmount: 0,
    orderDate: new Date().toISOString().split('T')[0],
    transition_ID: `VOID-MANUAL-${Date.now()}`,
    paymentStatus: 'paid',
    shippingStatus: 'processing',
    displayName: '',
    email: '',
    mobileNumber: '',
    addressLine1: '',
    city: '',
    stateProvince: '',
    postalCode: ''
  });

  // 1. Fetch Collections for Selection
  const usersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'users'), limit(50));
  }, [db]);

  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'products'), limit(50));
  }, [db]);

  const { data: allUsers, isLoading: usersLoading } = useCollection(usersQuery);
  const { data: allProducts, isLoading: productsLoading } = useCollection(productsQuery);

  // 2. Filter Lists
  const filteredUsers = useMemo(() => {
    if (!allUsers) return [];
    return allUsers.filter(u => 
      u.displayName?.toLowerCase().includes(userSearch.toLowerCase()) || 
      u.email?.toLowerCase().includes(userSearch.toLowerCase())
    );
  }, [allUsers, userSearch]);

  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];
    return allProducts.filter(p => 
      p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category?.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [allProducts, productSearch]);

  // 3. Handle Entity Selection
  const handleUserSelect = (userEntity: any) => {
    setSelectedUserId(userEntity.id);
    setOrderMetadata(prev => ({
      ...prev,
      displayName: userEntity.displayName || '',
      email: userEntity.email || '',
      mobileNumber: userEntity.mobileNumber || '',
      addressLine1: userEntity.addressLine1 || '',
      city: userEntity.city || '',
      stateProvince: userEntity.stateProvince || '',
      postalCode: userEntity.postalCode || ''
    }));
    toast({ title: "ENTITY LINKED", description: `TRANSMISSION ANCHORED TO ${userEntity.email.toUpperCase()}.` });
  };

  // 4. Handle Item Management
  const addItem = (product: any) => {
    const size = Object.keys(product.stockMatrix || {})[0] || 'N/A';
    const color = product.stockMatrix?.[size] ? Object.keys(product.stockMatrix[size])[0] : 'DEFAULT';
    
    const newItem = {
      productId: product.id,
      name: product.name,
      price: product.basePrice,
      image: product.imageUrls?.[0] || 'https://picsum.photos/seed/void/200/300',
      size: size,
      color: color,
      quantity: 1
    };
    
    setSelectedItems(prev => [...prev, newItem]);
    toast({ title: "MODULE ADDED", description: `${product.name} LOGGED IN ASSEMBLY.` });
  };

  const removeItem = (idx: number) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, updates: any) => {
    setSelectedItems(prev => prev.map((item, i) => i === idx ? { ...item, ...updates } : item));
  };

  // 5. Calculate Valuation Protocol
  useEffect(() => {
    const subtotal = selectedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const totalUnits = selectedItems.reduce((acc, item) => acc + item.quantity, 0);
    const tax = subtotal * 0.05;
    const shipping = (subtotal > 0 && totalUnits < 2) ? 60 : 0;
    
    setOrderMetadata(prev => ({ 
      ...prev, 
      subtotal: subtotal,
      taxAmount: tax,
      shippingFee: shipping,
      totalAmount: subtotal + tax + shipping 
    }));
  }, [selectedItems]);

  // 6. Submit Protocol
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !selectedUserId || selectedItems.length === 0) {
      toast({ variant: "destructive", title: "TRANSMISSION_INCOMPLETE", description: "ENTITY AND ASSEMBLAGE MODULES REQUIRED." });
      return;
    }

    setLoading(true);
    const orderId = `VOID-M-${Date.now()}`;
    const orderRef = doc(db, 'users', selectedUserId, 'orders', orderId);

    const newOrder = {
      ...orderMetadata,
      id: orderId,
      order_ID: orderId,
      userId: selectedUserId,
      items: selectedItems,
      orderDate: `${orderMetadata.orderDate}T00:00:00.000Z`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(orderRef, newOrder);
      toast({ title: "TRANSMISSION SECURED", description: "MANUAL ORDER LOGGED SUCCESSFULLY." });
      router.push('/admin/orders');
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "UPLINK_FAILURE" });
    } finally {
      setLoading(false);
    }
  };

  if (isUserLoading) return null;

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen text-white">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="space-y-4 mb-16">
          <Link href="/admin/orders" className="flex items-center gap-2 text-[10px] text-white/60 hover:text-white transition-colors uppercase tracking-widest mb-4 font-bold">
            <ChevronLeft className="w-3 h-3" />
            BACK TO TRANSMISSIONS
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight glow-text uppercase leading-none">New Transmission</h1>
              <p className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">Manual Logistics Uplink</p>
            </div>
            <div className="bg-white/5 border border-white/10 px-8 py-4 flex items-center gap-4 backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-green-500/60" />
              <span className="text-[10px] tracking-[0.3em] font-bold text-white uppercase">MASTER_OVERRIDE_ACTIVE</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-12">
            <div className="bg-white/[0.02] border border-white/10 p-10 space-y-8 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">01. LINK OPERATOR</h3>
                <UserIcon className="w-4 h-4 text-white/20" />
              </div>
              
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <Input 
                  placeholder="SEARCH SYSTEM DOSSIERS..." 
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="bg-black/40 border-white/10 rounded-none h-14 pl-12 text-[10px] tracking-widest uppercase focus:border-white/40"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                {usersLoading ? (
                  <div className="col-span-full py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-white/20" /></div>
                ) : filteredUsers.map(u => (
                  <div 
                    key={u.id}
                    onClick={() => handleUserSelect(u)}
                    className={`p-6 border transition-all cursor-pointer group ${
                      selectedUserId === u.id ? 'bg-white/10 border-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'bg-black/40 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <p className="text-[10px] font-bold tracking-widest uppercase mb-1">{u.displayName || 'OPERATOR'}</p>
                    <p className="text-[8px] text-white/40 font-mono">{u.email}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/10 p-10 space-y-8 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">02. ASSEMBLE MODULES</h3>
                <Package className="w-4 h-4 text-white/20" />
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <Input 
                      placeholder="FILTER CATALOGUE..." 
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                      className="bg-black/40 border-white/10 rounded-none h-12 pl-12 text-[9px] tracking-widest uppercase"
                    />
                  </div>
                  <div className="grid gap-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                    {productsLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-white/20" />
                    ) : filteredProducts.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-4 bg-black/40 border border-white/5 group hover:border-white/20 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="relative w-10 aspect-[3/4] bg-white/5 border border-white/10 overflow-hidden">
                             <Image src={p.imageUrls?.[0] || 'https://picsum.photos/seed/void/200/300'} alt={p.name} fill className="object-cover grayscale" unoptimized />
                          </div>
                          <div>
                            <p className="text-[9px] font-bold tracking-widest uppercase">{p.name}</p>
                            <p className="text-[8px] text-white/40">₹{p.basePrice}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => addItem(p)} className="text-white/20 hover:text-white">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <span className="text-[8px] font-bold tracking-[0.3em] text-white/20 uppercase">CURRENT ASSEMBLY</span>
                  <div className="space-y-4">
                    {selectedItems.map((item, idx) => (
                      <div key={idx} className="bg-white/[0.03] border border-white/10 p-4 space-y-4">
                        <div className="flex justify-between items-start">
                          <p className="text-[10px] font-black tracking-widest uppercase">{item.name}</p>
                          <button onClick={() => removeItem(idx)} className="text-white/20 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[7px] font-bold text-white/30 uppercase">SIZE</label>
                            <Input value={item.size} onChange={e => updateItem(idx, { size: e.target.value.toUpperCase() })} className="h-8 bg-black border-white/10 text-[9px] tracking-widest rounded-none" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[7px] font-bold text-white/30 uppercase">COLOR</label>
                            <Input value={item.color} onChange={e => updateItem(idx, { color: e.target.value.toUpperCase() })} className="h-8 bg-black border-white/10 text-[9px] tracking-widest rounded-none" />
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                           <div className="flex items-center gap-4">
                              <label className="text-[7px] font-bold text-white/30 uppercase">QTY</label>
                              <Input type="number" value={item.quantity} onChange={e => updateItem(idx, { quantity: Number(e.target.value) })} className="w-16 h-8 bg-black border-white/10 text-[9px] text-center" />
                           </div>
                           <p className="text-[10px] font-bold text-white/60">₹{item.price * item.quantity}</p>
                        </div>
                      </div>
                    ))}
                    {selectedItems.length === 0 && <div className="py-20 text-center opacity-20 border border-dashed border-white/5 flex flex-col items-center gap-4"><Zap className="w-8 h-8" /><p className="text-[9px] tracking-widest uppercase">ASSEMBLY_EMPTY</p></div>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-12 lg:sticky lg:top-40 h-fit">
            <form onSubmit={handleSubmit} className="bg-white/[0.02] border border-white/10 p-10 space-y-10 backdrop-blur-3xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">03. PARAMETERS</h3>
                <Zap className="w-4 h-4 text-white/20" />
              </div>

              <div className="space-y-6">
                <div className="space-y-4 bg-black/40 p-6 border border-white/5">
                   <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                      <span className="text-white/40">SUBTOTAL</span>
                      <span className="text-white">₹{orderMetadata.subtotal.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                      <span className="text-white/40">TAX (5%)</span>
                      <span className="text-white">₹{orderMetadata.taxAmount.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                      <span className="text-white/40">SHIPPING</span>
                      <span className="text-white">{orderMetadata.shippingFee === 0 ? 'FREE' : `₹${orderMetadata.shippingFee.toFixed(2)}`}</span>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[9px] font-bold tracking-widest text-white/40 uppercase">TOTAL VALUATION (₹)</label>
                   <Input 
                      type="number" 
                      value={orderMetadata.totalAmount} 
                      onChange={e => setOrderMetadata({...orderMetadata, totalAmount: Number(e.target.value)})}
                      className="bg-black/60 border-white/10 rounded-none h-12 text-[11px] text-white font-black glow-text" 
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-bold tracking-widest text-white/40 uppercase">CYCLE_DATE</label>
                   <Input 
                      type="date" 
                      value={orderMetadata.orderDate} 
                      onChange={e => setOrderMetadata({...orderMetadata, orderDate: e.target.value})}
                      className="bg-black/60 border-white/10 rounded-none h-12 text-[10px] text-white uppercase" 
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-bold tracking-widest text-white/40 uppercase">TRANSITION_ID</label>
                   <Input 
                      value={orderMetadata.transition_ID} 
                      onChange={e => setOrderMetadata({...orderMetadata, transition_ID: e.target.value})}
                      className="bg-black/60 border-white/10 rounded-none h-12 text-[10px] text-white font-mono" 
                   />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold tracking-widest text-white/40 uppercase">PAYMENT</label>
                    <Select value={orderMetadata.paymentStatus} onValueChange={v => setOrderMetadata({...orderMetadata, paymentStatus: v})}>
                        <SelectTrigger className="bg-black/60 border-white/10 rounded-none h-12 text-[9px] uppercase">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-white/20 text-white rounded-none">
                           <SelectItem value="paid" className="text-[9px]">PAID</SelectItem>
                           <SelectItem value="pending" className="text-[9px]">PENDING</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold tracking-widest text-white/40 uppercase">SHIPPING</label>
                    <Select value={orderMetadata.shippingStatus} onValueChange={v => setOrderMetadata({...orderMetadata, shippingStatus: v})}>
                        <SelectTrigger className="bg-black/60 border-white/10 rounded-none h-12 text-[9px] uppercase">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-white/20 text-white rounded-none">
                           <SelectItem value="processing" className="text-[9px]">PROCESSING</SelectItem>
                           <SelectItem value="shipped" className="text-[9px]">SHIPPED</SelectItem>
                           <SelectItem value="delivered" className="text-[9px]">DELIVERED</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-white/5">
                   <div className="flex items-center gap-3 text-white/30">
                      <MapPin className="w-3 h-3" />
                      <span className="text-[8px] font-bold tracking-widest uppercase">DESTINATION NODE (OVERRIDE)</span>
                   </div>
                   <Input value={orderMetadata.addressLine1} onChange={e => setOrderMetadata({...orderMetadata, addressLine1: e.target.value.toUpperCase()})} placeholder="ADDRESS NODE" className="bg-black/40 border-white/10 rounded-none h-10 text-[9px] uppercase" />
                   <div className="grid grid-cols-2 gap-4">
                      <Input value={orderMetadata.city} onChange={e => setOrderMetadata({...orderMetadata, city: e.target.value.toUpperCase()})} placeholder="CITY" className="bg-black/40 border-white/10 rounded-none h-10 text-[9px] uppercase" />
                      <Input value={orderMetadata.postalCode} onChange={e => setOrderMetadata({...orderMetadata, postalCode: e.target.value})} placeholder="POSTAL" className="bg-black/40 border-white/10 rounded-none h-10 text-[9px] uppercase" />
                   </div>
                </div>
              </div>

              <Button 
                disabled={loading || !selectedUserId || selectedItems.length === 0}
                className="w-full bg-white text-black hover:bg-white/90 h-16 text-[10px] font-black tracking-[0.5em] rounded-none uppercase shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>INITIALIZE TRANSMISSION <Zap className="ml-3 w-3.5 h-3.5" /></>}
              </Button>
            </form>

            <div className="p-8 border border-white/5 bg-white/[0.01] space-y-4">
               <div className="flex items-center gap-3 text-white/40">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span className="text-[8px] font-black tracking-[0.3em] uppercase">AUDIT_COMPLIANCE</span>
               </div>
               <p className="text-[9px] text-white/40 leading-relaxed uppercase font-medium italic">
                  MANUAL TRANSMISSIONS ARE LOGGED AS VERIFIED SYSTEM ENTRIES. ENSURE FINANCIAL INTEGRITY IS CONFIRMED VIA EXTERNAL TERMINAL BEFORE FINALIZING.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
