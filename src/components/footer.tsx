'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Instagram, Facebook } from 'lucide-react';

export function Footer() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <footer className="relative z-20 pt-32 pb-32 bg-black/[0.02] border-t border-black/5">
      <div className="container mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-24 mb-32">
          <div className="md:col-span-2 space-y-10">
            <Link href="/" className="group flex items-center gap-4 w-fit">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-4"
              >
                <Image 
                  src="/logo.png" 
                  alt="VOID WEAR" 
                  width={40} 
                  height={40} 
                  className="h-10 w-auto object-contain grayscale opacity-100"
                  unoptimized
                />
                <span className="text-sm font-black tracking-[0.4em] uppercase text-black">VOID WEAR</span>
              </motion.div>
            </Link>
            <p className="text-black/60 text-[10px] md:text-xs max-w-sm tracking-[0.3em] leading-relaxed uppercase font-light">
              REDEFINING APPAREL FOR THE ERA OF ACCELERATION.
            </p>
            <div className="flex flex-wrap gap-4">
              <SocialLink href="https://www.instagram.com/voidwearofficial_" icon={<Instagram className="w-5 h-5" />} />
              <SocialSocialLink href="https://www.facebook.com/share/1DbtMjAWYh/" icon={<Facebook className="w-5 h-5" />} />
            </div>
          </div>
          
          <div className="space-y-8">
            <h4 className="text-[10px] font-bold tracking-[0.5em] text-black uppercase">RESOURCES</h4>
            <div className="flex flex-col gap-5 text-[9px] text-black/60 tracking-[0.3em] uppercase font-bold">
              <Link href="/shipping" className="hover:text-black transition-colors">SHIPPING & RETURNS</Link>
              <Link href="/privacy" className="hover:text-black transition-colors">PRIVACY POLICY</Link>
              <Link href="/terms" className="hover:text-black transition-colors">TERMS OF SERVICE</Link>
              <Link href="/contact" className="hover:text-black transition-colors">CONTACT SUPPORT</Link>
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="text-[10px] font-bold tracking-[0.5em] text-black uppercase">UPLINK</h4>
            <div className="space-y-4">
              <p className="text-[9px] text-black/80 tracking-[0.3em] uppercase font-bold">VOIDWEAR26@GMAIL.COM</p>
              <p className="text-[8px] text-black/30 tracking-[0.4em] uppercase font-bold">EST. 2026</p>
            </div>
          </div>
        </div>
        
        <div className="pt-16 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[9px] text-black/40 tracking-widest uppercase font-bold">© 2026 VOID WEAR INC.</p>
          <div className="flex items-center gap-6">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-[8px] tracking-[0.5em] text-black/40 uppercase font-black">SYSTEM_STABLE</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon }: { href: string, icon: any }) {
  return (
    <a 
      href={href} 
      target="_blank"
      rel="noopener noreferrer"
      className="p-4 border border-black/5 bg-black/[0.01] hover:bg-black/5 hover:border-black/10 transition-all group"
    >
      {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: "w-5 h-5 text-black/40 group-hover:text-black transition-colors" }) : icon}
    </a>
  );
}

// Added alias to fix duplication in original code if necessary
function SocialSocialLink({ href, icon }: { href: string, icon: any }) {
  return <SocialLink href={href} icon={icon} />;
}
