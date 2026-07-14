'use client';

import { useEffect, useRef, useMemo } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { collectionGroup, query, onSnapshot, orderBy, limit, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { ShoppingBag, Zap } from 'lucide-react';

/**
 * ADMIN ORDER NOTIFICATION LISTENER
 * Establishes a real-time uplink to the global orders collection.
 * Triggers cinematic toasts for new orders when admin is active.
 * Fortified with lifecycle checks to prevent SDK assertion failures (ID: ca9).
 */
export function AdminOrderNotificationListener() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const mountTime = useRef(new Date().toISOString());

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile } = useDoc(profileRef);

  const isAdmin = useMemo(() => {
    if (!user) return false;
    return user.email?.toLowerCase() === 'voidwear26@gmail.com' || 
           user.uid === 'A9vsqn10oddfmouKiKjWpTcFqZB2' ||
           profile?.role === 'ADMIN';
  }, [user, profile]);

  useEffect(() => {
    if (!db || !isAdmin) return;
    let isMounted = true;
    let unsubscribe: () => void = () => {};

    try {
      const q = query(
        collectionGroup(db, 'orders'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );

      unsubscribe = onSnapshot(q, (snapshot) => {
        if (!isMounted) return;

        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const order = change.doc.data();
            
            // Filter historical orders
            if (order.createdAt > mountTime.current) {
              toast({
                title: "NEW ORDER DETECTED",
                description: `ORDER ${order.order_ID || order.id} / ₹${order.totalAmount}`,
                action: (
                  <div className="flex items-center gap-2 pr-4">
                     <Zap className="w-4 h-4 text-white animate-pulse" />
                     <ShoppingBag className="w-4 h-4 text-white" />
                  </div>
                ),
              });
              
              try {
                 const audio = new Audio('/notification.mp3');
                 audio.play().catch(() => {});
              } catch (e) {}
            }
          }
        });
      }, (error) => {
        if (!isMounted) return;
        if (error.code === 'failed-precondition') {
          console.warn('[ADMIN_NOTIFIER] Index building or missing. Check Firebase Console.');
        } else {
          console.error('[ADMIN_NOTIFIER] Real-time uplink error:', error);
        }
      });
    } catch (err) {
      console.error('[ADMIN_NOTIFIER] Listener initialization failed:', err);
    }

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [db, isAdmin, toast]);

  return null;
}
