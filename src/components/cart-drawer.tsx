'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Trash2, Plus, Minus, Package, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import Image from 'next/image';
import { CheckoutButton } from './checkout-button';
import { removeFromCart } from '@/firebase/cart-actions';

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { user } = useUser();
  const db = useFirestore();

  const cartQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'carts', 'active_cart', 'items');
  }, [db, user]);

  const { data: cartItems, isLoading } = useCollection(cartQuery);

  const subtotal = cartItems?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0;

  const updateQuantity = async (itemId: string, delta: number) => {
    if (!db || !user) return;
    const itemRef = doc(db, 'users', user.uid, 'carts', 'active_cart', 'items', itemId);
    const item = cartItems?.find(i => i.id === itemId);
    if (!item) return;
    
    const newQty = (item.quantity || 0) + delta;
    if (newQty <= 0) {
      await deleteDoc(itemRef);
    } else {
      await updateDoc(itemRef, { quantity: newQty });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-black border-l border-white/5 text-white p-0 flex flex-col w-full sm:max-w-md backdrop-blur-xl">
        <SheetHeader className="p-10 border-b border-white/5">
          <SheetTitle className="text-sm font-bold tracking-[0.5em] flex items-center gap-4">
            <ShoppingBag className="w-4 h-4" />
            YOUR BAG
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar">
          {!user ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
              <Package className="w-12 h-12 stroke-[0.5px]" />
              <p className="text-[10px] tracking-[0.5em] uppercase">AUTHENTICATION REQUIRED</p>
            </div>
          ) : isLoading ? (
            <div className="h-full flex flex-col items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-white/20" />
            </div>
          ) : cartItems && cartItems.length > 0 ? (
            <div className="space-y-8">
              <AnimatePresence>
                {cartItems.map((item) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-6 group"
                  >
                    <div className="relative w-24 aspect-[3/4] bg-white/5 border border-white/10 overflow-hidden">
                      <Image 
                        src={item.image || 'https://picsum.photos/seed/void/200/300'} 
                        alt={item.name || 'Assemblage module'} 
                        fill 
                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold tracking-widest uppercase">{item.name}</p>
                          <p className="text-[8px] text-white/40 tracking-[0.2em] uppercase">SIZE: {item.size}</p>
                        </div>
                        <button 
                          onClick={() => removeFromCart(db!, user.uid, item.id)}
                          className="text-white/20 hover:text-white transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4 border border-white/10 px-3 py-1 bg-white/[0.02]">
                          <button onClick={() => updateQuantity(item.id, -1)} className="text-white/40 hover:text-white"><Minus className="w-3 h-3" /></button>
                          <span className="text-[9px] font-mono w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="text-white/40 hover:text-white"><Plus className="w-3 h-3" /></button>
                        </div>
                        <p className="text-[10px] font-bold tracking-widest">₹{item.price * item.quantity}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-20">
              <ShoppingBag className="w-16 h-16 stroke-[0.5px]" />
              <p className="text-[10px] tracking-[1em] uppercase">BAG IS EMPTY</p>
            </div>
          )}
        </div>

        {cartItems && cartItems.length > 0 && (
          <SheetFooter className="p-10 border-t border-white/5 bg-white/[0.02] flex flex-col gap-10 sm:flex-col items-stretch">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-bold tracking-[0.5em] uppercase">
                <span className="text-white/40">SUBTOTAL</span>
                <span className="text-white">₹{subtotal}</span>
              </div>
              <p className="text-[8px] text-white/20 tracking-[0.2em] uppercase leading-relaxed">
                TAXES AND SHIPPING CALCULATED AT UPLINK.
              </p>
            </div>
            <CheckoutButton amount={subtotal} />
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
