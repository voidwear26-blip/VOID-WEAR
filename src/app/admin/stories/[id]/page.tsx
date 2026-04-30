
"use client"

import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ChevronLeft, Sparkles, Loader2, Upload, Trash2, Save, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function EditStoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: storyId } = use(params);
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isAdmin = user?.email?.toLowerCase() === 'voidwear26@gmail.com';

  useEffect(() => {
    setMounted(true);
    if (mounted && !isUserLoading && !isAdmin) router.push('/');
  }, [mounted, isUserLoading, isAdmin, router]);

  const storyRef = useMemoFirebase(() => {
    if (!db || !storyId || !isAdmin) return null;
    return doc(db, 'stories', storyId);
  }, [db, storyId, isAdmin]);

  const { data: story, isLoading: storyLoading } = useDoc(storyRef);

  const [formData, setFormData] = useState({
    title: '',
    type: 'TREND',
    content: '',
    imageUrl: ''
  });

  const [linkInput, setLinkInput] = useState('');

  useEffect(() => {
    if (story) {
      setFormData({
        title: story.title || '',
        type: story.type || 'TREND',
        content: story.content || '',
        imageUrl: story.imageUrl || ''
      });
    }
  }, [story]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleLinkApply = () => {
    if (!linkInput.trim()) return;
    setFormData(prev => ({ ...prev, imageUrl: linkInput.trim() }));
    setLinkInput('');
    toast({ title: "ASSET LINKED", description: "REMOTE VISUAL UPLINK ESTABLISHED." });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !storyId || !isAdmin) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, 'stories', storyId), {
        ...formData,
        updatedAt: new Date().toISOString()
      });
      toast({ title: "TRANSMISSION UPDATED", description: "Narrative logs synchronized." });
      router.push('/admin/stories');
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "FAILURE", description: "Could not sync story updates." });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || isUserLoading || storyLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-white/20" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="space-y-4 mb-16">
          <Link href="/admin/stories" className="flex items-center gap-2 text-[10px] text-white/20 hover:text-white transition-colors uppercase tracking-widest mb-4 font-bold">
            <ChevronLeft className="w-3 h-3" />
            BACK TO STORIES
          </Link>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight glow-text uppercase leading-none">Edit Narrative</h1>
          <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">STORY_UID: {storyId}</p>
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
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">CATEGORY TYPE</label>
              <Select value={formData.type} onValueChange={val => setFormData({ ...formData, type: val })}>
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

          <div className="space-y-8">
            <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">VISUAL UPLINK</label>
            <div className="relative group w-full aspect-video bg-white/[0.02] border border-white/10 flex flex-col items-center justify-center overflow-hidden">
              {formData.imageUrl ? (
                <>
                  <Image src={formData.imageUrl} alt="Preview" fill className="object-cover grayscale" unoptimized />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button type="button" variant="ghost" size="icon" onClick={() => setFormData(p => ({ ...p, imageUrl: '' }))} className="text-white">
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                  <Upload className="w-8 h-8 text-white/10" />
                  <p className="text-[8px] tracking-[0.2em] text-white/20 uppercase font-black">DROP ASSET OR USE REMOTE UPLINK BELOW</p>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              )}
            </div>
            
            <div className="flex gap-4">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                <Input 
                  value={linkInput}
                  onChange={e => setLinkInput(e.target.value)}
                  placeholder="HTTPS://REMOTE-STORAGE.COM/ASSET.JPG"
                  className="bg-black/40 border-white/10 rounded-none h-14 pl-12 text-[10px] tracking-widest text-white"
                />
              </div>
              <Button 
                type="button" 
                onClick={handleLinkApply}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-none h-14 px-8 text-[10px] font-bold tracking-widest text-white"
              >
                LINK ASSET
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">NARRATIVE CONTENT</label>
            <Textarea 
              required
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              className="bg-black/40 border-white/10 rounded-none min-h-[150px] text-[10px] tracking-widest text-white leading-relaxed"
            />
          </div>

          <Button 
            disabled={loading}
            className="w-full bg-white text-black hover:bg-white/90 h-16 text-[10px] font-bold tracking-[0.5em] rounded-none shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all uppercase"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <>
                SYNC NARRATIVE UPDATES
                <Save className="ml-3 w-4 h-4" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
