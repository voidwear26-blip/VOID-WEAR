'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc, writeBatch, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Truck, CreditCard, ArrowRight, Loader2, CheckCircle2, Zap, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { generateInvoicePDF } from '@/lib/invoice-generator';

type CheckoutStep = 'shipping' | 'review' | 'payment' | 'success';
type PaymentMethod = 'card' | 'upi' | 'wallet';

export default function CheckoutPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('upi');
  const [finalOrderId, setFinalOrderId] = useState<string | null>(null);
  const [orderObject, setOrderObject] = useState<any>(null);

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  const cartItemsRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'carts', 'active_cart', 'items');
  }, [db, user]);

  const { data: cartItems, isLoading: isCartLoading } = useCollection(cartItemsRef);

  const [formData, setFormData] = useState({
    displayName: '',
    stateProvince: '',
    addressLine1: '',
    landmark: '',
    city: '',
    postalCode: '',
    mobileNumber: '',
    email: '',
    additionalInfo: ''
  });

  // Automated synchronization from saved operator profile
  useEffect(() => {
    if (user && profile) {
      setFormData({
        displayName: profile.displayName || user.displayName || '',
        email: profile.email || user.email || '',
        mobileNumber: profile.mobileNumber || '',
        addressLine1: profile.addressLine1 || '',
        city: profile.city || '',
        stateProvince: profile.stateProvince || '',
        postalCode: profile.postalCode || '',
        landmark: profile.landmark || '',
        additionalInfo: ''
      });
    }
  }, [user, profile]);

  const subtotal = cartItems?.reduce((acc, item) => acc + (Number(item.price) * Number(item.quantity)), 0) || 0;

  const finalizeOrderInFirestore = async (paymentId: string) => {
    if (!user || !db || !cartItems) return;
    
    const batch = writeBatch(db);
    const orderId = `VOID-${Date.now()}`;
    const orderRef = doc(db, 'users', user.uid, 'orders', orderId);
    
    // Auto-update logistical profile data if it changed during checkout
    const userRef = doc(db, 'users', user.uid);
    batch.set(userRef, { ...formData, updatedAt: new Date().toISOString() }, { merge: true });

    const newOrder = {
      id: orderId,
      userId: user.uid,
      displayName: formData.displayName,
      email: formData.email,
      mobileNumber: formData.mobileNumber,
      items: cartItems,
      totalAmount: subtotal,
      orderDate: new Date().toISOString(),
      shippingStatus: 'processing',
      paymentStatus: 'paid',
      paymentProviderId: paymentId,
      paymentMethod: selectedMethod.toUpperCase(),
      addressLine1: formData.addressLine1,
      city: formData.city,
      stateProvince: formData.stateProvince,
      postalCode: formData.postalCode,
      landmark: formData.landmark,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    batch.set(orderRef, newOrder);

    // Synchronously purge cart logs
    const cartSnap = await getDocs(cartItemsRef!);
    cartSnap.docs.forEach(d => batch.delete(d.ref));

    await batch.commit();
    setOrderObject(newOrder);
    setFinalOrderId(orderId);
    setStep('success');
  };

  const handlePaymentUplink = async () => {
    if (!user || !db || !cartItems) return;
    setLoading(true);

    try {
      const res = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: subtotal,
          notes: { operator_name: formData.displayName, user_uid: user.uid }
        }),
      });

      const orderData = await res.json();
      if (!res.ok) throw new Error(orderData.message || 'UPLINK_FAILURE');

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'VOID WEAR',
        description: 'TECHNICAL ASSEMBLAGE UPLINK',
        order_id: orderData.id,
        handler: async function (response: any) {
          setLoading(true);
          try {
            const verifyRes = await fetch('/api/checkout/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response),
            });

            if (verifyRes.ok) {
              await finalizeOrderInFirestore(response.razorpay_payment_id);
              toast({ title: "TRANSMISSION SECURED", description: "UPLINK VERIFIED SUCCESSFULLY." });
            } else {
              toast({ variant: "destructive", title: "VERIFICATION_FAILURE" });
            }
          } catch (err) {
            toast({ variant: "destructive", title: "CONNECTION_TIMEOUT" });
          } finally {
            setLoading(false);
          }
        },
        prefill: { 
          name: formData.displayName, 
          email: formData.email, 
          contact: formData.mobileNumber 
        },
        theme: { color: '#000000' }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e: any) {
      toast({ variant: "destructive", title: "GATEWAY_ERROR", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  if (isUserLoading || (step !== 'success' && isCartLoading) || isProfileLoading) {
    return <div className="h-screen flex items-center justify-center text-[10px] tracking-[1em] uppercase text-white font-bold">Syncing Protocols...</div>;
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32 pb-24 px-6 bg-black">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl w-full bg-white/[0.02] border border-white/10 p-16 space-y-12 text-center backdrop-blur-3xl">
          <CheckCircle2 className="w-16 h-16 text-white mx-auto" />
          <h1 className="text-4xl font-black tracking-tight glow-text uppercase">TRANSMISSION SECURED</h1>
          <div className="bg-black/40 border border-white/10 p-8 space-y-3">
             <p className="text-[9px] tracking-[0.4em] text-white/40 uppercase">TRANSMISSION_UID</p>
             <p className="text-xl font-mono text-white font-black">{finalOrderId}</p>
          </div>
          <div className="flex flex-col gap-4">
             <Button onClick={() => orderObject && generateInvoicePDF(orderObject)} className="h-16 bg-white text-black hover:bg-white/90 rounded-none text-[10px] font-bold tracking-[0.4em] uppercase">
                DOWNLOAD INVOICE (PDF) <Download className="ml-3 w-4 h-4" />
             </Button>
             <Link href="/profile" className="text-[10px] tracking-[0.5em] text-white/40 hover:text-white transition-all uppercase">RETURN TO DOSSIER</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen text-white">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-16">
          <div className="flex-1 space-y-12">
            <div className="flex items-center gap-6 mb-12 opacity-50">
              <span className={`text-[10px] tracking-widest ${step === 'shipping' ? 'text-white font-bold opacity-100' : ''}`}>LOGISTICS</span>
              <span className={`text-[10px] tracking-widest ${step === 'review' ? 'text-white font-bold opacity-100' : ''}`}>AUDIT</span>
              <span className={`text-[10px] tracking-widest ${step === 'payment' ? 'text-white font-bold opacity-100' : ''}`}>UPLINK</span>
            </div>

            <AnimatePresence mode="wait">
              {step === 'shipping' && (
                <motion.div key="ship" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                  <h2 className="text-3xl font-black tracking-tighter uppercase glow-text">Logistics Node</h2>
                  <div className="grid md:grid-cols-2 gap-8">
                     <Field label="IDENTIFIER (NAME)" value={formData.displayName} onChange={v => setFormData({...formData, displayName: v})} />
                     <Field label="COMM-CHANNEL (EMAIL)" value={formData.email} onChange={v => setFormData({...formData, email: v})} />
                     <Field label="UPLINK (MOBILE)" value={formData.mobileNumber} onChange={v => setFormData({...formData, mobileNumber: v})} />
                     <Field label="CITY" value={formData.city} onChange={v => setFormData({...formData, city: v})} />
                     <Field label="STATE" value={formData.stateProvince} onChange={v => setFormData({...formData, stateProvince: v})} />
                     <Field label="PIN CODE" value={formData.postalCode} onChange={v => setFormData({...formData, postalCode: v})} />
                     <div className="md:col-span-2">
                        <Field label="ADDRESS NODE" value={formData.addressLine1} onChange={v => setFormData({...formData, addressLine1: v})} />
                     </div>
                  </div>
                  <Button onClick={() => setStep('review')} className="w-full h-16 bg-white text-black hover:bg-white/90 rounded-none text-[10px] font-bold tracking-[0.5em]">
                    PROCEED TO AUDIT <ArrowRight className="ml-3 w-4 h-4" />
                  </Button>
                </motion.div>
              )}

              {step === 'review' && (
                <motion.div key="rev" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
                   <h2 className="text-3xl font-black tracking-tighter uppercase glow-text">Transmission Audit</h2>
                   <div className="bg-white/5 border border-white/10 p-10 space-y-6">
                      <p className="text-[10px] tracking-widest text-white/40 uppercase">RECIPIENT: <span className="text-white font-bold">{formData.displayName}</span></p>
                      <p className="text-[10px] tracking-widest text-white/40 uppercase leading-relaxed">
                         DESTINATION: <span className="text-white font-bold">{formData.addressLine1}, {formData.city}, {formData.stateProvince} - {formData.postalCode}</span>
                      </p>
                   </div>
                   <Button onClick={() => setStep('payment')} className="w-full h-16 bg-white text-black hover:bg-white/90 rounded-none text-[10px] font-bold tracking-[0.5em]">
                    FINALIZE UPLINK <ArrowRight className="ml-3 w-4 h-4" />
                  </Button>
                </motion.div>
              )}

              {step === 'payment' && (
                <motion.div key="pay" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
                   <h2 className="text-3xl font-black tracking-tighter uppercase glow-text">Uplink Channel</h2>
                   <div className="grid gap-4">
                      <PaymentOption label="UPI TRANSMISSION" selected={selectedMethod === 'upi'} onClick={() => setSelectedMethod('upi')} />
                      <PaymentOption label="CREDIT / DEBIT MODULE" selected={selectedMethod === 'card'} onClick={() => setSelectedMethod('card')} />
                   </div>
                   <Button onClick={handlePaymentUplink} disabled={loading} className="w-full h-16 bg-white text-black hover:bg-white/90 rounded-none text-[10px] font-bold tracking-[0.5em] shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                      {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <>INITIALIZE SECURE UPLINK <Zap className="ml-3 w-4 h-4" /></>}
                   </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-full md:w-96">
            <div className="bg-white/[0.02] border border-white/10 p-10 space-y-8 backdrop-blur-xl">
               <h3 className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase border-b border-white/10 pb-4">BAG CONTENTS</h3>
               <div className="space-y-6">
                  {cartItems?.map(item => (
                    <div key={item.id} className="flex gap-4">
                       <div className="relative w-12 aspect-[3/4] bg-white/5">
                          <Image src={item.image} alt={item.name} fill className="object-cover grayscale" unoptimized />
                       </div>
                       <div className="flex-1 space-y-1">
                          <p className="text-[10px] font-bold tracking-widest uppercase truncate">{item.name}</p>
                          <p className="text-[8px] text-white/40 uppercase">SZ: {item.size} // QTY: {item.quantity}</p>
                          <p className="text-[9px] text-white font-bold">₹{item.price * item.quantity}</p>
                       </div>
                    </div>
                  ))}
               </div>
               <div className="pt-8 border-t border-white/10 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-white/60">TOTAL</span>
                  <span className="text-2xl font-black glow-text text-white">₹{subtotal}</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-bold tracking-widest text-white/40 uppercase">{label}</label>
      <Input value={value} onChange={e => onChange(e.target.value)} className="bg-white/5 border-white/10 rounded-none h-12 text-[10px] tracking-widest focus:border-white/60 text-white uppercase" />
    </div>
  );
}

function PaymentOption({ label, selected, onClick }: { label: string, selected?: boolean, onClick: () => void }) {
  return (
    <div onClick={onClick} className={`p-6 border cursor-pointer transition-all ${selected ? 'border-white bg-white/5' : 'border-white/10 hover:border-white/40 bg-black/40'}`}>
       <span className={`text-[10px] font-bold tracking-widest uppercase ${selected ? 'text-white' : 'text-white/40'}`}>{label}</span>
    </div>
  );
}