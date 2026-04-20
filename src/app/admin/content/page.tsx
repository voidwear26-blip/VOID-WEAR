'use client';

import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ChevronLeft, Save, Loader2, Sparkles, Layout } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function BrandControlPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const configRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'app_config', 'global');
  }, [db]);

  const { data: config, isLoading: configLoading } = useDoc(configRef);

  const [formData, setFormData] = useState({
    heroTitle: 'VOID WEAR',
    heroSubtitle: 'AUTHENTICATED',
    heroTagline: 'EMBRACE THE UNKNOWN',
    activeSeason: 'SEASON 01',
  });

  useEffect(() => {
    if (config) {
      setFormData({
        heroTitle: config.heroTitle || 'VOID WEAR',
        heroSubtitle: config.heroSubtitle || 'AUTHENTICATED',
        heroTagline: config.heroTagline || 'EMBRACE THE UNKNOWN',
        activeSeason: config.activeSeason || 'SEASON 01',
      });
    }
  }, [config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;

    setLoading(true);
    try {
      await setDoc(doc(db, 'app_config', 'global'), {
        ...formData,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      toast({
        title: "CONTENT DEPLOYED",
        description: "BRAND INTERFACE UPDATED GLOBALLY.",
      });
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "DEPLOYMENT FAILED",
        description: "COULD NOT SYNC CONTENT CHANGES.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (configLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white/60" />
      </div>
    );
  }

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="space-y-4 mb-16">
          <Link href="/admin" className="flex items-center gap-2 text-[10px] text-white/60 hover:text-white transition-colors uppercase tracking-widest mb-4 font-bold">
            <ChevronLeft className="w-3 h-3" />
            BACK TO SYSTEM
          </Link>
          <div className="flex items-center gap-6">
            <Layout className="w-10 h-10 text-white/60" />
            <h1 className="text-4xl md:text-5xl font-black tracking-tight glow-text uppercase leading-none text-white">Brand Control</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/[0.02] border border-white/10 p-12 space-y-10 backdrop-blur-xl">
          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/70 uppercase">HERO PRIMARY TITLE</label>
              <Input 
                required
                value={formData.heroTitle}
                onChange={e => setFormData({ ...formData, heroTitle: e.target.value.toUpperCase() })}
                className="bg-black/40 border-white/20 rounded-none h-14 text-[10px] tracking-widest focus:border-white/60 text-white"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/70 uppercase">ACTIVE SEASON</label>
              <Input 
                required
                value={formData.activeSeason}
                onChange={e => setFormData({ ...formData, activeSeason: e.target.value.toUpperCase() })}
                className="bg-black/40 border-white/20 rounded-none h-14 text-[10px] tracking-widest focus:border-white/60 text-white"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/70 uppercase">HERO SUBTITLE</label>
              <Input 
                required
                value={formData.heroSubtitle}
                onChange={e => setFormData({ ...formData, heroSubtitle: e.target.value.toUpperCase() })}
                className="bg-black/40 border-white/20 rounded-none h-14 text-[10px] tracking-widest focus:border-white/60 text-white"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/70 uppercase">HERO TAGLINE</label>
              <Input 
                required
                value={formData.heroTagline}
                onChange={e => setFormData({ ...formData, heroTagline: e.target.value.toUpperCase() })}
                className="bg-black/40 border-white/20 rounded-none h-14 text-[10px] tracking-widest focus:border-white/60 text-white"
              />
            </div>
          </div>

          <div className="p-8 border border-white/10 bg-white/[0.01] space-y-4">
            <div className="flex items-center gap-3 text-white/60">
              <Sparkles className="w-4 h-4" />
              <span className="text-[9px] tracking-[0.3em] uppercase font-bold">SYSTEM ADVISORY</span>
            </div>
            <p className="text-[9px] text-white/60 tracking-widest leading-relaxed uppercase font-bold">
              CHANGES MADE HERE ARE PUSHED IN REAL-TIME TO THE PRIMARY UPLINK (HOMEPAGE). ENSURE ALL BRAND ASSETS ALIGN WITH THE VOID WEAR AESTHETIC BEFORE DEPLOYMENT.
            </p>
          </div>

          <Button 
            disabled={loading}
            className="w-full bg-white text-black hover:bg-white/90 h-16 text-[10px] font-bold tracking-[0.5em] rounded-none shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <>
                DEPLOY CONTENT UPDATES
                <Save className="ml-3 w-4 h-4" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
