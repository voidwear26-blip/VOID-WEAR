'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ShoppingBag, X, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckoutButton } from './checkout-button';
import { useState, useEffect } from 'react';

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { user } = useUser();
  const db = useFirestore();

  const cartItemsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'carts', 'active_cart', 'items');
  }, [db, user]);

  const { data: cartItems, isLoading } = useCollection(cartItemsQuery);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (cartItems) {
      setTotal(cartItems.reduce((acc, item) => acc + (item.quantity * 250), 0));
    }
  }, [cartItems]);

  const handleRemove = (itemId: string) => {
    if (!db || !user) return;
    const itemRef = doc(db, 'users', user.uid, 'carts', 'active_cart', 'items', itemId);
    deleteDocumentNonBlocking(itemRef);
  };

  const iconMotionProps = {
    whileHover: { scale: 1.2, filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))" },
    whileTap: { scale: 0.9 },
    transition: { type: "spring", stiffness: 400, damping: 10 }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-black border-l border-white/5 text-white p-0 flex flex-col w-full sm:max-w-md backdrop-blur-xl">
        <SheetHeader className="p-10 border-b border-white/5">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-sm font-bold tracking-[0.5em] flex items-center gap-4">
              <motion.div {...iconMotionProps}>
                <ShoppingBag className="w-4 h-4" />
              </motion.div>
              YOUR BAG
            </SheetTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="hover:bg-white/5 rounded-none">
              <motion.div {...iconMotionProps}>
                <X className="w-5 h-5" />
              </motion.div>
            </Button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-20">
              <div className="w-8 h-8 border-2 border-white border-t-transparent animate-spin rounded-full" />
              <p className="text-[10px] tracking-[0.5em]">SYNCING DATA</p>
            </div>
          ) : cartItems && cartItems.length > 0 ? (
            <AnimatePresence>
              {cartItems.map((item) => (
                <motion.div 
                  key={item.id} 
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex gap-8 group"
                >
                  <div className="relative w-24 h-32 flex-shrink-0 bg-white/5 overflow-hidden">
                    <Image src={`https://picsum.photos/seed/${item.id}/200/300`} alt="Item" fill className="object-cover grayscale" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="text-[10px] font-bold tracking-widest uppercase">MODULE-{item.id.slice(0,4)}</h4>
                      <motion.button 
                        {...iconMotionProps}
                        onClick={() => handleRemove(item.id)} 
                        className="text-white/20 hover:text-white transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                    <p className="text-[9px] text-white/40 tracking-[0.2em]">QTY: {item.quantity}</p>
                    <div className="pt-2 text-[10px] font-bold tracking-widest">$250</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-20">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
                <ShoppingBag className="w-16 h-16 stroke-[0.5px]" />
              </motion.div>
              <p className="text-[10px] tracking-[1em]">THE VOID IS EMPTY</p>
            </div>
          )}
        </div>

        <SheetFooter className="p-10 border-t border-white/5 bg-white/[0.02] space-y-8 flex-col items-stretch">
          <div className="flex justify-between text-[10px] tracking-[0.3em] font-bold">
            <span className="text-white/40">SUBTOTAL</span>
            <span className="glow-text">${total.toFixed(2)}</span>
          </div>
          <p className="text-[8px] text-white/20 tracking-[0.2em] leading-relaxed">
            ALL DATA IS ENCRYPTED. TAXES AND SHIPPING CALCULATED AT UPLINK.
          </p>
          <CheckoutButton amount={total} disabled={!cartItems?.length} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}