'use client';

import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ChevronLeft, Save, Loader2, Upload, Trash2, Link as LinkIcon, Image as ImageIcon, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { compressImage } from '@/lib/image-utils';
import Image from 'next/image';

export default function AdvertisingControlPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [promoImages, setPromoImages] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState('');

  const configRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'app_config', 'global');
  }, [db]);

  const { data: config, isLoading: configLoading } = useDoc(configRef);

  useEffect(() => {
    if (config?.promoImages) {
      setPromoImages(config.promoImages);
    }
  }, [config]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 1920, 0.7);
        setPromoImages(prev => [...prev, compressed]);
        toast({ title: "ASSET COMPRESSED", description: "LOCAL BUFFER UPDATED." });
      } catch (err) {
        toast({ variant: "destructive", title: "UPLOAD_FAILURE" });
      }
    }
  };

  const handleLinkApply = () => {
    if (!linkInput.trim()) return;
    setPromoImages(prev => [...prev, linkInput.trim()]);
    setLinkInput('');
    toast({ title: "ASSET LINKED", description: "REMOTE UPLINK ESTABLISHED." });
  };

  const removeImage = (idx: number) => {
    setPromoImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!db) return;

    setLoading(true);
    const docRef = doc(db, 'app_config', 'global');
    try {
      await setDoc(docRef, { 
        promoImages,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      toast({
        title: "ADS DEPLOYED",
        description: "HOMEPAGE BANNERS UPDATED GLOBALLY.",
      });
    } catch (e) {
      toast({ variant: "destructive", title: "DEPLOYMENT_FAILURE" });
    } finally {
      setLoading(false);
    }
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
          <div className="flex items-center gap-6">
            <ImageIcon className="w-10 h-10 text-black/20" />
            <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none font-headline">Advertising</h1>
          </div>
        </div>

        <div className="bg-black/[0.01] border border-black/5 p-12 space-y-12 backdrop-blur-xl shadow-sm">
          <div className="space-y-8">
            <div className="border-b border-black/10 pb-4">
               <h3 className="text-[10px] font-bold tracking-[0.5em] text-black/60 uppercase">ACTIVE BANNERS</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {promoImages.map((url, idx) => (
                <div key={idx} className="relative aspect-video bg-black/5 border border-black/10 group overflow-hidden">
                  <Image src={url} alt={`Promo ${idx}`} fill className="object-cover grayscale" unoptimized />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="ghost" size="icon" onClick={() => removeImage(idx)} className="text-white hover:text-red-500">
                      <Trash2 className="w-6 h-6" />
                    </Button>
                  </div>
                  <div className="absolute bottom-4 left-4 bg-white/80 px-4 py-1 text-[8px] font-black tracking-widest uppercase">
                    SLIDE {idx + 1}
                  </div>
                </div>
              ))}
              {promoImages.length === 0 && (
                <div className="col-span-full py-20 border border-dashed border-black/10 flex flex-col items-center justify-center gap-4 opacity-40">
                  <ImageIcon className="w-12 h-12 stroke-[0.5px]" />
                  <p className="text-[10px] tracking-[1em] font-bold uppercase">NO BANNERS ACTIVE</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8 border-t border-black/10 pt-12">
            <h3 className="text-[10px] font-bold tracking-[0.5em] text-black/60 uppercase">ADD NEW ASSET</h3>
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="text-[9px] font-bold tracking-[0.4em] text-black/40 uppercase">REMOTE UPLINK</label>
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black/20" />
                    <Input 
                      value={linkInput}
                      onChange={e => setLinkInput(e.target.value)}
                      placeholder="HTTPS://STORAGE.COM/BANNER.JPG"
                      className="bg-white border-black/10 rounded-none h-14 pl-12 text-[10px] tracking-widest text-black"
                    />
                  </div>
                  <Button type="button" onClick={handleLinkApply} className="bg-black/5 border border-black/10 rounded-none h-14 px-8 text-[10px] font-bold tracking-widest">LINK</Button>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[9px] font-bold tracking-[0.4em] text-black/40 uppercase">LOCAL UPLOAD</label>
                <div className="relative">
                  <div className="border border-dashed border-black/10 h-14 flex items-center justify-center gap-4 group cursor-pointer hover:bg-black/5 transition-all">
                    <Upload className="w-4 h-4 text-black/20 group-hover:text-black transition-colors" />
                    <span className="text-[10px] font-bold tracking-widest text-black/40 group-hover:text-black">SELECT IMAGE</span>
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 border border-black/10 bg-black/5 space-y-4">
            <div className="flex items-center gap-3 text-black/40">
              <Sparkles className="w-4 h-4" />
              <span className="text-[9px] tracking-[0.3em] uppercase font-bold">SYSTEM ADVISORY</span>
            </div>
            <p className="text-[9px] text-black/60 tracking-widest leading-relaxed uppercase font-bold">
              BANNERS APPEAR ON THE HOMEPAGE IMMEDIATELY AFTER DEPLOYMENT. RECOMMENDED ASPECT RATIO IS 21:9 FOR OPTIMAL MOBILE AND DESKTOP RENDERING.
            </p>
          </div>

          <Button 
            disabled={loading}
            onClick={handleSubmit}
            className="w-full bg-black text-white hover:bg-black/90 h-20 text-[11px] font-black tracking-[0.6em] rounded-none shadow-sm transition-all"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>DEPLOY BANNERS TO HOME</>}
          </Button>
        </div>
      </div>
    </div>
  );
}
