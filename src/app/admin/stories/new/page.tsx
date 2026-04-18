"use client"

import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ChevronLeft, Sparkles, Loader2, Upload, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function NewStoryPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isAdmin = user?.email?.toLowerCase() === 'voidwear26@gmail.com';

  useEffect(() => {
    setMounted(true);
    if (!isUserLoading && !isAdmin) router.push('/');
  }, [isUserLoading, isAdmin, router]);

  const [formData, setFormData] = useState({
    title: '',
    type: 'TREND',
    content: '',
    imageUrl: ''
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !isAdmin) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'stories'), {
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      toast({ title: "TRANSMISSION LIVE", description: "Story published to the void." });
      router.push('/admin/stories');
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "FAILURE", description: "Could not sync story." });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || isUserLoading || !isAdmin) return null;

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="space-y-4 mb-16">
          <Link href="/admin/stories" className="flex items-center gap-2 text-[10px] text-white/20 hover:text-white transition-colors uppercase tracking-widest mb-4">
            <ChevronLeft className="w-3 h-3" />
            BACK TO STORIES
          </Link>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight glow-text uppercase leading-none">Initialize Story</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/[0.02] border border-white/5 p-12 space-y-10 backdrop-blur-xl">
          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">STORY TITLE</label>
              <Input 
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value.toUpperCase() })}
                className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest text-white"
                placeholder="E.G. SUMMER DROP"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">CATEGORY TYPE</label>
              <Select defaultValue={formData.type} onValueChange={val => setFormData({ ...formData, type: val })}>
                <SelectTrigger className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/10 text-white rounded-none">
                  <SelectItem value="TREND" className="text-[10px] tracking-widest">TREND</SelectItem>
                  <SelectItem value="OFFER" className="text-[10px] tracking-widest">OFFER</SelectItem>
                  <SelectItem value="NEW ARRIVAL" className="text-[10px] tracking-widest">NEW ARRIVAL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-6">
            <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">VISUAL UPLINK (OPTIONAL)</label>
            <div className="relative group w-full aspect-video bg-white/[0.02] border border-white/10 flex flex-col items-center justify-center cursor-pointer overflow-hidden">
              {formData.imageUrl ? (
                <>
                  <Image src={formData.imageUrl} alt="Preview" fill className="object-cover grayscale" unoptimized />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="ghost" size="icon" onClick={() => setFormData(p => ({ ...p, imageUrl: '' }))} className="text-white">
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-white/20 mb-2" />
                  <span className="text-[8px] tracking-[0.2em] text-white/20 uppercase font-bold">SELECT IMAGE FILE</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">NARRATIVE CONTENT</label>
            <Textarea 
              required
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              className="bg-black/40 border-white/10 rounded-none min-h-[150px] text-[10px] tracking-widest text-white"
              placeholder="DETAILS OF THE UPDATE..."
            />
          </div>

          <Button 
            disabled={loading}
            className="w-full bg-white text-black hover:bg-white/90 h-16 text-[10px] font-bold tracking-[0.5em] rounded-none shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <>
                PUBLISH TRANSMISSION
                <Sparkles className="ml-3 w-4 h-4" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}