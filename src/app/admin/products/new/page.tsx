
"use client"

import { useFirestore } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ChevronLeft, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function NewProductPage() {
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    basePrice: '',
    description: '',
    imageUrl: '',
    stockQuantity: '',
    color: '',
    sizes: ['S', 'M', 'L', 'XL'],
    details: ''
  });

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const handleSizeToggle = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) 
        ? prev.sizes.filter(s => s !== size) 
        : [...prev.sizes, size]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) {
      toast({ variant: "destructive", title: "SYSTEM ERROR", description: "DATABASE NOT INITIALIZED." });
      return;
    }

    setLoading(true);
    try {
      const detailsArray = formData.details.split('\n').filter(d => d.trim() !== '');
      
      const productData = {
        name: formData.name.toUpperCase(),
        category: formData.category.toUpperCase(),
        basePrice: parseFloat(formData.basePrice) || 0,
        description: formData.description,
        imageUrls: [formData.imageUrl || `https://picsum.photos/seed/${Math.random()}/800/1000`],
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        color: formData.color.toUpperCase(),
        sizes: formData.sizes,
        details: detailsArray,
        slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'products'), productData);

      toast({
        title: "MODULE INITIALIZED",
        description: "ASSEMBLAGE SUCCESSFULLY LOGGED IN CATALOGUE.",
      });
      router.push('/admin/products');
    } catch (e: any) {
      console.error('[PRODUCT_ADD_ERROR]', e);
      toast({
        variant: "destructive",
        title: "TRANSMISSION FAILED",
        description: e.message || "COULD NOT SYNC WITH DATABASE.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black">
        <Loader2 className="w-10 h-10 animate-spin text-white/20 mb-6" />
        <div className="text-[10px] tracking-[1em] text-white/40 uppercase font-bold text-center">INITIALIZING INTERFACE...</div>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="space-y-4 mb-16">
          <Link href="/admin/products" className="flex items-center gap-2 text-[10px] text-white/20 hover:text-white transition-colors uppercase tracking-widest mb-4 font-bold">
            <ChevronLeft className="w-3 h-3" />
            BACK TO ASSEMBLAGES
          </Link>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight glow-text uppercase leading-none text-white">Initialize Module</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/[0.02] border border-white/5 p-12 space-y-10 backdrop-blur-xl">
          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">MODULE NAME</label>
              <Input 
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest focus:border-white/40 text-white uppercase"
                placeholder="E.G. NEON JACKET"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">CATEGORY</label>
              <Input 
                required
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest focus:border-white/40 text-white uppercase"
                placeholder="E.G. OUTERWEAR"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">PRICE (₹ INR)</label>
              <Input 
                required
                type="number"
                value={formData.basePrice}
                onChange={e => setFormData({ ...formData, basePrice: e.target.value })}
                className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest focus:border-white/40 text-white"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">PRIMARY COLOR</label>
              <Input 
                required
                value={formData.color}
                onChange={e => setFormData({ ...formData, color: e.target.value })}
                className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest focus:border-white/40 text-white uppercase"
                placeholder="E.G. OBSIDIAN BLACK"
              />
            </div>
          </div>

          <div className="space-y-6">
            <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">AVAILABLE SIZES</label>
            <div className="flex flex-wrap gap-8">
              {availableSizes.map(size => (
                <div key={size} className="flex items-center space-x-3">
                  <Checkbox 
                    id={`size-${size}`} 
                    checked={formData.sizes.includes(size)}
                    onCheckedChange={() => handleSizeToggle(size)}
                    className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black"
                  />
                  <Label htmlFor={`size-${size}`} className="text-[10px] tracking-widest text-white/60 cursor-pointer font-bold">{size}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
             <div className="space-y-3">
                <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">VISUAL UPLINK (IMAGE URL)</label>
                <Input 
                  value={formData.imageUrl}
                  onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest focus:border-white/40 text-white"
                  placeholder="HTTPS://..."
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">STOCK QUANTITY</label>
                <Input 
                  required
                  type="number"
                  value={formData.stockQuantity}
                  onChange={e => setFormData({ ...formData, stockQuantity: e.target.value })}
                  className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest focus:border-white/40 text-white"
                  placeholder="0"
                />
              </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">NEURAL DESCRIPTION</label>
            <Textarea 
              required
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="bg-black/40 border-white/10 rounded-none min-h-[120px] text-[10px] tracking-widest focus:border-white/40 text-white"
              placeholder="ENTER PRODUCT STORY..."
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">SPECIFICATIONS (ONE PER LINE)</label>
            <Textarea 
              value={formData.details}
              onChange={e => setFormData({ ...formData, details: e.target.value })}
              className="bg-black/40 border-white/10 rounded-none min-h-[120px] text-[10px] tracking-widest focus:border-white/40 text-white"
              placeholder="WATERPROOF SHELL&#10;NEON FIBER OPTICS"
            />
          </div>

          <Button 
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black hover:bg-white/90 h-16 text-[10px] font-bold tracking-[0.5em] rounded-none shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-500"
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
