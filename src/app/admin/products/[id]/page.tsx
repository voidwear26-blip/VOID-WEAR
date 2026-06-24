
'use client';

import { useFirestore, useDoc, useMemoFirebase, useUser } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ChevronLeft, Save, Loader2, Trash2, Plus, X, Upload, ShieldAlert, Zap, ZapOff, Palette, Link as LinkIcon, Percent } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { compressImage } from '@/lib/image-utils';
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

  const productRef = useMemoFirebase(() => {
    if (!db || !id || !isAdmin) return null;
    return doc(db, 'products', id);
  }, [db, id, isAdmin]);

  const { data: product, isLoading: productLoading } = useDoc(productRef);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    originalPrice: '',
    discountPercentage: '0',
    basePrice: '', 
    description: '',
    details: '',
    imageUrls: [] as string[],
    colorImages: {} as { [color: string]: string[] },
    isOutOfStock: false
  });

  const [newImageUrl, setNewImageUrl] = useState('');
  const [colorInputUrl, setColorInputUrl] = useState<{ [color: string]: string }>({});
  const [stockMatrix, setStockMatrix] = useState<StockMatrix>({ 'S': {}, 'M': {}, 'L': {}, 'XL': {} });
  const [newColor, setNewColor] = useState<{ [size: string]: string }>({});

  const uniqueColors = useMemo(() => {
    const colors = new Set<string>();
    Object.values(stockMatrix).forEach(sizeColors => {
      Object.keys(sizeColors).forEach(c => colors.add(c));
    });
    return Array.from(colors);
  }, [stockMatrix]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category || '',
        originalPrice: product.originalPrice?.toString() || product.basePrice?.toString() || '',
        discountPercentage: product.discountPercentage?.toString() || '0',
        basePrice: product.basePrice?.toString() || '',
        description: product.description || '',
        details: Array.isArray(product.details) ? product.details.join('\n') : '',
        imageUrls: product.imageUrls || [],
        colorImages: product.colorImages || {},
        isOutOfStock: product.isOutOfStock || false
      });
      if (product.stockMatrix) {
        const filteredMatrix: StockMatrix = { 'S': {}, 'M': {}, 'L': {}, 'XL': {} };
        ['S', 'M', 'L', 'XL'].forEach(size => {
          if (product.stockMatrix[size]) filteredMatrix[size] = product.stockMatrix[size];
        });
        setStockMatrix(filteredMatrix);
      }
    }
  }, [product]);

  const addImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, newImageUrl.trim()] }));
    setNewImageUrl('');
  };

  const handleLocalDefaultUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, compressed] }));
      toast({ title: "ASSET COMPRESSED", description: "LOCAL MODULE LOGGED." });
    } catch (err) {
      toast({ variant: "destructive", title: "UPLINK_FAILURE" });
    }
  };

  const addColorImageUrl = (color: string) => {
    const url = colorInputUrl[color]?.trim();
    if (!url) return;
    setFormData(prev => ({ ...prev, colorImages: { ...prev.colorImages, [color]: [...(prev.colorImages[color] || []), url] } }));
    setColorInputUrl(prev => ({ ...prev, [color]: '' }));
  };

  const handleLocalColorUpload = async (color: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setFormData(prev => ({ ...prev, colorImages: { ...prev.colorImages, [color]: [...(prev.colorImages[color] || []), compressed] } }));
      toast({ title: "ASSET COMPRESSED", description: `${color} MODULE LOGGED.` });
    } catch (err) {
      toast({ variant: "destructive", title: "UPLINK_FAILURE" });
    }
  };

  const removeImageUrl = (idx: number) => {
    setFormData(prev => ({ ...prev, imageUrls: prev.imageUrls.filter((_, i) => i !== idx) }));
  };

  const removeColorImageUrl = (color: string, idx: number) => {
    setFormData(prev => ({ ...prev, colorImages: { ...prev.colorImages, [color]: prev.colorImages[color].filter((_, i) => i !== idx) } }));
  };

  const handleAddColor = (size: string) => {
    const color = newColor[size]?.trim().toUpperCase();
    if (!color) return;
    setStockMatrix(prev => ({ ...prev, [size]: { ...prev[size], [color]: 0 } }));
    setNewColor(prev => ({ ...prev, [size]: '' }));
  };

  const handleRemoveColor = (size: string, color: string) => {
    setStockMatrix(prev => {
      const updated = { ...prev[size] };
      delete updated[color];
      return { ...prev, [size]: updated };
    });
  };

  const handleQtyChange = (size: string, color: string, value: string) => {
    const qty = parseInt(value) || 0;
    setStockMatrix(prev => ({ ...prev, [size]: { ...prev[size], [color]: Math.max(0, qty) } }));
  };

  const setVariantOOS = (size: string, color: string) => {
    setStockMatrix(prev => ({ ...prev, [size]: { ...prev[size], [color]: 0 } }));
    toast({ title: "VARIANT OFFLINE", description: `${size} // ${color} SET TO OOS.` });
  };

  const calculateTotalStock = () => {
    let total = 0;
    Object.values(stockMatrix).forEach(colors => { Object.values(colors).forEach(qty => total += Number(qty) || 0); });
    return total;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !id || !isAdmin) return;

    setLoading(true);
    try {
      const detailsArray = formData.details.split('\n').filter(d => d.trim() !== '');
      const totalStock = calculateTotalStock();
      const activeSizes = Object.keys(stockMatrix).filter(s => Object.keys(stockMatrix[s]).length > 0);
      
      const updateData = {
        name: formData.name.toUpperCase(),
        category: formData.category.toUpperCase(),
        originalPrice: parseFloat(formData.originalPrice) || 0,
        discountPercentage: parseFloat(formData.discountPercentage) || 0,
        basePrice: parseFloat(formData.basePrice) || 0,
        description: formData.description,
        imageUrls: formData.imageUrls,
        colorImages: formData.colorImages,
        isOutOfStock: formData.isOutOfStock,
        stockMatrix: stockMatrix,
        stockQuantity: totalStock,
        sizes: activeSizes,
        details: detailsArray,
        updatedAt: new Date().toISOString()
      };

      await updateDoc(doc(db, 'products', id), updateData);
      toast({ title: "MODULE RECONFIGURED", description: "SYSTEM LOGS SYNCHRONIZED SUCCESSFULLY." });
      router.push('/admin/products');
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "SYNC FAILURE", description: "COULD NOT PERSIST MODULE CHANGES." });
    } finally {
      setLoading(false);
    }
  };

  if (isUserLoading || !mounted || isProfileLoading || productLoading) {
    return <div className="h-screen flex items-center justify-center bg-black"><Loader2 className="w-10 h-10 animate-spin text-white/20" /></div>;
  }

  if (!isAdmin) return null;

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen text-white">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="space-y-4 mb-16">
          <Link href="/admin/products" className="flex items-center gap-2 text-[10px] text-white/40 hover:text-white transition-colors uppercase tracking-widest mb-4 font-bold">
            <ChevronLeft className="w-3 h-3" />
            BACK TO ASSEMBLAGES
          </Link>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight glow-text uppercase leading-none">Module Command</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/[0.02] border border-white/5 p-12 space-y-12 backdrop-blur-xl">
          <div className="p-8 border border-red-500/20 bg-red-500/5 flex items-center justify-between">
             <div className="space-y-1">
                <p className="text-[10px] font-black tracking-[0.4em] uppercase text-red-500">SYSTEM OVERRIDE: GLOBAL OOS</p>
                <p className="text-[8px] tracking-widest uppercase text-white/40">Force all variants of this module to show as unavailable.</p>
             </div>
             <Switch checked={formData.isOutOfStock} onCheckedChange={(checked) => setFormData({ ...formData, isOutOfStock: checked })} className="data-[state=checked]:bg-red-500" />
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">MODULE NAME</label>
              <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="bg-black/40 border-white/10 rounded-none h-14 text-white uppercase tracking-widest" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">CATEGORY</label>
              <Input required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="bg-black/40 border-white/10 rounded-none h-14 text-white uppercase tracking-widest" />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">ORIGINAL PRICE (₹)</label>
              <Input required type="number" value={formData.originalPrice} onChange={e => setFormData({ ...formData, originalPrice: e.target.value })} className="bg-black/40 border-white/10 rounded-none h-14 text-white font-mono" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">DISCOUNT (%)</label>
              <div className="relative">
                <Input type="number" value={formData.discountPercentage} onChange={e => setFormData({ ...formData, discountPercentage: e.target.value })} className="bg-black/40 border-white/10 rounded-none h-14 text-white pr-12" />
                <Percent className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">SALE PRICE (₹)</label>
              <Input required type="number" value={formData.basePrice} onChange={e => setFormData({ ...formData, basePrice: e.target.value })} className="bg-black/40 border-white/10 rounded-none h-14 text-white font-black glow-text" />
            </div>
          </div>

          <div className="space-y-10">
            <div className="border-b border-white/10 pb-4">
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">INVENTORY MATRIX (SIZE // COLOR // QTY)</label>
            </div>
            <div className="grid gap-10">
              {['S', 'M', 'L', 'XL'].map(size => (
                <div key={size} className="space-y-6 p-8 border border-white/5 bg-white/[0.01]">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black tracking-tighter text-white/80">{size}</span>
                    <div className="flex gap-3">
                       <Input placeholder="COLOR IDENTIFIER" value={newColor[size] || ''} onChange={e => setNewColor({...newColor, [size]: e.target.value})} className="h-10 w-48 bg-black/40 border-white/10 text-[9px] tracking-widest uppercase rounded-none" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddColor(size))} />
                       <Button type="button" onClick={() => handleAddColor(size)} className="h-10 rounded-none bg-white/10 hover:bg-white/20 text-white border border-white/10"><Plus className="w-3 h-3" /></Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {Object.keys(stockMatrix[size] || {}).map(color => (
                      <div key={color} className="flex flex-col gap-4 p-4 bg-black/60 border border-white/10">
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                           <p className="text-[9px] tracking-[0.2em] font-bold text-white/40 uppercase">{color}</p>
                           <div className="flex gap-2">
                              <button type="button" onClick={() => setVariantOOS(size, color)} title="FORCE OUT OF STOCK" className="text-white/20 hover:text-red-500 transition-colors"><ZapOff className="w-3 h-3" /></button>
                              <button type="button" onClick={() => handleRemoveColor(size, color)} className="text-white/20 hover:text-white transition-colors"><X className="w-3.5 h-3.5" /></button>
                           </div>
                        </div>
                        <Input type="number" value={stockMatrix[size][color]} onChange={e => handleQtyChange(size, color, e.target.value)} className="h-8 bg-transparent border-0 border-b border-white/10 focus:border-white/40 text-[11px] p-0 rounded-none font-mono text-white" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-12">
            <div className="border-b border-white/10 pb-4 flex items-center gap-4">
              <Palette className="w-4 h-4 text-white/40" />
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">CHROMA VISUAL UPLINKS (PER COLOR)</label>
            </div>
            <div className="grid gap-16">
              {uniqueColors.map(color => (
                <div key={color} className="space-y-8 p-10 bg-white/[0.01] border border-white/5">
                   <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <h3 className="text-xs font-black tracking-[0.3em] uppercase text-white/80">{color} VISUALS</h3>
                      <span className="text-[8px] tracking-[0.4em] text-white/20 uppercase font-bold">ASSETS LOGGED: {formData.colorImages[color]?.length || 0}</span>
                   </div>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {formData.colorImages[color]?.map((url, i) => (
                        <div key={i} className="relative aspect-[3/4] bg-white/5 border border-white/10 group overflow-hidden">
                           <Image src={url} alt={`${color} variant`} fill className="object-cover" unoptimized />
                           <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button type="button" onClick={() => removeColorImageUrl(color, i)} className="p-3 bg-red-500/80 text-white"><Trash2 className="w-4 h-4" /></button>
                           </div>
                        </div>
                      ))}
                   </div>
                   <div className="flex flex-col md:flex-row gap-4">
                      <Input value={colorInputUrl[color] || ''} onChange={e => setColorInputUrl({...colorInputUrl, [color]: e.target.value})} className="bg-black/40 border-white/10 rounded-none h-12 text-[10px] tracking-widest text-white flex-1" placeholder={`UPLINK URL FOR ${color}...`} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addColorImageUrl(color))} />
                      <div className="flex gap-4">
                        <Button type="button" onClick={() => addColorImageUrl(color)} className="h-12 bg-white/5 border border-white/10 rounded-none px-8 text-[10px] font-bold tracking-widest">LINK URL</Button>
                        <div className="relative">
                          <Button type="button" className="h-12 bg-white text-black hover:bg-white/90 rounded-none px-8 text-[10px] font-bold tracking-widest">LOCAL UPLINK</Button>
                          <input type="file" accept="image/*" onChange={(e) => handleLocalColorUpload(color, e)} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <label className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">FALLBACK VISUALS (DEFAULT)</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {formData.imageUrls.map((url, i) => (
                <div key={i} className="relative aspect-[3/4] border border-white/10 group bg-black/40 overflow-hidden">
                  <Image src={url} alt="Fallback" fill className="object-cover grayscale" unoptimized />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={() => removeImageUrl(i)} className="p-3 bg-red-500/80 text-white rounded-none"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <Input placeholder="HTTPS://REMOTE-UPLINK.COM/IMAGE.JPG" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} className="bg-black/40 border-white/10 rounded-none h-12 text-[10px] tracking-widest flex-1" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImageUrl())} />
              <div className="flex gap-4">
                <Button type="button" onClick={addImageUrl} className="bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-none h-12 px-8 text-[10px] font-bold tracking-widest">LINK URL</Button>
                <div className="relative">
                  <Button type="button" className="h-12 bg-white text-black hover:bg-white/90 rounded-none px-8 text-[10px] font-bold tracking-widest">LOCAL UPLINK</Button>
                  <input type="file" accept="image/*" onChange={handleLocalDefaultUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
             <label className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">NEURAL DESCRIPTION</label>
             <Textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="bg-black/40 border-white/10 rounded-none min-h-[150px] text-white tracking-widest text-xs leading-relaxed" />
          </div>

          <div className="space-y-4">
             <label className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">TECHNICAL SPECIFICATIONS</label>
             <Textarea value={formData.details} onChange={e => setFormData({ ...formData, details: e.target.value })} className="bg-black/40 border-white/10 rounded-none min-h-[150px] text-white tracking-widest text-[10px] leading-loose" placeholder="ONE PER LINE..." />
          </div>

          <Button disabled={loading} className="w-full bg-white text-black hover:bg-white/90 h-20 text-[11px] font-black tracking-[0.6em] rounded-none uppercase shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-all">
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>SYNC MODULE RECONFIGURATION <Save className="ml-4 w-5 h-5" /></>}
          </Button>
        </form>
      </div>
    </div>
  );
}
