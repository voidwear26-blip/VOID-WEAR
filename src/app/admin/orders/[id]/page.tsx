'use client';

import { useFirestore, useDoc, useMemoFirebase, useUser } from '@/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { ChevronLeft, ShoppingBag, User as UserIcon, Calendar, CreditCard, Truck, Package, Loader2, Phone, Mail, MapPin, Send, Zap, Info, Hash, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { generateNotificationContent } from '@/ai/flows/generate-notification-content';

export default function OrderDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.id as string;
  const userId = searchParams.get('user');
  
  const { user: currentUser } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [notifying, setNotifying] = useState(false);
  const isAdmin = currentUser?.email?.toLowerCase() === 'voidwear26@gmail.com';

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
              <h1 className="text-4xl font-black tracking-tight glow-text uppercase leading-none">Transmission Detail</h1>
              <div className="flex flex-col gap-1">
                 <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">ORDER_UID: {orderId}</p>
                 <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">TRANSITION_UID: {order.transition_ID || order.paymentProviderId || 'INTERNAL'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
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
              {notifying && <Loader2 className="w-4 h-4 animate-spin text-white/40" />}
            </div>
          </div>
        </div>

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
                          <Package className="w-5 h-5 text-white/40" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[11px] font-bold tracking-widest uppercase">{item.name || 'ASSEMBLAGE MODULE'}</p>
                          <p className="text-[9px] text-white/60 tracking-widest uppercase">SIZE: {item.size || 'N/A'} // QTY: {item.quantity || 1}</p>
                        </div>
                      </div>
                      <p className="text-[11px] font-bold tracking-widest">₹{item.price || 0}</p>
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
                <span className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">TOTAL VALUE</span>
                <span className="text-2xl font-black tracking-tight glow-text">₹{order.totalAmount}</span>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/10 p-10 space-y-8 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">TRANS_ID VERIFICATION</h3>
                <ShieldAlert className="w-3.5 h-3.5 text-white/40" />
              </div>
              <div className="p-8 border border-white/5 bg-black/40 space-y-4">
                 <div className="flex flex-col gap-2">
                    <span className="text-[8px] font-bold tracking-widest uppercase text-white/30">RAZORPAY_TRANSITION_ID</span>
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
                    <p className="text-[12px] font-black tracking-widest uppercase text-white">{entity?.displayName || 'OPERATOR'}</p>
                    <p className="text-[9px] text-white/60 tracking-widest uppercase font-mono">{userId?.slice(0, 16)}...</p>
                  </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-3 text-[10px] text-white/80 tracking-widest uppercase font-bold">
                    <Mail className="w-3.5 h-3.5 text-white/40" />
                    {entity?.email || 'N/A'}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-white/80 tracking-widest uppercase font-bold">
                    <Phone className="w-3.5 h-3.5 text-white/40" />
                    {entity?.mobileNumber || 'NOT PROVIDED'}
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
                    {entity?.addressLine1 || 'NO ADDRESS LOGGED'}
                  </p>
                  <p className="text-[10px] text-white/60 tracking-widest uppercase font-bold">
                    {entity?.city || 'UNKNOWN'}, {entity?.stateProvince || 'N/A'} {entity?.postalCode || ''}
                  </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
