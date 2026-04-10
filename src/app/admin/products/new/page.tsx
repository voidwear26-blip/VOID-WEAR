
'use client';

import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ChevronLeft, Save, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export default function NewProductPage() {
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    basePrice: '',
    description: '',
    imageUrl: '',
    stockQuantity: '',
    details: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;

    setLoading(true);
    try {
      const detailsArray = formData.details.split('\n').filter(d => d.trim() !== '');
      
      await addDoc(collection(db, 'products'), {
        name: formData.name.toUpperCase(),
        category: formData.category.toUpperCase(),
        basePrice: parseFloat(formData.basePrice),
        description: formData.description,
        imageUrls: [formData.imageUrl || 'https://picsum.photos/seed/' + Math.random() + '/800/1000'],
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        details: detailsArray,
        slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      toast({
        title: "MODULE CREATED",
        description: "ASSEMBLAGE ADDED TO CATALOGUE.",
      });
      router.push('/admin/products');
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "SYSTEM ERROR",
        description: "FAILED TO INITIALIZE MODULE.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="space-y-4 mb-16">
          <Link href="/admin/products" className="flex items-center gap-2 text-[10px] text-white/20 hover:text-white transition-colors uppercase tracking-widest mb-4">
            <ChevronLeft className="w-3 h-3" />
            BACK TO ASSEMBLAGES
          </Link>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight glow-text uppercase leading-none">Initialize Module</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/[0.02] border border-white/5 p-12 space-y-10 backdrop-blur-xl">
          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">MODULE NAME</label>
              <Input 
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest focus:border-white/40"
                placeholder="E.G. VOID NEON JACKET"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">CATEGORY</label>
              <Input 
                required
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest focus:border-white/40"
                placeholder="E.G. OUTERWEAR"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">BASE PRICE ($)</label>
              <Input 
                required
                type="number"
                value={formData.basePrice}
                onChange={e => setFormData({ ...formData, basePrice: e.target.value })}
                className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest focus:border-white/40"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">STOCK QUANTITY</label>
              <Input 
                required
                type="number"
                value={formData.stockQuantity}
                onChange={e => setFormData({ ...formData, stockQuantity: e.target.value })}
                className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest focus:border-white/40"
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">VISUAL UPLINK (IMAGE URL)</label>
            <Input 
              value={formData.imageUrl}
              onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
              className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest focus:border-white/40"
              placeholder="HTTPS://..."
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">NEURAL DESCRIPTION</label>
            <Textarea 
              required
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="bg-black/40 border-white/10 rounded-none min-h-[120px] text-[10px] tracking-widest focus:border-white/40"
              placeholder="ENTER PRODUCT STORY..."
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">SPECIFICATIONS (ONE PER LINE)</label>
            <Textarea 
              value={formData.details}
              onChange={e => setFormData({ ...formData, details: e.target.value })}
              className="bg-black/40 border-white/10 rounded-none min-h-[120px] text-[10px] tracking-widest focus:border-white/40"
              placeholder="WATERPROOF SHELL&#10;NEON FIBER OPTICS"
            />
          </div>

          <Button 
            disabled={loading}
            className="w-full bg-white text-black hover:bg-white/90 h-16 text-[10px] font-bold tracking-[0.5em] rounded-none shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <>
                INITIALIZE MODULE
                <Sparkles className="ml-3 w-4 h-4" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
