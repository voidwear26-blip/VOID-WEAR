
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
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

      // 2. Initialize Razorpay Gateway
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder', 
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'VOID WEAR',
        description: 'SECURE DIGITAL TRANSMISSION',
        order_id: orderData.id,
        handler: async function (response: any) {
          setLoading(true);
          
          // 3. Strict Signature Verification
          const verifyRes = await fetch('/api/checkout/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });

          if (verifyRes.ok) {
            // 4. Atomic Transaction: Create Order & Clear Cart
            const orderId = `VOID-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const orderRef = doc(db, 'users', user.uid, 'orders', orderId);
            const cartItemsRef = collection(db, 'users', user.uid, 'carts', 'active_cart', 'items');
            
            const cartSnap = await getDocs(cartItemsRef);
            const batch = writeBatch(db);

            batch.set(orderRef, {
              id: orderId,
              userId: user.uid,
              orderNumber: orderId,
              orderDate: new Date().toISOString(),
              totalAmount: amount,
              currency: 'INR',
              paymentStatus: 'paid',
              shippingStatus: 'processing',
              paymentProviderTransactionId: response.razorpay_payment_id,
              paymentMethod: 'Razorpay',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });

            cartSnap.docs.forEach(doc => {
              batch.delete(doc.ref);
            });

            await batch.commit();

            toast({
              title: "TRANSMISSION SECURED",
              description: "YOUR ASSEMBLAGE HAS BEEN LOGGED IN THE VOID.",
            });
            
            window.location.href = '/profile';
          } else {
            toast({
              variant: "destructive",
              title: "VERIFICATION_FAILURE",
              description: "SECURITY SIGNATURE MISMATCH. CONTACT SUPPORT.",
            });
          }
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: '#000000',
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('[CHECKOUT_EXCEPTION]', error);
      toast({
        variant: "destructive",
        title: "LINK_FAILURE",
        description: "COULD NOT ESTABLISH SECURE UPLINK. RETRY LATER.",
      });
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
          <ShieldCheck className="absolute left-6 w-4 h-4 text-black/20" />
          PROCEED TO UPLINK
          <ArrowRight className="ml-4 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </>
      )}
    </Button>
  );
}
