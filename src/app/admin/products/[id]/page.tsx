
'use client';

import { useFirestore, useDoc, useMemoFirebase, useUser } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ChevronLeft, Save, Loader2, Upload, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import Image from 'next/image';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isAdmin = user?.email?.toLowerCase() === 'voidwear26@gmail.com';

  useEffect(() => {
    setMounted(true);
    if (!isUserLoading && !isAdmin) {
      router.push('/');
    }
  }, [isUserLoading, isAdmin, router]);

  const productRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, 'products', id);
  }, [db, id]);

  const { data: product, isLoading: productLoading } = useDoc(productRef);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    basePrice: '',
    description: '',
    imageUrl: '',
    color: '',
    details: ''
  });

  const [stockBySize, setStockBySize] = useState<{ [key: string]: number }>({
    'XS': 0, 'S': 0, 'M': 0, 'L': 0, 'XL': 0, 'XXL': 0
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category || '',
        basePrice: product.basePrice?.toString() || '',
        description: product.description || '',
        imageUrl: product.imageUrls?.[0] || '',
        color: product.color || '',
        details: product.details?.join('\n') || ''
      });
      if (product.stockBySize) {
        setStockBySize({
          'XS': product.stockBySize.XS || 0,
          'S': product.stockBySize.S || 0,
          'M': product.stockBySize.M || 0,
          'L': product.stockBySize.L || 0,
          'XL': product.stockBySize.XL || 0,
          'XXL': product.stockBySize.XXL || 0
        });
      }
    }
  }, [product]);

  const totalStock = Object.values(stockBySize).reduce((a, b) => a + (b || 0), 0);

  const handleSizeStockChange = (size: string, value: string) => {
    const num = parseInt(value) || 0;
    setStockBySize(prev => ({ ...prev, [size]: Math.max(0, num) }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !id || !isAdmin) return;

    setLoading(true);
    try {
      const detailsArray = formData.details.split('\n').filter(d => d.trim() !== '');
      
      await updateDoc(doc(db, 'products', id), {
        name: formData.name.toUpperCase(),
        category: formData.category.toUpperCase(),
        basePrice: parseFloat(formData.basePrice),
        description: formData.description,
        imageUrls: [formData.imageUrl],
        color: formData.color.toUpperCase(),
        stockBySize: stockBySize,
        stockQuantity: totalStock,
        sizes: Object.keys(stockBySize).filter(size => stockBySize[size] > 0),
        details: detailsArray,
        updatedAt: new Date().toISOString()
      });

      toast({
        title: "MODULE UPDATED",
        description: "ASSEMBLAGE CONFIGURATION SAVED.",
      });
      router.push('/admin/products');
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "SYSTEM ERROR",
        description: "FAILED TO SYNC MODULE CHANGES.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (productLoading || isUserLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white/20" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="space-y-4 mb-16">
          <Link href="/admin/products" className="flex items-center gap-2 text-[10px] text-white/20 hover:text-white transition-colors uppercase tracking-widest mb-4">
            <ChevronLeft className="w-3 h-3" />
            BACK TO ASSEMBLAGES
          </Link>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight glow-text uppercase leading-none">Reconfigure Module</h1>
          <p className="text-[10px] text-white/20 font-mono">UID: {id}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/[0.02] border border-white/5 p-12 space-y-12 backdrop-blur-xl">
          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">MODULE NAME</label>
              <Input 
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest focus:border-white/40"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">CATEGORY</label>
              <Input 
                required
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest focus:border-white/40"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">BASE PRICE (₹)</label>
              <Input 
                required
                type="number"
                value={formData.basePrice}
                onChange={e => setFormData({ ...formData, basePrice: e.target.value })}
                className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest focus:border-white/40"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">COLOR</label>
              <Input 
                required
                value={formData.color}
                onChange={e => setFormData({ ...formData, color: e.target.value })}
                className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest focus:border-white/40"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">STOCK CONFIGURATION</label>
              <span className="text-[10px] font-bold tracking-[0.2em] text-white">TOTAL ASSEMBLAGE: {totalStock}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
              {Object.keys(stockBySize).map(size => (
                <div key={size} className="space-y-2">
                  <Label className="text-[9px] tracking-widest text-white/40 font-bold uppercase">{size}</Label>
                  <Input 
                    type="number"
                    value={stockBySize[size]}
                    onChange={e => handleSizeStockChange(size, e.target.value)}
                    className="bg-black/40 border-white/10 rounded-none h-10 text-[10px] tracking-widest text-white focus:border-white/40"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">VISUAL UPLINK (IMAGE)</label>
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="relative group w-full md:w-48 aspect-[3/4] bg-white/[0.02] border border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-white/40 transition-all overflow-hidden">
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
                    <span className="text-[8px] tracking-[0.2em] text-white/20 uppercase font-bold text-center px-4">LOCAL STORAGE UPLOAD</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </>
                )}
              </div>
              <div className="flex-1 space-y-4 w-full">
                <Input 
                  value={formData.imageUrl.startsWith('data:') ? '' : formData.imageUrl}
                  onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="bg-black/40 border-white/10 rounded-none h-12 text-[10px] tracking-widest focus:border-white/40 text-white"
                  placeholder="OR PASTE REMOTE URL (HTTPS://...)"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">NEURAL DESCRIPTION</label>
            <Textarea 
              required
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="bg-black/40 border-white/10 rounded-none min-h-[120px] text-[10px] tracking-widest focus:border-white/40"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">SPECIFICATIONS (ONE PER LINE)</label>
            <Textarea 
              value={formData.details}
              onChange={e => setFormData({ ...formData, details: e.target.value })}
              className="bg-black/40 border-white/10 rounded-none min-h-[120px] text-[10px] tracking-widest focus:border-white/40"
            />
          </div>

          <Button 
            disabled={loading}
            className="w-full bg-white text-black hover:bg-white/90 h-16 text-[10px] font-bold tracking-[0.5em] rounded-none shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <>
                SYNC MODULE CHANGES
                <Save className="ml-3 w-4 h-4" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
