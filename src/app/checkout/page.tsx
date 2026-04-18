
'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc, writeBatch, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Truck, Package, CreditCard, ArrowRight, ArrowLeft, Loader2, MapPin, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

type CheckoutStep = 'shipping' | 'review' | 'payment';

export default function CheckoutPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [loading, setLoading] = useState(false);

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
    if (user) {
      setFormData(prev => ({
        ...prev,
        displayName: user.displayName || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const subtotal = cartItems?.reduce((acc, item) => acc + (Number(item.price) * Number(item.quantity)), 0) || 0;

  const handleNext = () => {
    if (step === 'shipping') {
      const required = ['displayName', 'stateProvince', 'addressLine1', 'city', 'postalCode', 'mobileNumber', 'email'];
      const missing = required.filter(key => !formData[key as keyof typeof formData]);
      if (missing.length > 0) {
        toast({ title: "LOGISTICS ERROR", description: "PLEASE FILL ALL REQUIRED FIELDS.", variant: "destructive" });
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
      // 1. Initialize Razorpay
      const res = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: subtotal }),
      });

      const orderData = await res.json();
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_51O...placeholder',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'VOID WEAR',
        description: 'SECURE TRANSMISSION',
        order_id: orderData.id,
        handler: async function (response: any) {
          // Verify & Create Order
          const verifyRes = await fetch('/api/checkout/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });

          if (verifyRes.ok) {
            const batch = writeBatch(db);
            const orderId = `VOID-${Date.now()}`;
            const orderRef = doc(db, 'users', user.uid, 'orders', orderId);
            
            // Update User Profile with address
            const userRef = doc(db, 'users', user.uid);
            batch.update(userRef, {
              ...formData,
              updatedAt: new Date().toISOString()
            });

            // Set Order
            batch.set(orderRef, {
              id: orderId,
              userId: user.uid,
              ...formData,
              items: cartItems,
              totalAmount: subtotal,
              orderDate: new Date().toISOString(),
              shippingStatus: 'processing',
              paymentStatus: 'paid',
              paymentProviderId: response.razorpay_payment_id,
              createdAt: new Date().toISOString()
            });

            // Clear Cart
            const cartSnap = await getDocs(cartItemsRef!);
            cartSnap.docs.forEach(d => batch.delete(d.ref));

            await batch.commit();
            toast({ title: "TRANSMISSION SECURED", description: "ORDER INITIALIZED SUCCESSFULLY." });
            router.push('/profile');
          }
        },
        prefill: { email: formData.email, contact: formData.mobileNumber },
        theme: { color: '#000000' }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e) {
      console.error(e);
      toast({ title: "UPLINK FAILURE", description: "COULD NOT ESTABLISH PAYMENT GATEWAY.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (isUserLoading || isCartLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black">
        <Loader2 className="w-10 h-10 animate-spin text-white/20 mb-6" />
        <p className="text-[10px] tracking-[1em] text-white/40 uppercase">Syncing Protocols...</p>
      </div>
    );
  }

  if (!user || cartItems?.length === 0) {
    router.push('/');
    return null;
  }

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen text-white">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-16">
          <div className="flex-1 space-y-12">
            {/* Stepper */}
            <div className="flex items-center gap-6 mb-12">
              <StepIndicator current={step} target="shipping" label="LOGISTICS" />
              <div className="h-[1px] w-8 bg-white/10" />
              <StepIndicator current={step} target="review" label="REVIEW" />
              <div className="h-[1px] w-8 bg-white/10" />
              <StepIndicator current={step} target="payment" label="PAYMENT" />
            </div>

            <AnimatePresence mode="wait">
              {step === 'shipping' && (
                <motion.div 
                  key="shipping" 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-10"
                >
                  <h2 className="text-3xl font-black tracking-tight glow-text uppercase">Logistics Protocol</h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    <Field label="FULL NAME" value={formData.displayName} onChange={v => setFormData({...formData, displayName: v})} required />
                    <Field label="EMAIL" type="email" value={formData.email} onChange={v => setFormData({...formData, email: v})} required />
                    <Field label="CONTACT NUMBER" type="tel" value={formData.mobileNumber} onChange={v => setFormData({...formData, mobileNumber: v})} required />
                    <Field label="STATE" value={formData.stateProvince} onChange={v => setFormData({...formData, stateProvince: v})} required />
                    <Field label="CITY / TOWN" value={formData.city} onChange={v => setFormData({...formData, city: v})} required />
                    <Field label="PINCODE" value={formData.postalCode} onChange={v => setFormData({...formData, postalCode: v})} required />
                    <div className="md:col-span-2">
                      <Field label="STREET ADDRESS" value={formData.addressLine1} onChange={v => setFormData({...formData, addressLine1: v})} required />
                    </div>
                    <Field label="LANDMARK (OPTIONAL)" value={formData.landmark} onChange={v => setFormData({...formData, landmark: v})} />
                    <div className="md:col-span-2">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold tracking-widest text-white/40 uppercase">ADDITIONAL INFORMATION</label>
                        <Textarea 
                          value={formData.additionalInfo} 
                          onChange={e => setFormData({...formData, additionalInfo: e.target.value})}
                          className="bg-white/5 border-white/10 rounded-none h-24 text-xs tracking-widest focus:border-white/40"
                          placeholder="E.G. DELIVERY INSTRUCTIONS..."
                        />
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={handleNext} 
                    className="w-full h-16 bg-white text-black hover:bg-white/90 rounded-none text-[10px] font-bold tracking-[0.5em] shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                  >
                    PROCEED TO REVIEW
                    <ArrowRight className="ml-3 w-4 h-4" />
                  </Button>
                </motion.div>
              )}

              {step === 'review' && (
                <motion.div 
                  key="review" 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-12"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-black tracking-tight glow-text uppercase">Transmission Audit</h2>
                    <Button variant="ghost" onClick={() => setStep('shipping')} className="text-[10px] tracking-widest text-white/40 hover:text-white uppercase font-bold">
                      <ArrowLeft className="mr-2 w-3 h-3" /> EDIT LOGISTICS
                    </Button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-12 border-t border-white/5 pt-12">
                    <div className="space-y-6">
                      <h4 className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">ENTITY DESTINATION</h4>
                      <div className="bg-white/5 p-8 border border-white/10 space-y-2">
                        <p className="text-xs font-bold tracking-widest uppercase">{formData.displayName}</p>
                        <p className="text-[10px] text-white/60 tracking-widest leading-relaxed uppercase">
                          {formData.addressLine1}, {formData.landmark && `${formData.landmark}, `}{formData.city}<br />
                          {formData.stateProvince} - {formData.postalCode}
                        </p>
                        <p className="text-[10px] text-white/40 tracking-widest uppercase pt-4">CONTACT: {formData.mobileNumber}</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h4 className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">ADDITIONAL DATA</h4>
                      <div className="bg-white/5 p-8 border border-white/10">
                        <p className="text-[10px] text-white/40 tracking-widest leading-relaxed uppercase">
                          {formData.additionalInfo || 'NO ADDITIONAL LOGS.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleNext} 
                    className="w-full h-16 bg-white text-black hover:bg-white/90 rounded-none text-[10px] font-bold tracking-[0.5em] shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                  >
                    CONFIRM & PROCEED TO PAYMENT
                    <ArrowRight className="ml-3 w-4 h-4" />
                  </Button>
                </motion.div>
              )}

              {step === 'payment' && (
                <motion.div 
                  key="payment" 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-12"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-black tracking-tight glow-text uppercase">Uplink Channel</h2>
                    <Button variant="ghost" onClick={() => setStep('review')} className="text-[10px] tracking-widest text-white/40 hover:text-white uppercase font-bold">
                      <ArrowLeft className="mr-2 w-3 h-3" /> BACK TO AUDIT
                    </Button>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-12 space-y-10">
                    <div className="space-y-6">
                      <h4 className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">SELECT GATEWAY</h4>
                      <div className="grid gap-4">
                        <PaymentOption label="CREDIT / DEBIT CARD" icon={<CreditCard className="w-4 h-4" />} selected />
                        <PaymentOption label="UPI / NET BANKING" icon={<ShieldCheck className="w-4 h-4" />} />
                      </div>
                    </div>

                    <div className="p-8 border border-white/5 bg-black/40 space-y-4">
                      <div className="flex items-center gap-3 text-white/40">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[9px] tracking-[0.3em] uppercase">ENCRYPTED TRANSACTION CHANNEL</span>
                      </div>
                      <p className="text-[9px] text-white/20 tracking-widest leading-relaxed uppercase">
                        YOUR DATA IS PROTECTED BY 256-BIT QUANTUM SECURITY. NO CARD INFORMATION IS STORED ON VOID WEAR SERVERS.
                      </p>
                    </div>

                    <Button 
                      onClick={handleFinalize}
                      disabled={loading}
                      className="w-full h-16 bg-white text-black hover:bg-white/90 rounded-none text-[10px] font-bold tracking-[0.5em] shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>
                          INITIALIZE SECURE UPLINK
                          <ShieldCheck className="ml-3 w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Summary Sidebar */}
          <div className="w-full md:w-96 space-y-8">
            <div className="bg-white/5 border border-white/10 p-10 space-y-8 backdrop-blur-xl">
              <h3 className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">ASSEMBLAGE SUMMARY</h3>
              <div className="space-y-6 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
                {cartItems?.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-12 h-16 bg-white/5 border border-white/10 flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover grayscale" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-[10px] font-bold tracking-widest uppercase truncate">{item.name}</p>
                      <p className="text-[8px] text-white/40 tracking-widest uppercase">SIZE: {item.size} // QTY: {item.quantity}</p>
                      <p className="text-[9px] font-bold">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-8 border-t border-white/5 space-y-4">
                <div className="flex justify-between items-center text-[10px] tracking-widest">
                  <span className="text-white/40 uppercase">SUBTOTAL</span>
                  <span className="font-bold">₹{subtotal}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] tracking-widest">
                  <span className="text-white/40 uppercase">EXPEDITION COST</span>
                  <span className="text-green-500 font-bold">FREE</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                  <span className="text-[10px] font-black tracking-widest uppercase">MISSION TOTAL</span>
                  <span className="text-2xl font-black tracking-tight glow-text">₹{subtotal}</span>
                </div>
              </div>
            </div>
            
            <div className="p-8 border border-white/5 bg-white/[0.02] flex items-center gap-4">
              <Package className="w-5 h-5 text-white/20" />
              <div className="space-y-1">
                <p className="text-[9px] font-bold tracking-widest uppercase">SHIPPING PROTOCOL</p>
                <p className="text-[8px] text-white/20 tracking-widest uppercase">2-7 CYCLE EXPEDITION</p>
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
  const isCompleted = (current === 'review' && target === 'shipping') || (current === 'payment' && (target === 'shipping' || target === 'review'));
  
  return (
    <div className={`flex items-center gap-3 transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-30'}`}>
      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-white glow-text shadow-[0_0_10px_white]' : isCompleted ? 'bg-white/40' : 'border border-white/20'}`} />
      <span className="text-[9px] font-bold tracking-[0.4em] uppercase">{label}</span>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required }: { label: string, value: string, onChange: (v: string) => void, type?: string, required?: boolean }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold tracking-widest text-white/40 uppercase">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Input 
        type={type} 
        value={value} 
        onChange={e => onChange(e.target.value)}
        className="bg-white/5 border-white/10 rounded-none h-12 text-xs tracking-widest focus:border-white/40 text-white uppercase"
        placeholder={label}
      />
    </div>
  );
}

function PaymentOption({ label, icon, selected }: { label: string, icon: React.ReactNode, selected?: boolean }) {
  return (
    <div className={`flex items-center justify-between p-6 border transition-all cursor-pointer ${selected ? 'border-white bg-white/5' : 'border-white/10 hover:border-white/30 bg-black/40'}`}>
      <div className="flex items-center gap-4">
        <div className={selected ? 'text-white' : 'text-white/20'}>{icon}</div>
        <span className={`text-[10px] font-bold tracking-widest uppercase ${selected ? 'text-white' : 'text-white/40'}`}>{label}</span>
      </div>
      {selected && <CheckCircle2 className="w-4 h-4 text-white" />}
    </div>
  );
}
