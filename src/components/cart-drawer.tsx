
"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ShoppingBag, X, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { products } from '@/app/lib/products';

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  // Mock cart items
  const cartItems = products.slice(0, 2).map(p => ({ ...p, quantity: 1 }));
  const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-black border-l border-white/10 text-white p-0 flex flex-col w-full sm:max-w-md">
        <SheetHeader className="p-8 border-b border-white/10">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold tracking-[0.4em] flex items-center gap-3">
              <ShoppingBag className="w-5 h-5" />
              YOUR BAG
            </SheetTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="hover:bg-white/10">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <div key={item.id} className="flex gap-6 group">
                <div className="relative w-24 h-32 flex-shrink-0 bg-white/5 overflow-hidden">
                  <Image src={item.image} alt={item.name} fill className="object-cover grayscale" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between">
                    <h4 className="text-xs font-bold tracking-widest">{item.name}</h4>
                    <span className="text-xs font-bold">${item.price}</span>
                  </div>
                  <p className="text-[10px] text-white/40">{item.category}</p>
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center border border-white/20 text-xs">
                      <button className="px-3 py-1 hover:bg-white/10 border-r border-white/20">-</button>
                      <span className="px-4 py-1">{item.quantity}</span>
                      <button className="px-3 py-1 hover:bg-white/10 border-l border-white/20">+</button>
                    </div>
                    <button className="text-white/40 hover:text-white transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
              <ShoppingBag className="w-12 h-12 stroke-[1px]" />
              <p className="text-xs tracking-[0.5em]">THE VOID IS EMPTY</p>
            </div>
          )}
        </div>

        <SheetFooter className="p-8 border-t border-white/10 bg-white/5 space-y-6 flex-col items-stretch">
          <div className="flex justify-between text-xs tracking-[0.2em] font-bold">
            <span>SUBTOTAL</span>
            <span>${subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-[10px] text-white/40 tracking-widest">
            <span>SHIPPING & TAXES CALCULATED AT CHECKOUT</span>
          </div>
          <Button className="w-full bg-white text-black hover:bg-white/90 py-8 text-sm font-bold tracking-[0.4em] rounded-none">
            PROCEED TO CHECKOUT
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
