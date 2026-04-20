'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, ShieldCheck, Zap } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface CheckoutButtonProps {
  amount: number;
  disabled?: boolean;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function CheckoutButton({ amount, disabled }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const handleCheckout = async () => {
    if (!user || !db) {
      toast({
        variant: "destructive",
        title: "AUTH_REQUIRED",
        description: "PLEASE LOG IN TO SECURE YOUR TRANSMISSION.",
      });
      return;
    }
    
    setLoading(true);

    try {
      // 1. Create order on backend with validation
      const res = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      if (!res.ok) throw new Error('ORDER_CREATION_FAILED');
      
      const orderData = await res.json();

      // 2. Mock mode bypass
      if (orderData.isMock) {
        toast({ title: "DEV_MODE_ACTIVE", description: "MOCK TRANSMISSION INITIALIZED." });
        setTimeout(async () => {
           const orderId = `VOID-MOCK-${Date.now()}`;
           const orderRef = doc(db, 'users', user.uid, 'orders', orderId);
           await writeBatch(db).set(orderRef, {
             id: orderId, userId: user.uid, totalAmount: amount, paymentStatus: 'paid', createdAt: new Date().toISOString()
           }).commit();
           window.location.href = '/profile';
        }, 1500);
        return;
      }

      // 3. Initialize Razorpay Gateway
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'VOID WEAR',
        description: 'SECURE DIGITAL TRANSMISSION',
        order_id: orderData.id,
        handler: async function (response: any) {
          setLoading(true);
          const verifyRes = await fetch('/api/checkout/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });

          if (verifyRes.ok) {
            window.location.href = '/profile';
          } else {
            toast({ variant: "destructive", title: "VERIFICATION_FAILURE" });
          }
        },
        prefill: { email: user.email },
        theme: { color: '#000000' }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('[CHECKOUT_EXCEPTION]', error);
      toast({ variant: "destructive", title: "LINK_FAILURE" });
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleCheckout}
      disabled={disabled || loading} 
      className="w-full bg-white text-black hover:bg-white/90 py-10 text-[10px] font-bold tracking-[0.6em] rounded-none group relative overflow-hidden"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          <Zap className="absolute left-6 w-4 h-4 text-black/20" />
          PROCEED TO UPLINK
          <ArrowRight className="ml-4 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </>
      )}
    </Button>
  );
}
