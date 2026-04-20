'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc, writeBatch, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Truck, Package, CreditCard, ArrowRight, ArrowLeft, Loader2, CheckCircle2, Zap, Wallet, ExternalLink, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

  useEffect(() => {
    if (user && profile) {
      setFormData(prev => ({
        ...prev,
        displayName: profile.displayName || user.displayName || '',
        email: profile.email || user.email || '',
        mobileNumber: profile.mobileNumber || '',
        addressLine1: profile.addressLine1 || '',
        city: profile.city || '',
        stateProvince: profile.stateProvince || '',
        postalCode: profile.postalCode || '',
        landmark: profile.landmark || '',
      }));
    }
  }, [user, profile]);

  useEffect(() => {
    if (!isUserLoading && !isCartLoading && step !== 'success') {
      if (!user || (cartItems && cartItems.length === 0)) {
        router.push('/');
      }
    }
  }, [user, isUserLoading, cartItems, isCartLoading, router, step]);

  const subtotal = cartItems?.reduce((acc, item) => acc + (Number(item.price) * Number(item.quantity)), 0) || 0;

  const finalizeOrderData = async (paymentId: string) => {
    if (!user || !db || !cartItems) return;
    
    const batch = writeBatch(db);
    const orderId = `VOID-${Date.now()}`;
    const orderRef = doc(db, 'users', user.uid, 'orders', orderId);
    
    const userRef = doc(db, 'users', user.uid);
    batch.set(userRef, {
      ...formData,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    const newOrder = {
      id: orderId,
      userId: user.uid,
      displayName: formData.displayName,
      email: formData.email,
      mobileNumber: formData.mobileNumber,
      city: formData.city,
      stateProvince: formData.stateProvince,
      postalCode: formData.postalCode,
      addressLine1: formData.addressLine1,
      items: cartItems,
      productIds: cartItems.map(item => item.productId),
      totalAmount: subtotal,
      orderDate: new Date().toISOString(),
      shippingStatus: 'processing',
      paymentStatus: 'paid',
      paymentProviderId: paymentId,
      paymentMethod: selectedMethod.toUpperCase(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    batch.set(orderRef, newOrder);

    const cartSnap = await getDocs(cartItemsRef!);
    cartSnap.docs.forEach(d => batch.delete(d.ref));

    await batch.commit();
    setOrderObject(newOrder);
    setFinalOrderId(orderId);
    setStep('success');
  };

  const handleNext = () => {
    if (step === 'shipping') {
      const required = ['displayName', 'stateProvince', 'addressLine1', 'city', 'postalCode', 'mobileNumber', 'email'];
      const missing = required.filter(key => !formData[key as keyof typeof formData]);
      if (missing.length > 0) {
        toast({ title: "DATA NODES MISSING", description: "PLEASE FILL ALL REQUIRED FIELDS.", variant: "destructive" });
        return;
      }
      setStep('review');
    } else if (step === 'review') {
      setStep('payment');
    }
  };

  const handleFinalize = async () => {
    if (!user || !db || !cartItems) return;
    setLoading(true);

    try {
      const res = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: subtotal }),
      });

      const orderData = await res.json();
      
      if (!res.ok) throw new Error(orderData.message || 'GATEWAY_HANDSHAKE_FAILED');

      if (orderData.isMock) {
        toast({ title: "DEVELOPER PROTOCOL", description: "BYPASSING LIVE GATEWAY. SIMULATING UPLINK." });
        setTimeout(async () => {
          await finalizeOrderData(`MOCK_${Date.now()}`);
          setLoading(false);
        }, 2000);
        return;
      }
      
      if (!(window as any).Razorpay) {
        throw new Error('PAYMENT_MODULE_NOT_DETECTED');
      }

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
              await finalizeOrderData(response.razorpay_payment_id);
            } else {
              toast({ variant: "destructive", title: "VERIFICATION_FAILURE", description: "TRANSACTION SECURITY MISMATCH." });
            }
          } catch (err) {
            console.error('[UPLINK_VERIFY_ERROR]', err);
            toast({ variant: "destructive", title: "UPLINK_FAILURE", description: "SYSTEM DISCONNECTION." });
          } finally {
            setLoading(false);
          }
        },
        prefill: { 
          name: formData.displayName,
          email: formData.email, 
          contact: formData.mobileNumber 
        },
        theme: { color: '#000000' },
        modal: { ondismiss: () => setLoading(false) }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e: any) {
      console.error('[TRANSACTION_CRASH]', e);
      toast({ variant: "destructive", title: "UPLINK_FAILURE", description: e.message || "COULD NOT INITIALIZE PAYMENT MODULE." });
      setLoading(false);
    }
  };

  const handleDownloadInvoice = () => {
    if (orderObject) {
      generateInvoicePDF(orderObject);
      toast({ title: "MANIFESTO RETRIEVED", description: "TRANSMISSION LOG DOWNLOADED SUCCESSFULLY." });
    }
  };

  if (isUserLoading || (step !== 'success' && isCartLoading) || isProfileLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black">
        <Loader2 className="w-10 h-10 animate-spin text-white/40 mb-6" />
        <p className="text-[10px] tracking-[1em] text-white/80 uppercase font-bold">Syncing Protocols...</p>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32 pb-24 px-6 bg-black">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl w-full bg-white/[0.02] border border-white/10 p-16 space-y-12 text-center backdrop-blur-3xl relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-[100px] animate-pulse" />
          <div className="relative z-10 space-y-12">
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-white animate-in zoom-in-50" />
              </div>
            </div>
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight glow-text uppercase leading-none text-white">TRANSMISSION SECURED</h1>
              <p className="text-[10px] tracking-[0.6em] text-white/80 uppercase font-bold">THANKS FOR YOUR ACQUISITION</p>
            </div>
            <div className="bg-black/40 border border-white/10 p-8 space-y-3">
              <p className="text-[9px] tracking-[0.4em] text-white/60 uppercase font-bold">TRANSMISSION_UID</p>
              <p className="text-xl font-mono tracking-widest text-white font-black">{finalOrderId}</p>
            </div>
            <div className="pt-8 flex flex-col gap-4">
              <Button onClick={handleDownloadInvoice} className="h-16 bg-white text-black hover:bg-white/90 rounded-none text-[10px] font-bold tracking-[0.4em] uppercase">
                DOWNLOAD INVOICE (PDF) <Download className="ml-3 w-4 h-4" />
              </Button>
              <Button asChild variant="outline" className="h-16 border-white/20 text-white hover:bg-white/5 rounded-none text-[10px] font-bold tracking-[0.4em] uppercase bg-transparent">
                <Link href="/profile">TRACK TRANSMISSION <ExternalLink className="ml-3 w-4 h-4" /></Link>
              </Button>
            </div>
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
            <div className="flex items-center gap-6 mb-12">
              <StepIndicator current={step} target="shipping" label="LOGISTICS" />
              <div className="h-[1px] w-8 bg-white/10" />
              <StepIndicator current={step} target="review" label="REVIEW" />
              <div className="h-[1px] w-8 bg-white/10" />
              <StepIndicator current={step} target="payment" label="UPLINK" />
            </div>

            <AnimatePresence mode="wait">
              {step === 'shipping' && (
                <motion.div key="shipping" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-10">
                  <div className="space-y-4">
                    <h2 className="text-3xl font-black tracking-tight glow-text uppercase">Logistics Protocol</h2>
                    <p className="text-[10px] tracking-[0.4em] text-white/60 uppercase font-bold">DESTINATION NODES</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    <Field label="NAME" value={formData.displayName} onChange={v => setFormData({...formData, displayName: v})} required />
                    <Field label="EMAIL" type="email" value={formData.email} onChange={v => setFormData({...formData, email: v})} required />
                    <Field label="CONTACT" type="tel" value={formData.mobileNumber} onChange={v => setFormData({...formData, mobileNumber: v})} required />
                    <Field label="STATE" value={formData.stateProvince} onChange={v => setFormData({...formData, stateProvince: v})} required />
                    <Field label="CITY" value={formData.city} onChange={v => setFormData({...formData, city: v})} required />
                    <Field label="PIN CODE" value={formData.postalCode} onChange={v => setFormData({...formData, postalCode: v})} required />
                    <div className="md:col-span-2">
                      <Field label="STREET ADDRESS" value={formData.addressLine1} onChange={v => setFormData({...formData, addressLine1: v})} required />
                    </div>
                  </div>
                  <Button onClick={handleNext} className="w-full h-16 bg-white text-black hover:bg-white/90 rounded-none text-[10px] font-bold tracking-[0.5em]">
                    PROCEED TO REVIEW <ArrowRight className="ml-3 w-4 h-4" />
                  </Button>
                </motion.div>
              )}

              {step === 'review' && (
                <motion.div key="review" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-12">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-black tracking-tight glow-text uppercase text-white">Transmission Audit</h2>
                    <Button variant="ghost" onClick={() => setStep('shipping')} className="text-[10px] tracking-widest text-white/60 hover:text-white uppercase font-bold">
                      <ArrowLeft className="mr-2 w-3 h-3" /> EDIT LOGISTICS
                    </Button>
                  </div>
                  <div className="bg-white/5 p-10 border border-white/10 space-y-6">
                    <div className="space-y-1">
                      <p className="text-[10px] text-white/40 tracking-widest uppercase">RECIPIENT_ENTITY</p>
                      <p className="text-sm font-bold tracking-widest uppercase">{formData.displayName}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-white/40 tracking-widest uppercase">DESTINATION_NODE</p>
                      <p className="text-[10px] text-white/80 tracking-widest leading-relaxed uppercase">
                        {formData.addressLine1}, {formData.city}, {formData.stateProvince} - {formData.postalCode}
                      </p>
                    </div>
                  </div>
                  <Button onClick={handleNext} className="w-full h-16 bg-white text-black hover:bg-white/90 rounded-none text-[10px] font-bold tracking-[0.5em]">
                    CONFIRM & PROCEED <ArrowRight className="ml-3 w-4 h-4" />
                  </Button>
                </motion.div>
              )}

              {step === 'payment' && (
                <motion.div key="payment" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-12">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-black tracking-tight glow-text uppercase text-white">Uplink Channel</h2>
                    <Button variant="ghost" onClick={() => setStep('review')} className="text-[10px] tracking-widest text-white/60 hover:text-white uppercase font-bold">
                      <ArrowLeft className="mr-2 w-3 h-3" /> BACK TO REVIEW
                    </Button>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-12 space-y-10">
                    <div className="grid gap-4">
                      <PaymentOption label="UPI TRANSMISSION" icon={<Zap className="w-4 h-4" />} selected={selectedMethod === 'upi'} onClick={() => setSelectedMethod('upi')} />
                      <PaymentOption label="CREDIT / DEBIT MODULE" icon={<CreditCard className="w-4 h-4" />} selected={selectedMethod === 'card'} onClick={() => setSelectedMethod('card')} />
                      <PaymentOption label="DIGITAL WALLET" icon={<Wallet className="w-4 h-4" />} selected={selectedMethod === 'wallet'} onClick={() => setSelectedMethod('wallet')} />
                    </div>
                    <Button onClick={handleFinalize} disabled={loading} className="w-full h-16 bg-white text-black hover:bg-white/90 rounded-none text-[10px] font-bold tracking-[0.5em] shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                        <>INITIALIZE SECURE UPLINK <ShieldCheck className="ml-3 w-4 h-4" /></>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-full md:w-96">
            <div className="bg-white/[0.02] border border-white/10 p-10 space-y-8 backdrop-blur-xl sticky top-40">
              <h3 className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase border-b border-white/10 pb-4">MISSION ASSEMBLAGE</h3>
              <div className="space-y-6 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
                {cartItems?.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-12 h-16 bg-white/5 border border-white/10 shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover grayscale" unoptimized />
                    </div>
                    <div className="flex-1 space-y-1 overflow-hidden">
                      <p className="text-[10px] font-bold tracking-widest uppercase truncate">{item.name}</p>
                      <p className="text-[8px] text-white/60 tracking-widest uppercase">SIZE: {item.size} // QTY: {item.quantity}</p>
                      <p className="text-[9px] font-bold text-white">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-8 border-t border-white/10 space-y-4">
                <div className="flex justify-between items-center pt-4">
                  <span className="text-[10px] font-black tracking-widest uppercase text-white/60">TOTAL VALUE</span>
                  <span className="text-2xl font-black tracking-tight glow-text text-white">₹{subtotal}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepIndicator({ current, target, label }: { current: string, target: string, label: string }) {
  const isActive = current === target;
  return (
    <div className={`flex items-center gap-3 transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-30'}`}>
      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-white shadow-[0_0_10px_white]' : 'bg-white/40'}`} />
      <span className="text-[9px] font-bold tracking-[0.4em] uppercase text-white">{label}</span>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required }: { label: string, value: string, onChange: (v: string) => void, type?: string, required?: boolean }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold tracking-widest text-white/40 uppercase">
        {label} {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Input type={type} value={value} onChange={e => onChange(e.target.value)} className="bg-white/5 border-white/10 rounded-none h-12 text-[10px] tracking-widest focus:border-white/60 text-white uppercase placeholder:text-white/5" placeholder={label} />
    </div>
  );
}

function PaymentOption({ label, icon, selected, onClick }: { label: string, icon: React.ReactNode, selected?: boolean, onClick: () => void }) {
  return (
    <div onClick={onClick} className={`flex items-center justify-between p-6 border transition-all cursor-pointer ${selected ? 'border-white bg-white/5' : 'border-white/10 hover:border-white/40 bg-black/40'}`}>
      <div className="flex items-center gap-4">
        <div className={selected ? 'text-white' : 'text-white/60'}>{icon}</div>
        <span className={`text-[10px] font-bold tracking-widest uppercase ${selected ? 'text-white' : 'text-white/80'}`}>{label}</span>
      </div>
      {selected && <CheckCircle2 className="w-4 h-4 text-white" />}
    </div>
  );
}