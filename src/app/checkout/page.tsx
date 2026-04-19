
'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc, setDoc, writeBatch, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Truck, Package, CreditCard, ArrowRight, ArrowLeft, Loader2, MapPin, CheckCircle2, Zap, Wallet, Sparkles, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

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

  // Fetch Entity Profile for pre-population
  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  // Fetch Cart Items
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

  // Neural Sync: Populate form with existing entity coordinates
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        displayName: profile?.displayName || user.displayName || '',
        email: profile?.email || user.email || '',
        mobileNumber: profile?.mobileNumber || '',
        addressLine1: profile?.addressLine1 || '',
        city: profile?.city || '',
        stateProvince: profile?.stateProvince || '',
        postalCode: profile?.postalCode || '',
        landmark: profile?.landmark || '',
      }));
    }
  }, [user, profile]);

  const subtotal = cartItems?.reduce((acc, item) => acc + (Number(item.price) * Number(item.quantity)), 0) || 0;

  const handleNext = () => {
    if (step === 'shipping') {
      const required = ['displayName', 'stateProvince', 'addressLine1', 'city', 'postalCode', 'mobileNumber', 'email'];
      const missing = required.filter(key => !formData[key as keyof typeof formData]);
      if (missing.length > 0) {
        toast({ 
          title: "LOGISTICS ERROR", 
          description: "PLEASE FILL ALL REQUIRED FIELDS TO PROCEED.", 
          variant: "destructive" 
        });
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
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'VOID WEAR',
        description: 'SECURE TRANSMISSION',
        order_id: orderData.id,
        handler: async function (response: any) {
          const verifyRes = await fetch('/api/checkout/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });

          if (verifyRes.ok) {
            const batch = writeBatch(db);
            const orderId = `VOID-${Date.now()}`;
            const orderRef = doc(db, 'users', user.uid, 'orders', orderId);
            
            const userRef = doc(db, 'users', user.uid);
            // Update entity dossier with latest coordinates
            batch.set(userRef, {
              ...formData,
              updatedAt: new Date().toISOString()
            }, { merge: true });

            batch.set(orderRef, {
              id: orderId,
              userId: user.uid,
              ...formData,
              items: cartItems,
              productIds: cartItems.map(item => item.productId), // Index for admin product-sales tracking
              totalAmount: subtotal,
              orderDate: new Date().toISOString(),
              shippingStatus: 'processing',
              paymentStatus: 'paid',
              paymentProviderId: response.razorpay_payment_id,
              paymentMethod: selectedMethod.toUpperCase(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });

            const cartSnap = await getDocs(cartItemsRef!);
            cartSnap.docs.forEach(d => batch.delete(d.ref));

            await batch.commit();
            setFinalOrderId(orderId);
            setStep('success');
            setLoading(false);
          }
        },
        prefill: { 
          email: formData.email, 
          contact: formData.mobileNumber,
          method: selectedMethod
        },
        theme: { color: '#000000' },
        modal: {
          ondismiss: () => setLoading(false)
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e) {
      console.error(e);
      toast({ title: "UPLINK FAILURE", description: "COULD NOT ESTABLISH PAYMENT GATEWAY.", variant: "destructive" });
      setLoading(false);
    }
  };

  if (isUserLoading || isCartLoading || isProfileLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black">
        <Loader2 className="w-10 h-10 animate-spin text-white/60 mb-6" />
        <p className="text-[10px] tracking-[1em] text-white/80 uppercase font-bold">Syncing Protocols...</p>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32 pb-24 px-6 bg-black">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full bg-white/[0.02] border border-white/10 p-16 space-y-12 text-center backdrop-blur-3xl relative overflow-hidden"
        >
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-[100px] animate-pulse" />
          
          <div className="relative z-10 space-y-12">
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                <CheckCircle2 className="w-10 h-10 text-white animate-in zoom-in-50" />
              </div>
            </div>

            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight glow-text uppercase leading-none">TRANSMISSION SECURED</h1>
              <p className="text-[10px] tracking-[0.6em] text-white/80 uppercase font-bold">THANKS FOR YOUR PURCHASE</p>
            </div>

            <div className="bg-black/40 border border-white/10 p-8 space-y-3">
              <p className="text-[9px] tracking-[0.4em] text-white/60 uppercase font-bold">TRANSMISSION IDENTIFIER</p>
              <p className="text-xl font-mono tracking-widest text-white font-black">{finalOrderId}</p>
            </div>

            <p className="text-sm text-white/80 tracking-widest leading-relaxed uppercase max-w-md mx-auto">
              YOUR ASSEMBLAGE HAS BEEN LOGGED IN THE VOID. WE ARE INITIALIZING THE EXPEDITION PROTOCOLS.
            </p>

            <div className="pt-8 flex flex-col gap-4">
              <Button asChild className="h-16 bg-white text-black hover:bg-white/90 rounded-none text-[10px] font-bold tracking-[0.4em] uppercase shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                <Link href="/profile">
                  TRACK TRANSMISSION
                  <ExternalLink className="ml-3 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="ghost" className="h-14 text-[10px] tracking-[0.4em] text-white/80 hover:text-white uppercase font-bold">
                <Link href="/products">CONTINUE EXPLORATION</Link>
              </Button>
            </div>
          </div>
        </motion.div>
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
                  <div className="space-y-4">
                    <h2 className="text-3xl font-black tracking-tight glow-text uppercase">Logistics Protocol</h2>
                    <p className="text-[10px] tracking-[0.4em] text-white/80 uppercase font-bold">IDENTIFICATION & DESTINATION NODES</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <Field label="NAME" value={formData.displayName} onChange={v => setFormData({...formData, displayName: v})} required />
                    <Field label="EMAIL" type="email" value={formData.email} onChange={v => setFormData({...formData, email: v})} required />
                    <Field label="CONTACT NUMBER" type="tel" value={formData.mobileNumber} onChange={v => setFormData({...formData, mobileNumber: v})} required />
                    <Field label="STATE" value={formData.stateProvince} onChange={v => setFormData({...formData, stateProvince: v})} required />
                    <Field label="CITY / TOWN" value={formData.city} onChange={v => setFormData({...formData, city: v})} required />
                    <Field label="PIN CODE" value={formData.postalCode} onChange={v => setFormData({...formData, postalCode: v})} required />
                    <div className="md:col-span-2">
                      <Field label="STREET ADDRESS" value={formData.addressLine1} onChange={v => setFormData({...formData, addressLine1: v})} required />
                    </div>
                    <Field label="LAND MARK (OPTIONAL)" value={formData.landmark} onChange={v => setFormData({...formData, landmark: v})} />
                    <div className="md:col-span-2">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold tracking-widest text-white/80 uppercase">ADDITIONAL INFORMATION</label>
                        <Textarea 
                          value={formData.additionalInfo} 
                          onChange={e => setFormData({...formData, additionalInfo: e.target.value})}
                          className="bg-white/5 border-white/10 rounded-none h-24 text-xs tracking-widest focus:border-white/60 text-white"
                          placeholder="E.G. SPECIAL DELIVERY INSTRUCTIONS..."
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
                    <Button variant="ghost" onClick={() => setStep('shipping')} className="text-[10px] tracking-widest text-white/80 hover:text-white uppercase font-bold">
                      <ArrowLeft className="mr-2 w-3 h-3" /> EDIT LOGISTICS
                    </Button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-12 border-t border-white/10 pt-12">
                    <div className="space-y-6">
                      <h4 className="text-[10px] font-bold tracking-[0.4em] text-white/80 uppercase">ENTITY COORDINATES</h4>
                      <div className="bg-white/5 p-8 border border-white/10 space-y-4">
                        <div className="space-y-1">
                          <p className="text-[10px] text-white/60 tracking-widest uppercase">NAME</p>
                          <p className="text-xs font-bold tracking-widest uppercase">{formData.displayName}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-white/60 tracking-widest uppercase">DESTINATION</p>
                          <p className="text-[10px] text-white/80 tracking-widest leading-relaxed uppercase">
                            {formData.addressLine1}, {formData.landmark && `${formData.landmark}, `}{formData.city}<br />
                            {formData.stateProvince} - {formData.postalCode}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-[10px] text-white/60 tracking-widest uppercase">CONTACT</p>
                            <p className="text-[10px] text-white/80 tracking-widest uppercase">{formData.mobileNumber}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] text-white/60 tracking-widest uppercase">EMAIL</p>
                            <p className="text-[10px] text-white/80 tracking-widest uppercase truncate">{formData.email}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h4 className="text-[10px] font-bold tracking-[0.4em] text-white/80 uppercase">NARRATIVE LOGS</h4>
                      <div className="bg-white/5 p-8 border border-white/10 min-h-[160px]">
                        <p className="text-[10px] text-white/80 tracking-widest leading-relaxed uppercase">
                          {formData.additionalInfo || 'NO ADDITIONAL DATA LOGGED.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleNext} 
                    className="w-full h-16 bg-white text-black hover:bg-white/90 rounded-none text-[10px] font-bold tracking-[0.5em] shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                  >
                    CONFIRM & PROCEED TO UPLINK
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
                    <Button variant="ghost" onClick={() => setStep('review')} className="text-[10px] tracking-widest text-white/80 hover:text-white uppercase font-bold">
                      <ArrowLeft className="mr-2 w-3 h-3" /> BACK TO REVIEW
                    </Button>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-12 space-y-10">
                    <div className="space-y-6">
                      <h4 className="text-[10px] font-bold tracking-[0.4em] text-white/80 uppercase">SELECT PAYMENT MODULE</h4>
                      <div className="grid gap-4">
                        <PaymentOption 
                          label="UPI TRANSMISSION (FASTEST)" 
                          icon={<Zap className="w-4 h-4" />} 
                          selected={selectedMethod === 'upi'} 
                          onClick={() => setSelectedMethod('upi')}
                        />
                        <PaymentOption 
                          label="CREDIT / DEBIT CARD" 
                          icon={<CreditCard className="w-4 h-4" />} 
                          selected={selectedMethod === 'card'} 
                          onClick={() => setSelectedMethod('card')}
                        />
                        <PaymentOption 
                          label="DIGITAL WALLETS" 
                          icon={<Wallet className="w-4 h-4" />} 
                          selected={selectedMethod === 'wallet'} 
                          onClick={() => setSelectedMethod('wallet')}
                        />
                      </div>
                    </div>

                    <div className="p-8 border border-white/10 bg-black/40 space-y-4">
                      <div className="flex items-center gap-3 text-white/80">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[9px] tracking-[0.3em] uppercase">ENCRYPTED TRANSACTION CHANNEL</span>
                      </div>
                      <p className="text-[9px] text-white/80 tracking-widest leading-relaxed uppercase">
                        YOUR DATA IS PROTECTED BY 256-BIT QUANTUM SECURITY. ALL TRANSMISSIONS ARE ENCRYPTED AND LOGGED IN THE VOID.
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

          <div className="w-full md:w-96 space-y-8">
            <div className="bg-white/5 border border-white/10 p-10 space-y-8 backdrop-blur-xl">
              <h3 className="text-[10px] font-bold tracking-[0.4em] text-white/80 uppercase">MISSION ASSEMBLAGE</h3>
              <div className="space-y-6 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
                {cartItems?.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-12 h-16 bg-white/5 border border-white/10 flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover grayscale" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-[10px] font-bold tracking-widest uppercase truncate">{item.name}</p>
                      <p className="text-[8px] text-white/80 tracking-widest uppercase">SIZE: {item.size} // QTY: {item.quantity}</p>
                      <p className="text-[9px] font-bold">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-8 border-t border-white/10 space-y-4">
                <div className="flex justify-between items-center text-[10px] tracking-widest">
                  <span className="text-white/80 uppercase font-bold">SUBTOTAL</span>
                  <span className="font-bold">₹{subtotal}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] tracking-widest">
                  <span className="text-white/80 uppercase font-bold">EXPEDITION</span>
                  <span className="text-green-500 font-bold">FREE</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                  <span className="text-[10px] font-black tracking-widest uppercase">TOTAL MISSION COST</span>
                  <span className="text-2xl font-black tracking-tight glow-text">₹{subtotal}</span>
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
  const isCompleted = (current === 'review' && target === 'shipping') || 
                      (current === 'payment' && (target === 'shipping' || target === 'review')) ||
                      (current === 'success');
  
  return (
    <div className={`flex items-center gap-3 transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-30'}`}>
      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-white glow-text shadow-[0_0_10px_white]' : isCompleted ? 'bg-white/80' : 'border border-white/30'}`} />
      <span className="text-[9px] font-bold tracking-[0.4em] uppercase">{label}</span>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required }: { label: string, value: string, onChange: (v: string) => void, type?: string, required?: boolean }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold tracking-widest text-white/80 uppercase">
        {label} {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Input 
        type={type} 
        value={value} 
        onChange={e => onChange(e.target.value)}
        className="bg-white/5 border-white/10 rounded-none h-12 text-xs tracking-widest focus:border-white/60 text-white uppercase placeholder:text-white/20"
        placeholder={label}
      />
    </div>
  );
}

function PaymentOption({ label, icon, selected, onClick }: { label: string, icon: React.ReactNode, selected?: boolean, onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center justify-between p-6 border transition-all cursor-pointer ${selected ? 'border-white bg-white/5' : 'border-white/10 hover:border-white/40 bg-black/40'}`}
    >
      <div className="flex items-center gap-4">
        <div className={selected ? 'text-white' : 'text-white/60'}>{icon}</div>
        <span className={`text-[10px] font-bold tracking-widest uppercase ${selected ? 'text-white' : 'text-white/80'}`}>{label}</span>
      </div>
      {selected && <CheckCircle2 className="w-4 h-4 text-white" />}
    </div>
  );
}
