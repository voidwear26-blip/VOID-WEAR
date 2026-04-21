'use client';

import { useFirestore, useDoc, useMemoFirebase, useUser, useCollection } from '@/firebase';
import { doc, updateDoc, collectionGroup, query, where } from 'firebase/firestore';
import { ChevronLeft, Save, Loader2, Upload, Trash2, TrendingUp, DollarSign, Users, ShoppingBag, Calendar, Plus, X, Info } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';

type StockMatrix = { [size: string]: { [color: string]: number; }; };

export default function ProductAdminDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isAdmin = !isUserLoading && (
    user?.email === 'voidwear26@gmail.com' || 
    user?.uid === 'A9vsqn10oddfmouKiKjWpTcFqZB2'
  );

  useEffect(() => {
    setMounted(true);
    if (mounted && !isUserLoading && !isAdmin) router.push('/');
  }, [mounted, isUserLoading, isAdmin, router]);

  const productRef = useMemoFirebase(() => {
    if (!db || !id || !isAdmin) return null;
    return doc(db, 'products', id);
  }, [db, id, isAdmin]);

  const { data: product, isLoading: productLoading } = useDoc(productRef);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    basePrice: '',
    description: '',
    details: '',
    imageUrls: [] as string[]
  });

  const [newImageUrl, setNewImageUrl] = useState('');

  const [stockMatrix, setStockMatrix] = useState<StockMatrix>({
    'XS': {}, 'S': {}, 'M': {}, 'L': {}, 'XL': {}, 'XXL': {}
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category || '',
        basePrice: product.basePrice?.toString() || '',
        description: product.description || '',
        details: Array.isArray(product.details) ? product.details.join('\n') : '',
        imageUrls: product.imageUrls || []
      });
      if (product.stockMatrix) setStockMatrix(product.stockMatrix);
    }
  }, [product]);

  const addImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, newImageUrl.trim()] }));
    setNewImageUrl('');
  };

  const removeImageUrl = (idx: number) => {
    setFormData(prev => ({ ...prev, imageUrls: prev.imageUrls.filter((_, i) => i !== idx) }));
  };

  const calculateTotalStock = () => {
    let total = 0;
    Object.values(stockMatrix).forEach(colors => Object.values(colors).forEach(qty => total += Number(qty) || 0));
    return total;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !id || !isAdmin) return;

    setLoading(true);
    try {
      const detailsArray = formData.details.split('\n').filter(d => d.trim() !== '');
      const totalStock = calculateTotalStock();
      
      const updateData = {
        name: formData.name.toUpperCase(),
        category: formData.category.toUpperCase(),
        basePrice: parseFloat(formData.basePrice),
        description: formData.description,
        imageUrls: formData.imageUrls,
        stockMatrix: stockMatrix,
        stockQuantity: totalStock,
        details: detailsArray,
        updatedAt: new Date().toISOString()
      };

      await updateDoc(doc(db, 'products', id), updateData);
      toast({ title: "MODULE UPDATED", description: "CONFIGURATION SYNCED TO VOID." });
      router.push('/admin/products');
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "SYNC ERROR" });
    } finally {
      setLoading(false);
    }
  };

  if (isUserLoading || !mounted || productLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-white/20" /></div>;
  if (!isAdmin) return null;

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen text-white">
      <div className="container mx-auto px-6 max-w-5xl">
        <Link href="/admin/products" className="flex items-center gap-2 text-[10px] text-white/40 hover:text-white uppercase tracking-widest mb-10 font-bold">
          <ChevronLeft className="w-3 h-3" /> BACK TO ASSEMBLAGES
        </Link>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight glow-text uppercase mb-12">Module Command</h1>

        <form onSubmit={handleSubmit} className="bg-white/[0.02] border border-white/5 p-12 space-y-12 backdrop-blur-xl">
          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">MODULE NAME</label>
              <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="bg-black/40 border-white/10 rounded-none h-14 text-white uppercase" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">BASE PRICE (₹)</label>
              <Input required type="number" value={formData.basePrice} onChange={e => setFormData({ ...formData, basePrice: e.target.value })} className="bg-black/40 border-white/10 rounded-none h-14 text-white" />
            </div>
          </div>

          <div className="space-y-6">
            <label className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">VISUAL UPLINKS (IMAGES)</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.imageUrls.map((url, i) => (
                <div key={i} className="relative aspect-[3/4] border border-white/10 group">
                  <Image src={url} alt="Product" fill className="object-cover grayscale" unoptimized />
                  <button type="button" onClick={() => removeImageUrl(i)} className="absolute top-2 right-2 bg-red-500/80 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3 text-white" /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <Input placeholder="HTTPS://IMAGE-URL.COM" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} className="bg-black/40 border-white/10 rounded-none h-12" />
              <Button type="button" onClick={addImageUrl} className="bg-white/10 hover:bg-white/20 border-white/10 text-white rounded-none h-12">ADD LINK</Button>
            </div>
          </div>

          <div className="space-y-3">
             <label className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">NEURAL DESCRIPTION</label>
             <Textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="bg-black/40 border-white/10 rounded-none min-h-[120px] text-white" />
          </div>

          <Button disabled={loading} className="w-full bg-white text-black hover:bg-white/90 h-16 text-[10px] font-bold tracking-[0.5em] rounded-none uppercase">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>SYNC MODULE CHANGES <Save className="ml-3 w-4 h-4" /></>}
          </Button>
        </form>
      </div>
    </div>
  );
}