'use client';

import { useFirestore, useDoc, useMemoFirebase, useUser } from '@/firebase';
import { doc, updateDoc, arrayUnion, deleteDoc } from 'firebase/firestore';
import { ChevronLeft, ShoppingBag, User as UserIcon, Calendar, CreditCard, Truck, Package, Loader2, Phone, Mail, MapPin, Send, Zap, Info, Hash, ShieldAlert, Download, Edit3, Save, Trash2, X, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { generateNotificationContent } from '@/ai/flows/generate-notification-content';
import { generateInvoicePDF } from '@/lib/invoice-generator';

export default function OrderDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = params.id as string;
  const userId = searchParams.get('user');
  
  const { user: currentUser } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [notifying, setNotifying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const isAdmin = currentUser?.email?.toLowerCase() === 'voidwear26@gmail.com' || 
                  currentUser?.uid === 'A9vsqn10oddfmouKiKjWpTcFqZB2';

  const orderRef = useMemoFirebase(() => {
    if (!db || !userId || !orderId || !isAdmin) return null;
    return doc(db, 'users', userId, 'orders', orderId);
  }, [db, userId, orderId, isAdmin]);

  const { data: order, isLoading } = useDoc(orderRef);

  const entityRef = useMemoFirebase(() => {
    if (!db || !userId || !isAdmin) return null;
    return doc(db, 'users', userId);
  }, [db, userId, isAdmin]);

  const { data: entity } = useDoc(entityRef);

  const [editForm, setEditForm] = useState({
    totalAmount: 0,
    orderDate: '',
    transition_ID: '',
    paymentStatus: 'paid'
  });

  useEffect(() => {
    if (order) {
      setEditForm({
        totalAmount: order.totalAmount || 0,
        orderDate: order.orderDate ? order.orderDate.split('T')[0] : '',
        transition_ID: order.transition_ID || order.paymentProviderId || '',
        paymentStatus: order.paymentStatus || 'paid'
      });
    }
  }, [order]);

  const handleStatusChange = async (newStatus: string) => {
    if (!db || !order || !entity) return;
    setNotifying(true);

    try {
      const notification = await generateNotificationContent({
        productName: order.items?.[0]?.name || 'ASSEMBLAGE MODULE',
        status: newStatus,
        trackingId: order.trackingId,
        operatorName: entity.displayName || 'OPERATOR'
      });

      await updateDoc(orderRef!, {
        shippingStatus: newStatus,
        updatedAt: new Date().toISOString(),
        transmissions: arrayUnion({
          type: 'STATUS_UPDATE',
          status: newStatus,
          timestamp: new Date().toISOString(),
          content: notification
        })
      });

      toast({
        title: "TRANSITION_LOGGED",
        description: `NEURAL UPDATE DISPATCHED TO ${entity.email?.toUpperCase()}.`,
      });
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "UPLINK_FAILURE",
        description: "COULD NOT GENERATE NEURAL CONTENT.",
      });
    } finally {
      setNotifying(false);
    }
  };

  const handleUpdateRecord = async () => {
    if (!db || !orderRef) return;
    setSaving(true);
    try {
      const updateData = {
        ...editForm,
        totalAmount: Number(editForm.totalAmount),
        // Ensure ISO format for date if edited
        orderDate: editForm.orderDate.includes('T') ? editForm.orderDate : `${editForm.orderDate}T00:00:00.000Z`,
        updatedAt: new Date().toISOString()
      };

      await updateDoc(orderRef, updateData);
      toast({ title: "RECORD OVERRIDDEN", description: "SYSTEM LOGS SYNCHRONIZED." });
      setIsEditing(false);
    } catch (e) {
      toast({ variant: "destructive", title: "SYNC_FAILURE" });
    } finally {
      setSaving(false);
    }
  };

  const handlePurgeOrder = async () => {
    if (!db || !orderRef) return;
    if (!confirm('INITIATE TOTAL PURGE OF THIS TRANSMISSION LOG? THIS ACTION IS IRREVERSIBLE.')) return;
    
    try {
      await deleteDoc(orderRef);
      toast({ title: "LOG PURGED", description: "TRANSMISSION SEVERED FROM ARCHIVE." });
      router.push('/admin/orders');
    } catch (e) {
      toast({ variant: "destructive", title: "PURGE_FAILURE" });
    }
  };

  const handleDownloadInvoice = () => {
    if (order) {
      generateInvoicePDF(order);
      toast({ title: "LOG GENERATED", description: "TRANSMISSION BILL DOWNLOADED." });
    }
  };

  if (!isAdmin) {
    return <div className="h-screen flex items-center justify-center opacity-20 text-[10px] tracking-[1em] uppercase">Authenticating Protocol...</div>;
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white/40" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-6">
        <p className="text-[10px] tracking-[1em] uppercase text-white/40">TRANSMISSION LOG NOT FOUND</p>
        <Link href="/admin/orders" className="text-[10px] tracking-widest text-white border-b border-white/20 pb-2 font-bold uppercase">Back to System</Link>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="space-y-4 mb-16">
          <Link href="/admin/orders" className="flex items-center gap-2 text-[10px] text-white/60 hover:text-white transition-colors uppercase tracking-widest mb-4 font-bold">
            <ChevronLeft className="w-3 h-3" />
            BACK TO TRANSMISSIONS
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tight glow-text uppercase leading-none text-white">Transmission Detail</h1>
              <div className="flex flex-col gap-1">
                 <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">ORDER_UID: {orderId}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => setIsEditing(!isEditing)}
                className="h-12 border border-white/10 bg-white/5 hover:bg-white/10 rounded-none text-[10px] font-bold tracking-widest uppercase text-white"
              >
                {isEditing ? <><X className="mr-2 w-3.5 h-3.5" /> CANCEL EDIT</> : <><Edit3 className="mr-2 w-3.5 h-3.5" /> OVERRIDE RECORD</>}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDownloadInvoice}
                className="h-12 border-white/10 bg-white/5 hover:bg-white hover:text-black rounded-none text-[10px] font-bold tracking-widest uppercase transition-all"
              >
                DOWNLOAD LOG <Download className="ml-2 w-3.5 h-3.5" />
              </Button>
              <Select defaultValue={order.shippingStatus || 'processing'} onValueChange={handleStatusChange} disabled={notifying}>
                <SelectTrigger className="w-48 bg-white/5 border-white/20 rounded-none h-12 text-[10px] tracking-[0.2em] uppercase text-white font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/20 text-white rounded-none">
                  <SelectItem value="processing" className="text-[10px] tracking-widest uppercase">PROCESSING</SelectItem>
                  <SelectItem value="shipped" className="text-[10px] tracking-widest uppercase">SHIPPED</SelectItem>
                  <SelectItem value="out-for-delivery" className="text-[10px] tracking-widest uppercase">OUT_FOR_DELIVERY</SelectItem>
                  <SelectItem value="delivered" className="text-[10px] tracking-widest uppercase text-green-500">DELIVERED</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="mb-12 bg-white/[0.03] border border-white/20 p-10 space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
             <div className="flex items-center gap-4 text-white">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                <h3 className="text-sm font-black tracking-[0.4em] uppercase">SYSTEM_RECORD_OVERRIDE</h3>
             </div>
             <div className="grid md:grid-cols-3 gap-8">
                <div className="space-y-2">
                   <label className="text-[9px] font-bold tracking-widest text-white/40 uppercase">VALUATION (₹)</label>
                   <Input 
                      type="number" 
                      value={editForm.totalAmount} 
                      onChange={e => setEditForm({...editForm, totalAmount: Number(e.target.value)})}
                      className="bg-black/60 border-white/10 rounded-none h-12 text-[10px] text-white" 
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-bold tracking-widest text-white/40 uppercase">CYCLE_DATE</label>
                   <Input 
                      type="date" 
                      value={editForm.orderDate} 
                      onChange={e => setEditForm({...editForm, orderDate: e.target.value})}
                      className="bg-black/60 border-white/10 rounded-none h-12 text-[10px] text-white uppercase" 
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-bold tracking-widest text-white/40 uppercase">PAYMENT_STATUS</label>
                   <Select value={editForm.paymentStatus} onValueChange={v => setEditForm({...editForm, paymentStatus: v})}>
                      <SelectTrigger className="bg-black/60 border-white/10 rounded-none h-12 text-[10px] text-white uppercase">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-white/10 text-white rounded-none">
                         <SelectItem value="paid" className="text-[10px] uppercase">PAID</SelectItem>
                         <SelectItem value="pending" className="text-[10px] uppercase">PENDING</SelectItem>
                         <SelectItem value="refunded" className="text-[10px] uppercase text-red-500">REFUNDED</SelectItem>
                      </SelectContent>
                   </Select>
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-[9px] font-bold tracking-widest text-white/40 uppercase">TRANSITION_ID (GATEWAY_IDENTIFIER)</label>
                <Input 
                   value={editForm.transition_ID} 
                   onChange={e => setEditForm({...editForm, transition_ID: e.target.value})}
                   className="bg-black/60 border-white/10 rounded-none h-12 text-[10px] text-white font-mono" 
                />
             </div>
             <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <Button variant="ghost" onClick={handlePurgeOrder} className="text-[10px] tracking-widest text-red-500 hover:text-red-400 font-black uppercase">
                   PURGE LOG <Trash2 className="ml-2 w-3.5 h-3.5" />
                </Button>
                <Button disabled={saving} onClick={handleUpdateRecord} className="bg-white text-black hover:bg-white/90 h-14 px-10 text-[10px] font-black tracking-widest rounded-none">
                   {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <>SYNC RECORD OVERRIDE <Save className="ml-3 w-4 h-4" /></>}
                </Button>
             </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <div className="bg-white/[0.02] border border-white/10 p-10 space-y-8 backdrop-blur-xl">
              <h3 className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase border-b border-white/10 pb-4">MODULES IN TRANSMISSION</h3>
              {order.items && order.items.length > 0 ? (
                <div className="space-y-6">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between group">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-16 bg-white/5 border border-white/10 flex items-center justify-center">
                          {item.image ? (
                             <Image src={item.image} alt={item.name || 'Module'} width={48} height={64} className="object-cover grayscale" unoptimized />
                          ) : (
                             <Package className="w-5 h-5 text-white/40" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-[11px] font-bold tracking-widest uppercase text-white">{item.name || 'ASSEMBLAGE MODULE'}</p>
                          <p className="text-[9px] text-white/60 tracking-widest uppercase">SIZE: {item.size || 'N/A'} // QTY: {item.quantity || 1}</p>
                        </div>
                      </div>
                      <p className="text-[11px] font-bold tracking-widest text-white">₹{item.price || 0}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 flex flex-col items-center gap-4 opacity-40">
                  <Package className="w-8 h-8 stroke-[0.5px]" />
                  <p className="text-[10px] tracking-widest uppercase">AGGREGATED TRANSACTION LOG</p>
                </div>
              )}
              
              <div className="pt-8 border-t border-white/10 flex justify-between items-center">
                <span className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">TOTAL VALUATION</span>
                <span className="text-2xl font-black tracking-tight glow-text text-white">₹{order.totalAmount}</span>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/10 p-10 space-y-8 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">TRANS_ID VERIFICATION</h3>
                <ShieldAlert className="w-3.5 h-3.5 text-white/40" />
              </div>
              <div className="p-8 border border-white/5 bg-black/40 space-y-4">
                 <div className="flex flex-col gap-2">
                    <span className="text-[8px] font-bold tracking-widest uppercase text-white/30">GATEWAY_TRANSITION_ID</span>
                    <span className="text-sm font-mono text-white tracking-widest uppercase">{order.transition_ID || order.paymentProviderId || 'INTERNAL_SYNC'}</span>
                 </div>
                 <p className="text-[9px] text-white/40 italic leading-relaxed uppercase">
                    USE THIS IDENTIFIER IN THE GATEWAY CONSOLE TO VERIFY AMOUNT TRANSMISSION AND INTEGRITY.
                 </p>
              </div>
            </div>
          </div>

          <div className="space-y-12">
            <div className="bg-white/[0.02] border border-white/10 p-10 space-y-8 backdrop-blur-xl">
              <h3 className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase border-b border-white/10 pb-4">ENTITY DOSSIER</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-white/60" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[12px] font-black tracking-widest uppercase text-white">{entity?.displayName || order.displayName || 'OPERATOR'}</p>
                    <p className="text-[9px] text-white/60 tracking-widest uppercase font-mono">{userId?.slice(0, 16)}...</p>
                  </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-3 text-[10px] text-white/80 tracking-widest uppercase font-bold">
                    <Mail className="w-3.5 h-3.5 text-white/40" />
                    {entity?.email || order.email || 'N/A'}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-white/80 tracking-widest uppercase font-bold">
                    <Phone className="w-3.5 h-3.5 text-white/40" />
                    {entity?.mobileNumber || order.mobileNumber || 'NOT PROVIDED'}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-white/80 tracking-widest uppercase font-bold">
                    <Calendar className="w-3.5 h-3.5 text-white/40" />
                    INITIALIZED: {new Date(order.orderDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/10 p-10 space-y-6 backdrop-blur-xl">
               <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3 text-white/60">
                    <MapPin className="w-4 h-4" />
                    <span className="text-[10px] font-bold tracking-widest uppercase">DESTINATION NODE</span>
                  </div>
               </div>
               <div className="space-y-2">
                  <p className="text-[11px] text-white tracking-widest uppercase font-bold">
                    {order.addressLine1 || entity?.addressLine1 || 'NO ADDRESS LOGGED'}
                  </p>
                  <p className="text-[10px] text-white/60 tracking-widest uppercase font-bold">
                    {order.city || entity?.city || 'UNKNOWN'}, {order.stateProvince || entity?.stateProvince || 'N/A'} {order.postalCode || entity?.postalCode || ''}
                  </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
