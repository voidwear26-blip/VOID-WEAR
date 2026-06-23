'use client';

import { useEffect, useRef } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collectionGroup, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { ShoppingBag, Zap } from 'lucide-react';

/**
 * ADMIN ORDER NOTIFICATION LISTENER
 * Establishes a real-time uplink to the global orders collection.
 * Triggers cinematic toasts for new transmissions when admin is active.
 */
export function AdminOrderNotificationListener() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const mountTime = useRef(new Date().toISOString());

  const isAdmin = user?.email?.toLowerCase() === 'voidwear26@gmail.com';

  useEffect(() => {
    if (!db || !isAdmin) return;

    // Listen for new orders globally
    const q = query(
      collectionGroup(db, 'orders'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const order = change.doc.data();
          
          // Only notify for orders created after this listener mounted to avoid history spam
          if (order.createdAt > mountTime.current) {
            toast({
              title: "NEW TRANSMISSION DETECTED",
              description: `ORDER ${order.order_ID} / VALUATION: ₹${order.totalAmount}`,
              action: (
                <div className="flex items-center gap-2 pr-4">
                   <Zap className="w-4 h-4 text-white animate-pulse" />
                   <ShoppingBag className="w-4 h-4 text-white" />
                </div>
              ),
            });
            // Play a subtle notification tone if needed
            try {
               const audio = new Audio('/notification.mp3');
               audio.play().catch(() => {}); // Handle browser block
            } catch (e) {}
          }
        }
      });
    });

    return () => unsubscribe();
  }, [db, isAdmin, toast]);

  return null;
}
