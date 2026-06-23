'use client';

import { AdminOrderNotificationListener } from '@/components/admin-order-notification-listener';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const isAdmin = user?.email?.toLowerCase() === 'voidwear26@gmail.com' || 
                 user?.uid === 'A9vsqn10oddfmouKiKjWpTcFqZB2';

  useEffect(() => {
    setMounted(true);
    if (!isUserLoading && mounted && !isAdmin) {
      router.push('/');
    }
  }, [user, isUserLoading, router, mounted, isAdmin]);

  if (!mounted || isUserLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-[10px] tracking-[1em] uppercase font-bold text-white/40">Authenticating...</div>
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
