'use client';

import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ChevronLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;

    setLoading(true);
    const docRef = doc(db, 'app_config', 'global');
    const updateData = {
      ...formData,
      heroTagline: 'EMBRACE THE UNKNOWN',
      updatedAt: new Date().toISOString()
    };

    setDoc(docRef, updateData, { merge: true })
      .then(() => {
        toast({
          title: "CONTENT DEPLOYED",
          description: "BRAND INTERFACE UPDATED GLOBALLY.",
        });
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: updateData,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (configLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-black/20" />
      </div>
    );
  }

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen text-black">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="space-y-4 mb-16">
          <Link href="/admin" className="flex items-center gap-2 text-[10px] text-black/60 hover:text-black transition-all hover:scale-105 uppercase tracking-widest mb-4 font-bold">
            <ChevronLeft className="w-3 h-3" />
            BACK TO SYSTEM
          </Link>
          <div className="flex items-center">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none text-black font-headline">Brand Control</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-black/[0.01] border border-black/10 p-12 space-y-10 backdrop-blur-xl shadow-sm">
          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.4em] text-black/60 uppercase">HERO PRIMARY TITLE</label>
              <Input 
                required
                value={formData.heroTitle}
                onChange={e => setFormData({ ...formData, heroTitle: e.target.value.toUpperCase() })}
                className="bg-black/5 border-black/10 rounded-none h-14 text-[10px] tracking-widest focus:border-black/40 text-black"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.4em] text-black/60 uppercase">ACTIVE SEASON</label>
              <Input 
                required
                value={formData.activeSeason}
                onChange={e => setFormData({ ...formData, activeSeason: e.target.value.toUpperCase() })}
                className="bg-black/5 border-black/10 rounded-none h-14 text-[10px] tracking-widest focus:border-black/40 text-black"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.4em] text-black/60 uppercase">HERO SUBTITLE</label>
              <Input 
                required
                value={formData.heroSubtitle}
                onChange={e => setFormData({ ...formData, heroSubtitle: e.target.value.toUpperCase() })}
                className="bg-black/5 border-black/10 rounded-none h-14 text-[10px] tracking-widest focus:border-black/40 text-black"
              />
            </div>
            <div className="space-y-3 opacity-50">
              <label className="text-[10px] font-bold tracking-[0.4em] text-black/60 uppercase">HERO TAGLINE (LOCKED)</label>
              <Input 
                readOnly
                value="EMBRACE THE UNKNOWN"
                className="bg-black/5 border-black/10 rounded-none h-14 text-[10px] tracking-widest text-black/40 cursor-not-allowed"
              />
            </div>
          </div>

          <Button 
            disabled={loading}
            className="w-full bg-black text-white hover:bg-black/90 h-16 text-[10px] font-bold tracking-[0.5em] rounded-none shadow-sm transition-all"
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
