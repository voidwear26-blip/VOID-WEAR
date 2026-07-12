"use client"

import { useFirestore, useUser, useMemoFirebase, useDoc } from '@/firebase';
import { collection, addDoc, doc } from 'firebase/firestore';
import { ChevronLeft, Sparkles, Loader2, Upload, Trash2, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { compressImage } from '@/lib/image-utils';
import Image from 'next/image';

export default function NewStoryPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);

  const isAdmin = useMemo(() => {
    if (isUserLoading || !user) return false;
    return user.email?.toLowerCase() === 'voidwear26@gmail.com' || 
           user.uid === 'A9vsqn10oddfmouKiKjWpTcFqZB2' ||
           profile?.role === 'ADMIN';
  }, [user, isUserLoading, profile]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = useState({
    title: '',
    type: 'TREND',
    content: '',
    imageUrl: ''
  });

  const [linkInput, setLinkInput] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file);
        setFormData(prev => ({ ...prev, imageUrl: compressed }));
      } catch (err) {
        toast({ variant: "destructive", title: "UPLOAD ERROR" });
      }
    }
  };

  const handleLinkApply = () => {
    if (!linkInput.trim()) return;
    setFormData(prev => ({ ...prev, imageUrl: linkInput.trim() }));
    setLinkInput('');
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
      toast({ title: "STORY PUBLISHED" });
      router.push('/admin/stories');
    } catch (e) {
      toast({ variant: "destructive", title: "SYSTEM ERROR" });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || isUserLoading || isProfileLoading) return null;
  if (!isAdmin) return null;

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen text-black font-body">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="space-y-4 mb-16">
          <Link href="/admin/stories" className="flex items-center gap-2 text-[10px] text-black/60 hover:text-black transition-colors uppercase tracking-widest mb-4">
            <ChevronLeft className="w-3 h-3" />
            BACK TO STORIES
          </Link>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none text-black font-headline">New Story</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-black/[0.01] border border-black/5 p-12 space-y-10 backdrop-blur-xl shadow-sm">
          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.4em] text-black/60 uppercase">TITLE</label>
              <Input 
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value.toUpperCase() })}
                className="bg-white border-black/10 rounded-none h-14 text-[10px] tracking-widest text-black"
                placeholder="E.G. NEW COLLECTION"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.4em] text-black/60 uppercase">TYPE</label>
              <Select defaultValue={formData.type} onValueChange={val => setFormData({ ...formData, type: val })}>
                <SelectTrigger className="bg-white border-black/10 rounded-none h-14 text-[10px] tracking-widest text-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-black/10 text-black rounded-none">
                  <SelectItem value="TREND" className="text-[10px] tracking-widest">TREND</SelectItem>
                  <SelectItem value="OFFER" className="text-[10px] tracking-widest">OFFER</SelectItem>
                  <SelectItem value="NEW ARRIVAL" className="text-[10px] tracking-widest">NEW ARRIVAL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-8">
            <label className="text-[10px] font-bold tracking-[0.4em] text-black/60 uppercase">IMAGE UPLINK</label>
            
            <div className="relative group w-full aspect-video bg-black/[0.02] border border-black/5 flex flex-col items-center justify-center overflow-hidden">
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
                  <Upload className="w-8 h-8 text-black/20" />
                  <p className="text-[8px] tracking-[0.2em] text-black/40 uppercase font-black">UPLOAD LOCAL ASSET OR USE URL BELOW</p>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black/20" />
                <Input 
                  value={linkInput}
                  onChange={e => setLinkInput(e.target.value)}
                  placeholder="HTTPS://IMAGE-URL.COM/ASSET.JPG"
                  className="bg-white border-black/10 rounded-none h-14 pl-12 text-[10px] tracking-widest text-black"
                />
              </div>
              <Button 
                type="button" 
                onClick={handleLinkApply}
                className="bg-black/5 hover:bg-black/10 border border-black/10 rounded-none h-14 px-8 text-[10px] font-bold tracking-widest text-black"
              >
                LINK URL
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold tracking-[0.4em] text-black/60 uppercase">STORY CONTENT</label>
            <Textarea 
              required
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              className="bg-white border-black/10 rounded-none min-h-[150px] text-[10px] tracking-widest text-black"
            />
          </div>

          <Button 
            disabled={loading}
            className="w-full bg-black text-white hover:bg-black/90 h-16 text-[10px] font-bold tracking-[0.5em] rounded-none shadow-sm transition-all uppercase"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <>
                PUBLISH STORY
                <Sparkles className="ml-3 w-4 h-4" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
