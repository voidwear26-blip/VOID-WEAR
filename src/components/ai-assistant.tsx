"use client"

import { useState } from 'react';
import { generateOutfitSuggestion, GenerateOutfitSuggestionOutput } from '@/ai/flows/generate-outfit-suggestion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Loader2, ArrowRight, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export function AIAssistant() {
  const [description, setDescription] = useState('');
  const [suggestion, setSuggestion] = useState<GenerateOutfitSuggestionOutput | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    try {
      const result = await generateOutfitSuggestion({ styleDescription: description });
      setSuggestion(result);
    } catch (error) {
      console.error('Failed to generate suggestion', error);
    } finally {
      setLoading(false);
    }
  };

  const iconMotionProps = {
    whileHover: { scale: 1.2, filter: "drop-shadow(0 0 10px rgba(255, 255, 255, 0.8))" },
    whileTap: { scale: 0.9 },
    transition: { type: "spring", stiffness: 400, damping: 10 }
  };

  return (
    <section className="py-24 bg-transparent border-y border-white/5 overflow-hidden">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold tracking-[0.5em] text-white/40 uppercase">
                <motion.div {...iconMotionProps}>
                  <Sparkles className="w-4 h-4" />
                </motion.div>
                <span>AI STYLE LAB / NEURAL ENGINE</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight glow-text">
                DEFINE YOUR <br /> DIGITAL AVATAR
              </h2>
              <p className="text-white/60 tracking-widest text-sm leading-relaxed max-w-md">
                INPUT YOUR VIBE, OCCASION, OR DESIRED AESTHETIC. OUR NEURAL NETWORK WILL CURATE THE PERFECT VOID ASSEMBLAGE.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="relative group">
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="E.G. FUTURISTIC CYBERPUNK FOR NIGHT CLUB"
                className="bg-white/5 border-white/10 rounded-none h-16 pl-6 pr-20 text-xs tracking-widest focus-visible:ring-0 focus-visible:border-white/40 placeholder:text-white/20"
              />
              <Button 
                type="submit" 
                disabled={loading}
                className="absolute right-2 top-2 h-12 w-12 bg-white text-black hover:bg-white/90 rounded-none"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <motion.div {...iconMotionProps}>
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                )}
              </Button>
            </form>
          </div>

          <div className="relative min-h-[400px] flex items-center justify-center">
            {suggestion ? (
              <div className="bg-white/5 p-12 border border-white/10 space-y-8 animate-in fade-in zoom-in duration-700 relative z-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.5em] text-white/40">
                    <motion.div {...iconMotionProps}>
                      <Zap className="w-3 h-3" />
                    </motion.div>
                    <span>SUGGESTED ASSEMBLY</span>
                  </div>
                  <p className="text-sm tracking-widest leading-relaxed text-white/80 italic">
                    "{suggestion.outfitDescription}"
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold tracking-[0.5em] text-white/40">REQUIRED MODULES</h4>
                  <div className="flex flex-wrap gap-3">
                    {suggestion.suggestedItems.map((item, idx) => (
                      <span key={idx} className="text-[10px] bg-white/10 px-4 py-2 border border-white/5 tracking-widest">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <Button variant="outline" className="w-full border-white/20 text-[10px] py-6 hover:bg-white hover:text-black tracking-[0.3em] rounded-none">
                  VIEW FULL COLLECTION
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-6 opacity-20">
                <div className="w-32 h-32 mx-auto border-2 border-dashed border-white rounded-full flex items-center justify-center animate-spin-slow">
                  <motion.div {...iconMotionProps}>
                    <Sparkles className="w-8 h-8" />
                  </motion.div>
                </div>
                <p className="text-[10px] tracking-[0.8em]">AWAITING NEURAL INPUT</p>
              </div>
            )}
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] pointer-events-none"></div>
          </div>
        </div>
      </div>
    </section>
  );
}