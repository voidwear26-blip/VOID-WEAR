'use client';

import { AIAssistant } from '@/components/ai-assistant';
import { Sparkles, TrendingUp } from 'lucide-react';

export default function AssistantPage() {
  return (
    <div className="pt-48 pb-32 bg-transparent min-h-screen">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Sparkles className="w-4 h-4 text-white/40" />
              <span className="text-[10px] font-bold tracking-[0.8em] text-white/40 uppercase">NEURAL // STYLIST</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter glow-text uppercase leading-none text-white">
              Neural <br /> Uplink
            </h1>
            <p className="text-white/60 tracking-[0.3em] text-xs uppercase leading-relaxed font-light max-w-md">
              Communicate your aesthetic requirements. Our System Intelligence will curate the optimal assembly for your current mission.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 px-8 py-4 flex items-center gap-4 backdrop-blur-md">
            <TrendingUp className="w-4 h-4 text-white/40" />
            <span className="text-[9px] tracking-[0.3em] font-bold text-white/40 uppercase">LLM_INTERFACE: ACTIVE</span>
          </div>
        </div>

        <AIAssistant />
      </div>
    </div>
  );
}
