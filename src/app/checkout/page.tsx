
'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc, runTransaction } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Truck, CreditCard, ArrowRight, Loader2, CheckCircle2, Zap, Download, Hash, User as UserIcon, MapPin, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { generateInvoicePDF } from '@/lib/invoice-generator';
import { sendOrderConfirmationNotifications } from '@/app/actions/order-notifications';

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
  const [finalTransitionId, setFinalTransitionId] = useState<string | null>(null);
  const [orderObject, setOrderObject] = useState<any>(null);
  const [dataConfirmed, setDataConfirmed] = useState(false);

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
  const totalUnits = cartItems?.reduce((acc, item) => acc + Number(item.quantity), 0) || 0;
  const taxAmount = subtotal * 0.05;
  const shippingFee = (subtotal > 0 && totalUnits < 2) ? 60 : 0;
  const totalAmount = subtotal + taxAmount + shippingFee;

  const validateShippingNodes = () => {
    const { displayName, email, mobileNumber, addressLine1, city, stateProvince, postalCode } = formData;
    
    if (!displayName.trim()) return notifyIncomplete("FULL NAME");
    if (!email.trim() || !email.includes('@')) return notifyIncomplete("VALID EMAIL");
    if (!mobileNumber.trim() || mobileNumber.length < 10) return notifyIncomplete("VALID 10-DIGIT MOBILE NUMBER");
    if (!addressLine1.trim()) return notifyIncomplete("STREET ADDRESS");
    if (!city.trim()) return notifyIncomplete("CITY");
    if (!stateProvince.trim()) return notifyIncomplete("STATE");
    if (!postalCode.trim()) return notifyIncomplete("POSTAL CODE");
    
    return true;
  };

  const notifyIncomplete = (field: string) => {
    toast({
      variant: "destructive",
      title: "DATA REQUIRED",
      description: `PLEASE PROVIDE A ${field}.`,
    });
    return false;
  };

  const handleProceedToAudit = () => {
    if (validateShippingNodes()) {
      setStep('review');
      window.scrollTo(0, 0);
    }
  };

  const finalizeOrderInFirestore = async (paymentId: string) => {
    if (!user || !db || !cartItems) return;
    
    setLoading(true);
    const orderId = `VOID-${Date.now()}`;
    const orderRef = doc(db, 'users', user.uid, 'orders', orderId);
    const userRef = doc(db, 'users', user.uid);

    const newOrder = {
      id: orderId,
      order_ID: orderId, 
      transition_ID: paymentId, 
      userId: user.uid,
      displayName: formData.displayName.toUpperCase(),
      email: formData.email,
      mobileNumber: formData.mobileNumber,
      items: cartItems,
      subtotal: subtotal,
      taxAmount: taxAmount,
      shippingFee: shippingFee,
      totalAmount: Number(totalAmount), 
      orderDate: new Date().toISOString(),
      shippingStatus: 'processing',
      paymentStatus: 'paid',
      paymentProviderId: paymentId,
      paymentMethod: selectedMethod.toUpperCase(),
      addressLine1: formData.addressLine1.toUpperCase(),
      landmark: formData.landmark.toUpperCase(),
      city: formData.city.toUpperCase(),
      stateProvince: formData.stateProvince.toUpperCase(),
      postalCode: formData.postalCode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await runTransaction(db, async (transaction) => {
        transaction.set(userRef, { ...formData, updatedAt: new Date().toISOString() }, { merge: true });

        for (const item of cartItems) {
          const productRef = doc(db, 'products', item.productId);
          const productSnap = await transaction.get(productRef);
          
          if (productSnap.exists()) {
            const productData = productSnap.data();
            const matrix = productData.stockMatrix || {};
            const size = item.size;
            const color = item.color;
            const qtyPurchased = Number(item.quantity) || 1;

            if (matrix[size] && matrix[size][color] !== undefined) {
              const currentVariantStock = Number(matrix[size][color]);
              const newVariantStock = Math.max(0, currentVariantStock - qtyPurchased);
              matrix[size][color] = newVariantStock;
              
              let newTotalStock = 0;
              Object.values(matrix).forEach((colors: any) => {
                Object.values(colors).forEach((q: any) => {
                  newTotalStock += (Number(q) || 0);
                });
              });

              transaction.update(productRef, {
                stockMatrix: matrix,
                stockQuantity: newTotalStock,
                updatedAt: new Date().toISOString()
              });
            }
          }

          const itemDocRef = doc(db, 'users', user.uid, 'carts', 'active_cart', 'items', item.id);
          transaction.delete(itemDocRef);
        }

        transaction.set(orderRef, newOrder);
      });

      sendOrderConfirmationNotifications(newOrder).catch(err => console.error('[NOTIF_RELAY_FAIL]', err));

      setOrderObject(newOrder);
      setFinalOrderId(orderId);
      setFinalTransitionId(paymentId);
      setStep('success');
      toast({ title: "ORDER SECURED", description: "LOGISTICS INITIATED." });
    } catch (e) {
      console.error('[ORDER_TRANSACTION_FAILURE]', e);
      toast({
        variant: "destructive",
        title: "SYSTEM_ERROR",
        description: "TRANSACTION FAILED. PLEASE CONTACT VOID WEAR SUPPORT.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentUplink = async () => {
    if (!dataConfirmed) {
      toast({ variant: "destructive", title: "CONFIRMATION REQUIRED", description: "PLEASE CONFIRM YOUR DELIVERY DATA." });
      return;
    }
    if (!user || !db || !cartItems || cartItems.length === 0) return;
    setLoading(true);

    try {
      const res = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: Number(totalAmount),
          notes: { customer_name: formData.displayName, user_uid: user.uid }
        }),
      });

      const orderData = await res.json();
      if (!res.ok) throw new Error(orderData.message || 'GATEWAY_ERROR');

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'VOID WEAR',
        description: 'ASSEMBLAGE ACQUISITION',
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
            } else {
              toast({ variant: "destructive", title: "INTEGRITY_FAILURE" });
              setLoading(false);
            }
          } catch (err) {
            toast({ variant: "destructive", title: "RELAY_TIMEOUT" });
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
      toast({ variant: "destructive", title: "UPLINK_FAILURE", description: e.message });
      setLoading(false);
    }
  };

  if (isUserLoading || (step !== 'success' && isCartLoading) || isProfileLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background text-black gap-6">
        <Loader2 className="w-10 h-10 animate-spin text-black/20" />
        <span className="text-[10px] tracking-[1em] uppercase font-bold">Initializing...</span>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32 pb-24 px-6 bg-background text-black">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl w-full bg-black/[0.02] border border-black/10 p-16 space-y-12 text-center backdrop-blur-3xl">
          <CheckCircle2 className="w-16 h-16 text-black mx-auto" />
          <h1 className="text-4xl font-black tracking-tight uppercase font-headline">ORDER SECURED</h1>
          <p className="text-[10px] tracking-[0.5em] text-black/40 uppercase font-black">YOUR TRANSMISSION HAS BEEN RECORDED.</p>
          
          <div className="bg-white/40 border border-black/10 p-10 space-y-8 text-left">
             <div className="space-y-2">
                <p className="text-[9px] tracking-[0.4em] text-black/40 uppercase font-bold">ORDER_ID</p>
                <div className="flex items-center gap-3">
                   <Hash className="w-4 h-4 text-black/20" />
                   <p className="text-lg font-mono text-black font-black">{finalOrderId}</p>
                </div>
             </div>
             <div className="h-px bg-black/5 w-full" />
             <div className="space-y-2">
                <p className="text-[9px] tracking-[0.4em] text-black/40 uppercase font-bold">PAYMENT_ID</p>
                <div className="flex items-center gap-3">
                   <Zap className="w-4 h-4 text-black/20" />
                   <p className="text-sm font-mono text-black/80 uppercase break-all">{finalTransitionId}</p>
                </div>
             </div>
          </div>

          <div className="flex flex-col gap-4">
             <Button onClick={() => orderObject && generateInvoicePDF(orderObject)} className="h-16 bg-black text-white hover:bg-black/90 rounded-none text-[10px] font-bold tracking-[0.4em] uppercase">
                DOWNLOAD INVOICE (PDF) <Download className="ml-3 w-4 h-4" />
             </Button>
             <Link href="/profile" className="text-[10px] tracking-[0.5em] text-black/40 hover:text-black transition-all uppercase font-black">VIEW DOSSIER</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen text-black">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-16">
          <div className="flex-1 space-y-12">
            <div className="flex items-center gap-6 mb-12 opacity-50">
              <span className={`text-[10px] tracking-widest ${step === 'shipping' ? 'text-black font-bold opacity-100' : 'text-black'}`}>01. SHIPPING</span>
              <span className={`text-[10px] tracking-widest ${step === 'review' ? 'text-black font-bold opacity-100' : 'text-black'}`}>02. REVIEW</span>
              <span className={`text-[10px] tracking-widest ${step === 'payment' ? 'text-black font-bold opacity-100' : 'text-black'}`}>03. PAYMENT</span>
            </div>

            <AnimatePresence mode="wait">
              {step === 'shipping' && (
                <motion.div key="ship" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                  <h2 className="text-3xl font-black tracking-tighter uppercase font-headline">Shipping Nodes</h2>
                  <div className="grid md:grid-cols-2 gap-8">
                     <Field label="RECIPIENT NAME" value={formData.displayName} onChange={v => setFormData({...formData, displayName: v})} />
                     <Field label="EMAIL NODE" value={formData.email} onChange={v => setFormData({...formData, email: v})} />
                     <Field label="MOBILE UPLINK" value={formData.mobileNumber} onChange={v => setFormData({...formData, mobileNumber: v})} placeholder="+91..." />
                     <Field label="CITY / DISTRICT" value={formData.city} onChange={v => setFormData({...formData, city: v})} />
                     <Field label="STATE / PROVINCE" value={formData.stateProvince} onChange={v => setFormData({...formData, stateProvince: v})} />
                     <Field label="POSTAL CODE" value={formData.postalCode} onChange={v => setFormData({...formData, postalCode: v})} />
                     <div className="md:col-span-2 grid md:grid-cols-2 gap-8">
                        <Field label="STREET ADDRESS" value={formData.addressLine1} onChange={v => setFormData({...formData, addressLine1: v})} />
                        <Field label="LANDMARK (OPTIONAL)" value={formData.landmark} onChange={v => setFormData({...formData, landmark: v})} placeholder="NEAR..." />
                     </div>
                  </div>
                  <Button onClick={handleProceedToAudit} className="w-full h-16 bg-black text-white hover:bg-black/90 rounded-none text-[10px] font-bold tracking-[0.5em] transition-all">
                    PROCEED TO REVIEW <ArrowRight className="ml-3 w-4 h-4" />
                  </Button>
                </motion.div>
              )}

              {step === 'review' && (
                <motion.div key="rev" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
                   <div className="space-y-4">
                      <h2 className="text-3xl font-black tracking-tighter uppercase font-headline">Order Audit</h2>
                      <p className="text-[10px] tracking-[0.2em] text-black/60 uppercase font-bold">PLEASE VERIFY ALL COORDINATES BEFORE UPLINK.</p>
                   </div>
                   
                   <div className="bg-black/[0.02] border border-black/10 p-12 space-y-12 backdrop-blur-xl">
                      <div className="grid md:grid-cols-2 gap-12">
                         <div className="space-y-4">
                            <div className="flex items-center gap-3 text-black/40">
                               <UserIcon className="w-4 h-4" />
                               <span className="text-[9px] font-black tracking-widest uppercase">CUSTOMER</span>
                            </div>
                            <div className="space-y-1">
                               <p className="text-sm font-black uppercase">{formData.displayName}</p>
                               <div className="flex items-center gap-2 text-[10px] text-black/60">
                                  <Mail className="w-3 h-3" /> {formData.email}
                               </div>
                               <div className="flex items-center gap-2 text-[10px] text-black/60">
                                  <Phone className="w-3 h-3" /> {formData.mobileNumber}
                               </div>
                            </div>
                         </div>

                         <div className="space-y-4">
                            <div className="flex items-center gap-3 text-black/40">
                               <MapPin className="w-4 h-4" />
                               <span className="text-[9px] font-black tracking-widest uppercase">DESTINATION</span>
                            </div>
                            <div className="space-y-1">
                               <p className="text-sm font-black uppercase">{formData.addressLine1}</p>
                               {formData.landmark && <p className="text-[10px] text-black/60 uppercase">LANDMARK: {formData.landmark}</p>}
                               <p className="text-[10px] text-black/60 uppercase">
                                  {formData.city}, {formData.stateProvince} - {formData.postalCode}
                               </p>
                            </div>
                         </div>
                      </div>

                      <div className="pt-8 border-t border-black/5">
                         <div className="p-6 bg-white/40 border border-black/5 flex items-center gap-4 cursor-pointer" onClick={() => setDataConfirmed(!dataConfirmed)}>
                            <Checkbox 
                              id="confirmData" 
                              checked={dataConfirmed} 
                              onCheckedChange={(val: boolean) => setDataConfirmed(val)}
                              className="border-black data-[state=checked]:bg-black"
                            />
                            <label htmlFor="confirmData" className="text-[9px] tracking-widest uppercase font-bold text-black/80 leading-relaxed cursor-pointer">
                               I CONFIRM THAT ALL SHIPPING DATA IS ACCURATE AND COMPLETE.
                            </label>
                         </div>
                      </div>
                   </div>

                   <div className="flex flex-col sm:flex-row gap-4">
                      <Button variant="ghost" onClick={() => setStep('shipping')} className="h-16 border border-black/10 text-[10px] font-bold tracking-[0.5em] rounded-none uppercase px-12">
                         GO BACK
                      </Button>
                      <Button 
                        disabled={!dataConfirmed}
                        onClick={() => setStep('payment')} 
                        className="flex-1 h-16 bg-black text-white hover:bg-black/90 rounded-none text-[10px] font-bold tracking-[0.5em] transition-all disabled:opacity-30"
                      >
                         CONTINUE TO PAYMENT <ArrowRight className="ml-3 w-4 h-4" />
                      </Button>
                   </div>
                </motion.div>
              )}

              {step === 'payment' && (
                <motion.div key="pay" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
                   <h2 className="text-3xl font-black tracking-tighter uppercase font-headline">Gateway Node</h2>
                   <div className="grid gap-4">
                      <PaymentOption label="UPI TRANSMISSION" selected={selectedMethod === 'upi'} onClick={() => setSelectedMethod('upi')} />
                      <PaymentOption label="CREDIT / DEBIT MODULE" selected={selectedMethod === 'card'} onClick={() => setSelectedMethod('card')} />
                   </div>
                   <Button onClick={handlePaymentUplink} disabled={loading} className="w-full h-16 bg-black text-white hover:bg-black/90 rounded-none text-[10px] font-bold tracking-[0.5em] shadow-xl">
                      {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <>INITIALIZE UPLINK <Zap className="ml-3 w-4 h-4" /></>}
                   </Button>
                   <button onClick={() => setStep('review')} className="w-full text-[9px] tracking-[0.4em] text-black/40 hover:text-black transition-all uppercase font-black">BACK TO AUDIT</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-full md:w-96">
            <div className="bg-black/[0.02] border border-black/10 p-10 space-y-8 backdrop-blur-xl lg:sticky lg:top-40">
               <h3 className="text-[10px] font-bold tracking-[0.4em] text-black/60 uppercase border-b border-black/10 pb-4">BAG CONTENTS</h3>
               <div className="space-y-6 max-h-[40vh] overflow-y-auto no-scrollbar pr-2">
                  {cartItems?.map(item => (
                    <div key={item.id} className="flex gap-4">
                       <div className="relative w-12 aspect-[3/4] bg-black/5 shrink-0">
                          <Image src={item.image} alt={item.name} fill className="object-cover grayscale" unoptimized />
                       </div>
                       <div className="flex-1 space-y-1">
                          <p className="text-[10px] font-bold tracking-widest uppercase truncate max-w-[150px] text-black">{item.name}</p>
                          <p className="text-[8px] text-black/40 uppercase">SZ: {item.size} // QTY: {item.quantity}</p>
                          <div className="flex items-center gap-2">
                             {item.originalPrice && item.originalPrice > item.price && (
                               <span className="text-[8px] line-through text-black/30 tracking-widest">₹{item.originalPrice * item.quantity}</span>
                             )}
                             <p className="text-[9px] text-black font-bold">₹{item.price * item.quantity}</p>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
               
               <div className="pt-8 border-t border-black/10 space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                     <span className="text-black/40">SUBTOTAL</span>
                     <span className="text-black">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                     <span className="text-black/40">ESTIMATED TAX</span>
                     <span className="text-black">₹{taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                     <span className="text-black/40">SHIPPING FEE</span>
                     <div className="flex items-center gap-2">
                        {totalUnits >= 2 && <span className="line-through text-black/30 text-[9px]">₹60.00</span>}
                        <span className="text-black">{shippingFee === 0 ? 'FREE' : `₹${shippingFee.toFixed(2)}`}</span>
                     </div>
                  </div>
                  <div className="pt-4 border-t border-black/5 flex justify-between items-center">
                     <span className="text-[11px] font-black uppercase text-black/60">GRAND TOTAL</span>
                     <span className="text-2xl font-black text-black">₹{totalAmount.toFixed(2)}</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-bold tracking-widest text-black/40 uppercase">{label}</label>
      <Input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="bg-black/5 border-black/10 rounded-none h-12 text-[10px] tracking-widest focus:border-black/60 text-black uppercase transition-all" />
    </div>
  );
}

function PaymentOption({ label, selected, onClick }: { label: string, selected?: boolean, onClick: () => void }) {
  return (
    <div onClick={onClick} className={`p-6 border cursor-pointer transition-all ${selected ? 'border-black bg-black/5' : 'border-black/10 hover:border-black/40 bg-white/40'}`}>
       <span className={`text-[10px] font-bold tracking-widest uppercase ${selected ? 'text-black' : 'text-black/40'}`}>{label}</span>
    </div>
  );
}
