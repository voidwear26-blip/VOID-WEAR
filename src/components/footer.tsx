
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export function Footer() {
  return (
    <footer className="relative z-20 py-32 bg-black/40 backdrop-blur-md border-t border-white/10">
      <div className="container mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-24 mb-32">
          <div className="md:col-span-2 space-y-10">
            <Link href="/" className="flex items-center gap-4 group w-fit">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-4"
              >
                <Image 
                  src="/logo.png" 
                  alt="VOID WEAR" 
                  width={40} 
                  height={40} 
                  className="h-10 w-auto object-contain brightness-200 grayscale opacity-80 group-hover:opacity-100 transition-opacity"
                  unoptimized
                />
                <span className="text-sm font-black tracking-[0.4em] uppercase text-white/80 group-hover:text-white transition-colors glow-text">VOID WEAR</span>
              </motion.div>
            </Link>
            <p className="text-white/50 text-[10px] md:text-xs max-w-sm tracking-[0.4em] leading-relaxed uppercase font-light">
              REDEFINING APPAREL FOR THE ERA OF ACCELERATION. DESIGNED IN THE VOID, CRAFTED FOR THE WORLD. EST 2024.
            </p>
            <div className="flex flex-wrap gap-8 md:gap-12">
              {['INSTAGRAM', 'TWITTER', 'DISCORD', 'TELEGRAM'].map((social) => (
                <a 
                  key={social} 
                  href="#" 
                  className="text-[9px] font-bold tracking-[0.4em] text-white/40 hover:text-white transition-all duration-300 hover:glow-text uppercase"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-1 h-4 bg-white/20"></div>
              <h4 className="text-[10px] font-bold tracking-[0.5em] text-white/60 uppercase">RESOURCES</h4>
            </div>
            <div className="flex flex-col gap-5 text-[9px] text-white/40 tracking-[0.3em] uppercase font-bold">
              <Link href="/shipping" className="hover:text-white transition-colors">SHIPPING & RETURNS</Link>
              <Link href="/contact" className="hover:text-white transition-colors">CONTACT SUPPORT</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">PRIVACY PROTOCOL</Link>
              <Link href="/terms" className="hover:text-white transition-colors">TERMS OF SERVICE</Link>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-1 h-4 bg-white/20"></div>
              <h4 className="text-[10px] font-bold tracking-[0.5em] text-white/60 uppercase">TRANSMISSIONS</h4>
            </div>
            <div className="space-y-4">
              <p className="text-[9px] text-white/40 tracking-[0.3em] leading-relaxed uppercase font-bold">BASE COMMAND: NEO-TOKYO / GRID 7-A</p>
              <p className="text-[9px] text-white/40 tracking-[0.3em] leading-relaxed uppercase font-bold">UPLINK: VOIDWEAR26@GMAIL.COM</p>
            </div>
          </div>
        </div>
        
        <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[9px] text-white/40 tracking-[1em] uppercase font-bold">© 2024 VOID WEAR INC. SECURED TRANSMISSION.</p>
          <div className="flex items-center gap-6">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[8px] tracking-[0.5em] text-white/20 uppercase font-black">SYSTEM_STATUS: STABLE</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
