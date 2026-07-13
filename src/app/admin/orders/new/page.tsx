'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, setDoc, query, limit } from 'firebase/firestore';
import { ChevronLeft, User as UserIcon, Package, Search, Plus, Trash2, Zap, ShieldCheck, MapPin, Loader2, CreditCard } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function NewOrderPage() {
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
    toast({ title: "CUSTOMER LINKED", description: `Order assigned to ${userEntity.email.toUpperCase()}.` });
  };

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
      isTaxable: product.isTaxable !== false,
      quantity: 1
    };
    
    setSelectedItems(prev => [...prev, newItem]);
  };

  const removeItem = (idx: number) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, updates: any) => {
    setSelectedItems(prev => prev.map((item, i) => i === idx ? { ...item, ...updates } : item));
  };

  useEffect(() => {
    const subtotal = selectedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const taxableSubtotal = selectedItems.reduce((acc, item) => {
       return (item.isTaxable !== false) ? acc + (item.price * item.quantity) : acc;
    }, 0);
    
    const totalUnits = selectedItems.reduce((acc, item) => acc + item.quantity, 0);
    const tax = taxableSubtotal * 0.05;
    const shipping = (subtotal > 0 && totalUnits < 2) ? 60 : 0;
    
    setOrderMetadata(prev => ({ 
      ...prev, 
      subtotal: subtotal,
      taxAmount: tax,
      shippingFee: shipping,
      totalAmount: subtotal + tax + shipping 
    }));
  }, [selectedItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !selectedUserId || selectedItems.length === 0) {
      toast({ variant: "destructive", title: "DATA INCOMPLETE", description: "Customer and items are required." });
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
      toast({ title: "ORDER CREATED", description: "Manual order saved successfully." });
      router.push('/admin/orders');
    } catch (e) {
      toast({ variant: "destructive", title: "SYSTEM ERROR" });
    } finally {
      setLoading(false);
    }
  };

  if (isUserLoading) return null;

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen text-black font-body">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="space-y-4 mb-16">
          <Link href="/admin/orders" className="flex items-center gap-2 text-[10px] text-black/60 hover:text-black transition-colors uppercase tracking-widest mb-4 font-bold">
            <ChevronLeft className="w-3 h-3" />
            BACK TO ORDERS
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none font-headline">New Order</h1>
              <p className="text-[10px] font-bold tracking-[0.4em] text-black/60 uppercase">Manual Entry</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-12">
            <div className="bg-black/[0.01] border border-black/5 p-10 space-y-8 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-black/10 pb-4">
                <h3 className="text-[10px] font-bold tracking-[0.4em] text-black/60 uppercase">01. LINK CUSTOMER</h3>
                <UserIcon className="w-4 h-4 text-black/20" />
              </div>
              
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
                <Input 
                  placeholder="SEARCH CUSTOMERS..." 
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="bg-black/5 border-black/10 rounded-none h-14 pl-12 text-[10px] tracking-widest uppercase focus:border-black/40"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                {usersLoading ? (
                  <div className="col-span-full py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-black/20" /></div>
                ) : filteredUsers.map(u => (
                  <div 
                    key={u.id}
                    onClick={() => handleUserSelect(u)}
                    className={`p-6 border transition-all cursor-pointer group ${
                      selectedUserId === u.id ? 'bg-black/10 border-black' : 'bg-black/5 border-black/5 hover:border-black/20'
                    }`}
                  >
                    <p className="text-[10px] font-bold tracking-widest uppercase mb-1">{u.displayName || 'CUSTOMER'}</p>
                    <p className="text-[8px] text-black/60 font-mono">{u.email}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-black/[0.01] border border-black/5 p-10 space-y-8 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-black/10 pb-4">
                <h3 className="text-[10px] font-bold tracking-[0.4em] text-black/60 uppercase">02. SELECT ITEMS</h3>
                <Package className="w-4 h-4 text-black/20" />
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
                    <Input 
                      placeholder="FILTER COLLECTION..." 
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                      className="bg-black/5 border-black/10 rounded-none h-12 pl-12 text-[9px] tracking-widest uppercase"
                    />
                  </div>
                  <div className="grid gap-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                    {productsLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-black/20" />
                    ) : filteredProducts.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-4 bg-black/5 border border-black/5 group hover:border-black/20 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="relative w-10 aspect-[3/4] bg-black/5 border border-black/5 overflow-hidden">
                             <Image src={p.imageUrls?.[0] || 'https://picsum.photos/seed/void/200/300'} alt={p.name} fill className="object-cover grayscale" unoptimized />
                          </div>
                          <div>
                            <p className="text-[9px] font-bold tracking-widest uppercase">{p.name}</p>
                            <p className="text-[8px] text-black/60">₹{p.basePrice}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => addItem(p)} className="text-black/40 hover:text-black">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <span className="text-[8px] font-bold tracking-[0.3em] text-black/40 uppercase">SELECTED MODULES</span>
                  <div className="space-y-4">
                    {selectedItems.map((item, idx) => (
                      <div key={idx} className="bg-black/5 border border-black/10 p-4 space-y-4">
                        <div className="flex justify-between items-start">
                          <p className="text-[10px] font-black tracking-widest uppercase">{item.name}</p>
                          <button onClick={() => removeItem(idx)} className="text-black/40 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[7px] font-bold text-black/60 uppercase">SIZE</label>
                            <Input value={item.size} onChange={e => updateItem(idx, { size: e.target.value.toUpperCase() })} className="h-8 bg-white border-black/10 text-[9px] tracking-widest rounded-none" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[7px] font-bold text-black/60 uppercase">COLOR</label>
                            <Input value={item.color} onChange={e => updateItem(idx, { color: e.target.value.toUpperCase() })} className="h-8 bg-white border-black/10 text-[9px] tracking-widest rounded-none" />
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                           <div className="flex items-center gap-4">
                              <label className="text-[7px] font-bold text-black/60 uppercase">QTY</label>
                              <Input type="number" value={item.quantity} onChange={e => updateItem(idx, { quantity: Number(e.target.value) })} className="w-16 h-8 bg-white border-black/10 text-[9px] text-center" />
                           </div>
                           <p className="text-[10px] font-bold text-black/80">₹{item.price * item.quantity}</p>
                        </div>
                      </div>
                    ))}
                    {selectedItems.length === 0 && <div className="py-20 text-center opacity-40 border border-dashed border-black/10 flex flex-col items-center gap-4"><Zap className="w-8 h-8" /><p className="text-[9px] tracking-widest uppercase">NO ITEMS SELECTED</p></div>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="lg:col-span-4 space-y-12 lg:sticky lg:top-40 h-fit">
            <div className="bg-black/[0.01] border border-black/5 p-10 space-y-10 backdrop-blur-3xl">
              <div className="flex items-center justify-between border-b border-black/10 pb-4">
                <h3 className="text-[10px] font-bold tracking-[0.4em] text-black/60 uppercase">03. ORDER SUMMARY</h3>
                <Zap className="w-4 h-4 text-black/20" />
              </div>

              <div className="space-y-6">
                <div className="space-y-4 bg-black/5 p-6 border border-black/5">
                   <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                      <span className="text-black/40">SUBTOTAL</span>
                      <span className="text-black">₹{orderMetadata.subtotal.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                      <span className="text-black/40">TAX</span>
                      <span className="text-black">₹{orderMetadata.taxAmount.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                      <span className="text-black/40">SHIPPING</span>
                      <span className="text-black">{orderMetadata.shippingFee === 0 ? 'FREE' : `₹${orderMetadata.shippingFee.toFixed(2)}`}</span>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[9px] font-bold tracking-widest text-black/60 uppercase">GRAND TOTAL (₹)</label>
                   <Input 
                      type="number" 
                      value={orderMetadata.totalAmount} 
                      onChange={e => setOrderMetadata({...orderMetadata, totalAmount: Number(e.target.value)})}
                      className="bg-white border-black/10 rounded-none h-12 text-[11px] text-black font-black" 
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-bold tracking-widest text-black/60 uppercase">ORDER DATE</label>
                   <Input 
                      type="date" 
                      value={orderMetadata.orderDate} 
                      onChange={e => setOrderMetadata({...orderMetadata, orderDate: e.target.value})}
                      className="bg-white border-black/10 rounded-none h-12 text-[10px] text-black uppercase" 
                   />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold tracking-widest text-black/60 uppercase">PAYMENT</label>
                    <Select value={orderMetadata.paymentStatus} onValueChange={v => setOrderMetadata({...orderMetadata, paymentStatus: v})}>
                        <SelectTrigger className="bg-white border-black/10 rounded-none h-12 text-[9px] uppercase">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-black/10 text-black rounded-none">
                           <SelectItem value="paid" className="text-[9px]">PAID</SelectItem>
                           <SelectItem value="pending" className="text-[9px]">PENDING</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold tracking-widest text-black/60 uppercase">SHIPPING</label>
                    <Select value={orderMetadata.shippingStatus} onValueChange={v => setOrderMetadata({...orderMetadata, shippingStatus: v})}>
                        <SelectTrigger className="bg-white border-black/10 rounded-none h-12 text-[9px] uppercase">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-black/10 text-black rounded-none">
                           <SelectItem value="processing" className="text-[9px]">PROCESSING</SelectItem>
                           <SelectItem value="shipped" className="text-[9px]">SHIPPED</SelectItem>
                           <SelectItem value="delivered" className="text-[9px]">DELIVERED</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-black/10">
                   <div className="flex items-center gap-3 text-black/40">
                      <MapPin className="w-3 h-3" />
                      <span className="text-[8px] font-bold tracking-widest uppercase">DELIVERY ADDRESS</span>
                   </div>
                   <Input value={orderMetadata.addressLine1} onChange={e => setOrderMetadata({...orderMetadata, addressLine1: e.target.value.toUpperCase()})} placeholder="STREET ADDRESS" className="bg-white border-black/10 rounded-none h-10 text-[9px] uppercase" />
                   <div className="grid grid-cols-2 gap-4">
                      <Input value={orderMetadata.city} onChange={e => setOrderMetadata({...orderMetadata, city: e.target.value.toUpperCase()})} placeholder="CITY" className="bg-white border-black/10 rounded-none h-10 text-[9px] uppercase" />
                      <Input value={orderMetadata.postalCode} onChange={e => setOrderMetadata({...orderMetadata, postalCode: e.target.value})} placeholder="PINCODE" className="bg-white border-black/10 rounded-none h-10 text-[9px] uppercase" />
                   </div>
                </div>
              </div>

              <Button 
                disabled={loading || !selectedUserId || selectedItems.length === 0}
                className="w-full bg-black text-white hover:bg-black/90 h-16 text-[10px] font-black tracking-[0.5em] rounded-none uppercase transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>CREATE ORDER <Zap className="ml-3 w-3.5 h-3.5" /></>}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
