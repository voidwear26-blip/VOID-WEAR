
"use client"

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
      {/* Background Particles */}
      <div className="particle-bg">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              animationDuration: `${Math.random() * 10 + 5}s`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      {/* Rotating Eclipse Logo */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-[300px] h-[300px] md:w-[600px] md:h-[600px]">
          <div className="absolute inset-0 rounded-full border border-white/5 animate-rotate-slow"></div>
          <div className="absolute inset-4 rounded-full border-t border-white/20 animate-rotate-slow"></div>
          <div className="absolute inset-20 flex items-center justify-center">
            <div className="w-full h-full rounded-full eclipse-logo animate-pulse"></div>
          </div>
          {/* Outer glow aura */}
          <div className="absolute -inset-20 bg-white/5 rounded-full blur-[100px] animate-glow-pulse"></div>
        </div>
      </div>

      {/* Cinematic Text Content */}
      <div className="relative z-10 text-center space-y-8 max-w-4xl px-6">
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 fill-mode-forwards">
          <h2 className="text-xs md:text-sm font-medium tracking-[1em] text-white/40 uppercase">Void Wear / Series 01</h2>
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter leading-none glow-text">
            ASCEND THE <br /> DIGITAL VOID
          </h1>
          <p className="text-sm md:text-lg text-white/60 max-w-md mx-auto tracking-widest font-light leading-relaxed">
            FUTURE-READY APPAREL FOR THE HYPER-VIRTUAL GENERATION. MINIMALIST DESIGN, MAXIMALIST IMPACT.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 animate-in fade-in slide-in-from-bottom-20 duration-1000 delay-500 fill-mode-forwards">
          <Button asChild className="bg-white text-black hover:bg-white/90 px-12 py-7 text-sm font-bold tracking-[0.3em] rounded-none">
            <Link href="/products">EXPLORE COLLECTION</Link>
          </Button>
          <Button variant="outline" asChild className="border-white/20 text-white hover:bg-white hover:text-black px-12 py-7 text-sm font-bold tracking-[0.3em] rounded-none bg-transparent">
            <Link href="/assistant">STYLE ASSISTANT</Link>
          </Button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 animate-bounce opacity-40">
        <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent"></div>
        <span className="text-[10px] tracking-[0.5em]">SCROLL</span>
      </div>
    </section>
  );
}
