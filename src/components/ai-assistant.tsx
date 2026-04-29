'use client';

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { generateOutfitSuggestion, StylistOutput } from '@/ai/flows/generate-outfit-suggestion';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Zap, Send, Info, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

export function AIAssistant() {
  const db = useFirestore();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StylistOutput | null>(null);

  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'products');
  }, [db]);

  const { data: products } = useCollection(productsQuery);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !products) return;

    setLoading(true);
    try {
      const catalog = products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        category: p.category,
        price: p.basePrice
      }));

      const suggestion = await generateOutfitSuggestion({
        userPrompt: prompt,
        catalog
      });

      setResult(suggestion);
      toast({ title: "ANALYSIS COMPLETE", description: "NEURAL SUGGESTION GENERATED." });
    } catch (err) {
      console.error(err);
      toast({ 
        variant: "destructive", 
        title: "UPLINK FAILURE", 
        description: "COULD NOT SYNTHESIZE NEURAL RESPONSE." 
      });
    } finally {
      setLoading(false);
    }
  };

  const recommendedProducts = products?.filter(p => result?.suggestedProductIds.includes(p.id)) || [];

  return (
    <div className="space-y-16">
      <div className="bg-white/[0.02] border border-white/10 p-12 backdrop-blur-xl relative overflow-hidden">
        <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-bold tracking-[0.5em] text-white/40 uppercase">INPUT AESTHETIC PROTOCOL</label>
            <div className="flex gap-4">
              <Input 
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="E.G. MINIMALIST SHELL FOR HIGH-DENSITY URBAN RAIN..."
                disabled={loading}
                className="bg-black/40 border-white/10 rounded-none h-16 text-xs tracking-widest focus:border-white/40 text-white uppercase placeholder:text-white/10"
              />
              <Button 
                disabled={loading || !prompt.trim()} 
                className="h-16 px-10 bg-white text-black hover:bg-white/90 rounded-none text-[10px] font-bold tracking-[0.4em] transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 opacity-40">
            {['Cyberpunk', 'Monochrome', 'Tactical', 'Urban Ninja'].map(tag => (
              <button 
                key={tag} 
                type="button"
                onClick={() => setPrompt(tag)}
                className="text-[8px] tracking-[0.3em] font-bold border border-white/20 px-4 py-2 hover:border-white transition-all uppercase"
              >
                {tag}
              </button>
            ))}
          </div>
        </form>
      </div>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-16"
          >
            <div className="grid lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-8">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold tracking-[0.5em] text-white/40 uppercase border-b border-white/10 pb-4 flex items-center gap-3">
                    <Info className="w-3 h-3" /> NEURAL NARRATIVE
                  </h3>
                  <p className="text-xl md:text-2xl font-light tracking-widest leading-relaxed uppercase text-white/90">
                    {result.narrative}
                  </p>
                </div>
                
                <div className="p-8 border border-white/5 bg-white/[0.01] space-y-4">
                  <div className="flex items-center gap-3 text-white/40">
                    <Zap className="w-4 h-4" />
                    <span className="text-[10px] tracking-[0.3em] uppercase font-bold">STYLIST ADVISORY</span>
                  </div>
                  <p className="text-[11px] text-white/60 tracking-widest leading-relaxed uppercase font-bold">
                    {result.stylingTips}
                  </p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-10 space-y-6 flex flex-col justify-center text-center backdrop-blur-md">
                 <ShoppingBag className="w-10 h-10 mx-auto text-white/20 mb-2" />
                 <p className="text-[9px] tracking-[0.4em] font-black uppercase text-white">SYSTEM_MATCH: {recommendedProducts.length} MODULES</p>
                 <div className="h-px bg-white/10 w-full" />
                 <p className="text-[8px] tracking-[0.2em] uppercase leading-relaxed text-white/40">
                    THESE MODULES HAVE BEEN IDENTIFIED AS THE PRIMARY ANCHORS FOR YOUR REQUESTED AESTHETIC.
                 </p>
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="text-[10px] font-bold tracking-[0.5em] text-white/40 uppercase">SUGGESTED ASSEMBLAGES</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {recommendedProducts.map(product => (
                  <ProductCard key={product.id} product={product as any} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!result && !loading && (
        <div className="py-48 text-center opacity-20 border border-dashed border-white/10 flex flex-col items-center justify-center gap-6">
          <Zap className="w-16 h-16 stroke-[0.5px]" />
          <p className="text-[10px] tracking-[1em] uppercase font-bold">AWAITING INPUT PARAMETERS</p>
        </div>
      )}
    </div>
  );
}
