
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { collection, doc, deleteDoc, getDocs, writeBatch } from 'firebase/firestore';
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
    if (!user || !db) return;
    setLoading(true);

    try {
      // 1. Create order on backend
      const res = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      const orderData = await res.json();

      // 2. Load Razorpay script (if not already loaded)
      const options = {
        key: 'rzp_test_placeholder', // User should replace with real key
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'VOID WEAR',
        description: 'Digital Assemblage Purchase',
        order_id: orderData.id,
        handler: async function (response: any) {
          // 3. Verify payment
          const verifyRes = await fetch('/api/checkout/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });

          if (verifyRes.ok) {
            // 4. Create Order document and Clear Cart
            const orderId = `VOID-${Date.now()}`;
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
              title: "TRANSMISSION SUCCESSFUL",
              description: "YOUR ASSEMBLAGE HAS BEEN SECURED.",
            });
            window.location.href = '/profile';
          }
        },
        theme: {
          color: '#000000',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "LINK FAILURE",
        description: "COULD NOT INITIALIZE UPLINK.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleCheckout}
      disabled={disabled || loading} 
      className="w-full bg-white text-black hover:bg-white/90 py-10 text-[10px] font-bold tracking-[0.6em] rounded-none group"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          PROCEED TO UPLINK
          <ArrowRight className="ml-4 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </>
      )}
    </Button>
  );
}
