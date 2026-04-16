
'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ShoppingBag, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
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
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-20">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
              <ShoppingBag className="w-16 h-16 stroke-[0.5px]" />
            </motion.div>
            <p className="text-[10px] tracking-[1em]">SYSTEM OFFLINE: CART DISABLED</p>
          </div>
        </div>

        <SheetFooter className="p-10 border-t border-white/5 bg-white/[0.02] space-y-8 flex-col items-stretch">
          <p className="text-[8px] text-white/20 tracking-[0.2em] leading-relaxed">
            DATABASE DISCONNECTED. PURCHASES ARE CURRENTLY RESTRICTED.
          </p>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
