'use client';

import { AdminOrderNotificationListener } from '@/components/admin-order-notification-listener';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';

/**
 * ADMIN GATEWAY WRAPPER
 * Enforces strict identity verification before exposing administrative nodes.
 * Anchors master identities (Email/UID) as absolute overrides.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  const isAdmin = useMemo(() => {
    if (isUserLoading || !user) return false;
    
    // Master identity checks (UID and Email)
    const isMasterEmail = 
      user.email?.toLowerCase() === 'voidwear26@gmail.com' ||
      user.email?.toLowerCase() === 'shahabuddinosaid@gmail.com';
      
    const isMasterUID = 
      user.uid === 'A9vsqn10oddfmouKiKjWpTcFqZB2' ||
      user.uid === '0LvBBO9ySQdBKr3uwjcAjphMM8x1';
    
    // Database-driven role check
    const hasAdminRole = profile?.role === 'ADMIN';

    return isMasterEmail || isMasterUID || hasAdminRole;
  }, [user, isUserLoading, profile]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isUserLoading && !isProfileLoading && !isAdmin) {
      router.push('/');
    }
  }, [mounted, isUserLoading, isProfileLoading, isAdmin, router]);

  if (!mounted || isUserLoading || isProfileLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-[10px] tracking-[1em] uppercase font-bold text-black/40">Verifying Identity...</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <>
      <AdminOrderNotificationListener />
      {children}
    </>
  );
}