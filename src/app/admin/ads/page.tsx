'use client';

import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ChevronLeft, Save, Loader2, Upload, Trash2, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { compressImage } from '@/lib/image-utils';
import Image from 'next/image';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

type Banner = {
  url: string;
  title: string;
  subtitle: string;
  alignment: 'left' | 'center' | 'right';
  textColor?: string;
};

export default function AdvertisingControlPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  
  const [newBanner, setNewBanner] = useState<Banner>({
    url: '',
    title: '',
    subtitle: '',
    alignment: 'center',
    textColor: '#FFFFFF'
  });

  const configRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'app_config', 'global');
  }, [db]);

  const { data: config, isLoading: configLoading } = useDoc(configRef);

  useEffect(() => {
    if (config?.promoBanners) {
      setBanners(config.promoBanners);
    }
  }, [config]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 1920, 0.7);
        setNewBanner(prev => ({ ...prev, url: compressed }));
        toast({ title: "ASSET COMPRESSED", description: "READY FOR DEPLOYMENT." });
      } catch (err) {
        toast({ variant: "destructive", title: "UPLOAD_FAILURE" });
      }
    }
  };

  const addBanner = () => {
    if (!newBanner.url) {
      toast({ variant: "destructive", title: "INCOMPLETE", description: "IMAGE URL IS REQUIRED." });
      return;
    }
    setBanners(prev => [...prev, newBanner]);
    setNewBanner({ url: '', title: '', subtitle: '', alignment: 'center', textColor: '#FFFFFF' });
    toast({ title: "BANNER ADDED", description: "LOCAL BUFFER UPDATED." });
  };

  const removeBanner = (idx: number) => {
    setBanners(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    if (!db) return;

    setLoading(true);
    const docRef = doc(db, 'app_config', 'global');
    const updateData = { 
      promoBanners: banners,
      updatedAt: new Date().toISOString()
    };

    setDoc(docRef, updateData, { merge: true })
      .then(() => {
        toast({
          title: "ADS DEPLOYED",
          description: "HOMEPAGE BANNERS UPDATED GLOBALLY.",
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
    <div className="pt-40 pb-32 bg-transparent min-h-screen text-black font-body">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="space-y-4 mb-16">
          <Link href="/admin" className="flex items-center gap-2 text-[10px] text-black/60 hover:text-black transition-all hover:scale-105 uppercase tracking-widest mb-4 font-bold">
            <ChevronLeft className="w-3 h-3" />
            BACK TO SYSTEM
          </Link>
          <div className="flex items-center">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none font-headline text-black">Advertising</h1>
          </div>
        </div>

        <div className="bg-black/[0.01] border border-black/10 p-12 space-y-16 backdrop-blur-xl shadow-sm">
          <div className="space-y-8">
            <div className="border-b border-black/10 pb-4">
               <h3 className="text-[10px] font-bold tracking-[0.5em] text-black/60 uppercase">ACTIVE BANNERS</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {banners.map((banner, idx) => (
                <div key={idx} className="relative aspect-video bg-black/5 border border-black/10 group overflow-hidden">
                  <Image src={banner.url} alt={`Promo ${idx}`} fill className="object-cover" unoptimized />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center p-6 text-center space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: banner.textColor || '#FFFFFF' }}>{banner.title || 'NO TITLE'}</p>
                      <p className="text-[8px] tracking-[0.2em] uppercase opacity-70" style={{ color: banner.textColor || '#FFFFFF' }}>{banner.alignment.toUpperCase()} ALIGNED</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeBanner(idx)} className="text-white hover:text-red-500">
                      <Trash2 className="w-6 h-6" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-12 border-t border-black/10 pt-16">
            <h3 className="text-[10px] font-bold tracking-[0.5em] text-black/60 uppercase">CREATE CAMPAIGN ASSET</h3>
            <div className="grid gap-10">
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[9px] font-bold tracking-[0.4em] text-black/60 uppercase">MAIN HEADLINE</label>
                  <Input 
                    value={newBanner.title}
                    onChange={e => setNewBanner({ ...newBanner, title: e.target.value.toUpperCase() })}
                    placeholder="E.G. SEASON 01 ARRIVAL"
                    className="bg-white border-black/10 rounded-none h-14 text-[10px] tracking-widest text-black"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-bold tracking-[0.4em] text-black/60 uppercase">SUBTITLE / TAGLINE</label>
                  <Input 
                    value={newBanner.subtitle}
                    onChange={e => setNewBanner({ ...newBanner, subtitle: e.target.value.toUpperCase() })}
                    placeholder="E.G. 20% CREDITS RECLAIMED"
                    className="bg-white border-black/10 rounded-none h-14 text-[10px] tracking-widest text-black"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-10">
                <div className="space-y-3 md:col-span-1">
                  <label className="text-[9px] font-bold tracking-[0.4em] text-black/60 uppercase">ASSET SOURCE (URL OR UPLOAD)</label>
                  <div className="flex gap-4">
                    <Input 
                      value={newBanner.url}
                      onChange={e => setNewBanner({ ...newBanner, url: e.target.value })}
                      placeholder="URL..."
                      className="bg-white border-black/10 rounded-none h-14 text-[10px] tracking-widest text-black"
                    />
                    <div className="relative">
                      <Button type="button" className="h-14 bg-black/5 border border-black/10 hover:bg-black hover:text-white rounded-none px-4 text-[9px] font-black tracking-widest text-black transition-all">UPLOAD</Button>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-bold tracking-[0.4em] text-black/60 uppercase">TEXT ALIGNMENT</label>
                  <Select value={newBanner.alignment} onValueChange={(val: any) => setNewBanner({ ...newBanner, alignment: val })}>
                    <SelectTrigger className="h-14 bg-white border-black/10 rounded-none text-[10px] tracking-widest uppercase text-black font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-black/10 text-black rounded-none">
                      <SelectItem value="left" className="text-[10px] uppercase font-bold"><div className="flex items-center gap-2"><AlignLeft className="w-3 h-3" /> LEFT</div></SelectItem>
                      <SelectItem value="center" className="text-[10px] uppercase font-bold"><div className="flex items-center gap-2"><AlignCenter className="w-3 h-3" /> CENTER</div></SelectItem>
                      <SelectItem value="right" className="text-[10px] uppercase font-bold"><div className="flex items-center gap-2"><AlignRight className="w-3 h-3" /> RIGHT</div></SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-bold tracking-[0.4em] text-black/60 uppercase">TEXT COLOR</label>
                  <div className="flex gap-3">
                    <Input 
                      type="color"
                      value={newBanner.textColor}
                      onChange={e => setNewBanner({ ...newBanner, textColor: e.target.value })}
                      className="h-14 w-14 p-1 border-black/10 rounded-none cursor-pointer"
                    />
                    <Input 
                      value={newBanner.textColor}
                      onChange={e => setNewBanner({ ...newBanner, textColor: e.target.value.toUpperCase() })}
                      className="flex-1 bg-white border-black/10 rounded-none h-14 text-[10px] tracking-widest text-black uppercase"
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>
              </div>

              <Button 
                onClick={addBanner}
                className="bg-black/5 hover:bg-black hover:text-white border border-black/10 rounded-none h-16 text-[10px] font-black tracking-[0.4em] uppercase transition-all"
              >
                ADD TO BUFFER
              </Button>
            </div>
          </div>

          <Button 
            disabled={loading}
            onClick={handleSubmit}
            className="w-full bg-black text-white hover:bg-black/90 h-24 text-[12px] font-black tracking-[0.8em] rounded-none shadow-xl transition-all uppercase"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>DEPLOY ALL BANNERS</>}
          </Button>
        </div>
      </div>
    </div>
  );
}
