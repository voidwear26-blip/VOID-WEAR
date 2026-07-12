'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Trash2, Plus, Minus, Package, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { removeFromCart } from '@/firebase/cart-actions';

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();

  const cartQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'carts', 'active_cart', 'items');
  }, [db, user]);

  const { data: cartItems, isLoading } = useCollection(cartQuery);

  const subtotal = cartItems?.reduce((acc, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 0;
    return acc + (price * qty);
  }, 0) || 0;

  const updateQuantity = async (itemId: string, delta: number) => {
    if (!db || !user) return;
    const itemRef = doc(db, 'users', user.uid, 'carts', 'active_cart', 'items', itemId);
    const item = cartItems?.find(i => i.id === itemId);
    if (!item) return;
    
    const newQty = (item.quantity || 0) + delta;
    if (newQty <= 0) {
      await deleteDoc(itemRef);
    } else {
      await updateDoc(itemRef, { 
        quantity: newQty,
        updatedAt: new Date().toISOString()
      });
    }
  };

  const handleCheckout = () => {
    onOpenChange(false);
    router.push('/checkout');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-white border-l border-black/5 text-black p-0 flex flex-col w-full sm:max-w-md backdrop-blur-xl">
        <SheetHeader className="p-10 border-b border-black/5">
          <SheetTitle className="text-sm font-bold tracking-[0.5em] flex items-center gap-4 text-black uppercase">
            <ShoppingBag className="w-4 h-4" />
            BAG
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar">
          {!user ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
              <Package className="w-12 h-12 stroke-[0.5px]" />
              <p className="text-[10px] tracking-[0.5em] uppercase">PLEASE LOGIN</p>
            </div>
          ) : isLoading ? (
            <div className="h-full flex flex-col items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-black/20" />
            </div>
          ) : cartItems && cartItems.length > 0 ? (
            <div className="space-y-8">
              <AnimatePresence>
                {cartItems.map((item) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex gap-6 group"
                  >
                    <div className="relative w-24 aspect-[3/4] bg-black/5 border border-black/5 overflow-hidden">
                      <Image 
                        src={item.image || 'https://picsum.photos/seed/void/200/300'} 
                        alt={item.name} 
                        fill 
                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold tracking-widest uppercase truncate max-w-[150px]">{item.name}</p>
                          <p className="text-[8px] text-black/40 tracking-[0.2em] uppercase">SIZE: {item.size}</p>
                        </div>
                        <button 
                          onClick={() => removeFromCart(db!, user.uid, item.id)}
                          className="text-black/20 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4 border border-black/10 px-3 py-1 bg-black/[0.02]">
                          <button onClick={() => updateQuantity(item.id, -1)} className="text-black/40 hover:text-black"><Minus className="w-3 h-3" /></button>
                          <span className="text-[9px] font-mono w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="text-black/40 hover:text-black"><Plus className="w-3 h-3" /></button>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-bold tracking-widest">₹{(Number(item.price) || 0) * (Number(item.quantity) || 0)}</p>
                        </div>
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
          <SheetFooter className="p-10 border-t border-black/5 bg-black/[0.01] flex flex-col gap-10 sm:flex-col items-stretch">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold tracking-[0.5em] uppercase">
                <span className="text-black/40">SUBTOTAL</span>
                <span className="text-black">₹{subtotal}</span>
              </div>
            </div>
            <Button 
              onClick={handleCheckout}
              className="w-full bg-black text-white hover:bg-black/90 py-10 text-[10px] font-bold tracking-[0.6em] rounded-none group"
            >
              PROCEED TO CHECKOUT
              <ArrowRight className="ml-4 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
