"use client"

import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ChevronLeft, Sparkles, Loader2, Upload, Trash2, Plus, X, ZapOff, Link as LinkIcon, Palette, Percent } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { compressImage } from '@/lib/image-utils';
import Image from 'next/image';

type StockMatrix = {
  [size: string]: {
    [color: string]: number;
  };
};

export default function NewProductPage() {
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

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    originalPrice: '',
    discountPercentage: '0',
    description: '',
    imageUrls: [] as string[],
    colorImages: {} as { [color: string]: string[] },
    details: '',
    isOutOfStock: false
  });

  const [currentInputUrl, setCurrentInputUrl] = useState('');
  const [colorInputUrl, setColorInputUrl] = useState<{ [color: string]: string }>({});
  const [stockMatrix, setStockMatrix] = useState<StockMatrix>({
    'S': {}, 'M': {}, 'L': {}, 'XL': {}
  });
  const [newColor, setNewColor] = useState<{ [size: string]: string }>({});

  const calculatedBasePrice = useMemo(() => {
    const original = parseFloat(formData.originalPrice) || 0;
    const discount = parseFloat(formData.discountPercentage) || 0;
    const final = original - (original * (discount / 100));
    return Math.round(final);
  }, [formData.originalPrice, formData.discountPercentage]);

  const uniqueColors = useMemo(() => {
    const colors = new Set<string>();
    Object.values(stockMatrix).forEach(sizeColors => {
      Object.keys(sizeColors).forEach(c => colors.add(c));
    });
    return Array.from(colors);
  }, [stockMatrix]);

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
      toast({ title: "ASSET COMPRESSED", description: `${color} MODULE LOGGED TO SESSION.` });
    } catch (err) {
      toast({ variant: "destructive", title: "UPLINK_FAILURE", description: "NEURAL COMPRESSION FAILED." });
    }
  };

  const addDefaultImageUrl = () => {
    if (!currentInputUrl.trim()) return;
    setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, currentInputUrl.trim()] }));
    setCurrentInputUrl('');
  };

  const handleLocalDefaultUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, compressed] }));
      toast({ title: "ASSET COMPRESSED", description: "DEFAULT MODULE LOGGED TO SESSION." });
    } catch (err) {
      toast({ variant: "destructive", title: "UPLINK_FAILURE", description: "NEURAL COMPRESSION FAILED." });
    }
  };

  const removeColorImageUrl = (color: string, idx: number) => {
    setFormData(prev => ({ ...prev, colorImages: { ...prev.colorImages, [color]: prev.colorImages[color].filter((_, i) => i !== idx) } }));
  };

  const removeDefaultImageUrl = (idx: number) => {
    setFormData(prev => ({ ...prev, imageUrls: prev.imageUrls.filter((_, i) => i !== idx) }));
  };

  const calculateTotalStock = () => {
    let total = 0;
    Object.values(stockMatrix).forEach(colors => { Object.values(colors).forEach(qty => total += qty); });
    return total;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !isAdmin) return;

    const totalStock = calculateTotalStock();
    const colorsWithoutImages = uniqueColors.filter(c => !formData.colorImages[c] || formData.colorImages[c].length === 0);
    
    if (colorsWithoutImages.length > 0) {
       toast({ variant: "destructive", title: "CHROMA_VISUALS_MISSING", description: `ADD IMAGES FOR COLORS: ${colorsWithoutImages.join(', ')}.` });
       return;
    }

    setLoading(true);
    const detailsArray = formData.details.split('\n').filter(d => d.trim() !== '');
    
    const productData = {
      name: formData.name.toUpperCase(),
      category: formData.category.toUpperCase(),
      originalPrice: parseFloat(formData.originalPrice) || 0,
      discountPercentage: parseFloat(formData.discountPercentage) || 0,
      basePrice: calculatedBasePrice,
      description: formData.description,
      imageUrls: formData.imageUrls,
      colorImages: formData.colorImages,
      isOutOfStock: formData.isOutOfStock,
      stockMatrix: stockMatrix,
      stockQuantity: totalStock,
      sizes: Object.keys(stockMatrix).filter(s => Object.keys(stockMatrix[s]).length > 0),
      details: detailsArray,
      slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const productsCol = collection(db, 'products');

    addDoc(productsCol, productData)
      .then(() => {
        toast({ title: "MODULE INITIALIZED", description: "DATA PERSISTED TO THE VOID." });
        router.push('/admin/products');
      })
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: productsCol.path,
          operation: 'create',
          requestResourceData: productData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
      });
  };

  if (!mounted || isUserLoading || !isAdmin) return null;

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="space-y-4 mb-16">
          <Link href="/admin/products" className="flex items-center gap-2 text-[10px] text-white/20 hover:text-white transition-colors uppercase tracking-widest mb-4 font-bold">
            <ChevronLeft className="w-3 h-3" />
            BACK TO ASSEMBLAGES
          </Link>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight glow-text uppercase leading-none text-white">Initialize Module</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/[0.02] border border-white/5 p-12 space-y-12 backdrop-blur-xl">
          <div className="p-8 border border-red-500/20 bg-red-500/5 flex items-center justify-between">
             <div className="space-y-1">
                <p className="text-[10px] font-black tracking-[0.4em] uppercase text-red-500">SYSTEM OVERRIDE: OUT OF STOCK</p>
                <p className="text-[8px] tracking-widest uppercase text-white/40">Immediately show this module as unavailable upon initialization.</p>
             </div>
             <Switch checked={formData.isOutOfStock} onCheckedChange={(checked) => setFormData({ ...formData, isOutOfStock: checked })} className="data-[state=checked]:bg-red-500" />
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">MODULE NAME</label>
              <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest focus:border-white/40 text-white uppercase" placeholder="E.G. NEON JACKET" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">CATEGORY</label>
              <Input required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest focus:border-white/40 text-white uppercase" placeholder="E.G. OUTERWEAR" />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">ORIGINAL PRICE (₹)</label>
              <Input required type="number" value={formData.originalPrice} onChange={e => setFormData({ ...formData, originalPrice: e.target.value })} className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest focus:border-white/40 text-white" placeholder="0.00" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">DISCOUNT (%)</label>
              <div className="relative">
                <Input type="number" value={formData.discountPercentage} onChange={e => setFormData({ ...formData, discountPercentage: e.target.value })} className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest focus:border-white/40 text-white pr-12" placeholder="0" />
                <Percent className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">SALE PRICE (CALCULATED)</label>
              <div className="h-14 border border-white/10 bg-white/5 flex items-center px-6 text-[14px] font-black tracking-widest text-white glow-text">
                ₹{calculatedBasePrice}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="border-b border-white/10 pb-4">
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">INVENTORY MATRIX (SIZE // COLOR // QTY)</label>
            </div>
            
            <div className="grid gap-10">
              {['S', 'M', 'L', 'XL'].map(size => (
                <div key={size} className="space-y-6 p-6 border border-white/5 bg-white/[0.01]">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black tracking-widest text-white/80">{size}</span>
                    <div className="flex gap-2">
                       <Input placeholder="COLOR NAME" value={newColor[size] || ''} onChange={e => setNewColor({...newColor, [size]: e.target.value})} className="h-10 w-40 bg-black/40 border-white/10 text-[9px] tracking-widest uppercase rounded-none" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddColor(size))} />
                       <Button type="button" onClick={() => handleAddColor(size)} size="sm" className="h-10 rounded-none bg-white/10 hover:bg-white/20 text-white border-white/10"><Plus className="w-3 h-3" /></Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.keys(stockMatrix[size]).map(color => (
                      <div key={color} className="flex items-center gap-3 p-3 bg-black/40 border border-white/5">
                        <div className="flex-1 space-y-1">
                          <p className="text-[8px] tracking-[0.2em] font-bold text-white/40 uppercase">{color}</p>
                          <Input type="number" value={stockMatrix[size][color]} onChange={e => handleQtyChange(size, color, e.target.value)} className="h-8 bg-transparent border-0 border-b border-white/10 focus:border-white/40 text-[10px] p-0 rounded-none font-mono" />
                        </div>
                        <button type="button" onClick={() => handleRemoveColor(size, color)} className="text-white/20 hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
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
                   <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                      {formData.colorImages[color]?.map((url, i) => (
                        <div key={i} className="relative aspect-[3/4] bg-white/5 border border-white/10 group overflow-hidden">
                           <Image src={url} alt={`${color} module`} fill className="object-cover" unoptimized />
                           <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button type="button" onClick={() => removeColorImageUrl(color, i)} className="p-3 bg-red-500/80 text-white"><Trash2 className="w-4 h-4" /></button>
                           </div>
                        </div>
                      ))}
                      <div className="relative aspect-[3/4] bg-white/[0.01] border border-white/5 border-dashed flex flex-col items-center justify-center opacity-20">
                         <Upload className="w-6 h-6 mb-2" />
                         <span className="text-[7px] tracking-widest uppercase">AWAITING ASSET</span>
                      </div>
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
              {uniqueColors.length === 0 && <div className="py-12 text-center opacity-20 border border-dashed border-white/10"><p className="text-[10px] tracking-[0.3em] uppercase font-bold">INITIALIZE INVENTORY MATRIX TO ENABLE CHROMA UPLINKS</p></div>}
            </div>
          </div>

          <div className="space-y-8">
            <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">DEFAULT / FALLBACK VISUALS</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {formData.imageUrls.map((url, i) => (
                <div key={i} className="relative aspect-[3/4] bg-white/[0.02] border border-white/10 group overflow-hidden">
                   <Image src={url} alt={`Fallback visual ${i}`} fill className="object-cover grayscale" unoptimized />
                   <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button type="button" onClick={() => removeDefaultImageUrl(i)} className="p-3 bg-red-500/80 text-white"><Trash2 className="w-4 h-4" /></button>
                   </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col md:flex-row gap-4">
                <Input value={currentInputUrl} onChange={e => setCurrentInputUrl(e.target.value)} className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest focus:border-white/40 text-white flex-1" placeholder="HTTPS://REMOTE-UPLINK.COM/DEFAULT_ASSET.JPG" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addDefaultImageUrl())} />
                <div className="flex gap-4">
                  <Button type="button" onClick={addDefaultImageUrl} className="h-14 rounded-none bg-white/10 hover:bg-white/20 border border-white/10 px-8 text-[10px] font-bold tracking-widest">LINK URL</Button>
                  <div className="relative">
                    <Button type="button" className="h-14 rounded-none bg-white text-black hover:bg-white/90 px-8 text-[10px] font-bold tracking-widest">LOCAL UPLINK</Button>
                    <input type="file" accept="image/*" onChange={handleLocalDefaultUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">NEURAL DESCRIPTION</label>
            <Textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="bg-black/40 border-white/10 rounded-none min-h-[120px] text-[10px] tracking-widest focus:border-white/40 text-white" placeholder="ENTER PRODUCT STORY..." />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">SPECIFICATIONS (ONE PER LINE)</label>
            <Textarea value={formData.details} onChange={e => setFormData({ ...formData, details: e.target.value })} className="bg-black/40 border-white/10 rounded-none min-h-[120px] text-[10px] tracking-widest focus:border-white/40 text-white" placeholder="WATERPROOF SHELL&#10;NEON FIBER OPTICS" />
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-white text-black hover:bg-white/90 h-16 text-[10px] font-bold tracking-[0.5em] rounded-none shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>INITIALIZE MODULE <Sparkles className="ml-3 w-4 h-4" /></>}
          </Button>
        </form>
      </div>
    </div>
  );
}
