'use client';

import { useFirestore, useDoc, useMemoFirebase, useUser } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ChevronLeft, Save, Loader2, Trash2, Plus, X, Upload, Palette, Percent, ZapOff, ImageIcon, Link as LinkIcon, Sparkles } from 'lucide-react';
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
import { motion, AnimatePresence } from 'framer-motion';

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
    isOutOfStock: false,
    isTaxable: true,
    isTopItem: false,
    topItemDescription: ''
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
        isOutOfStock: product.isOutOfStock || false,
        isTaxable: product.isTaxable !== false,
        isTopItem: product.isTopItem || false,
        topItemDescription: product.topItemDescription || ''
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
      toast({ title: "ASSET COMPRESSED" });
    } catch (err) {
      toast({ variant: "destructive", title: "UPLOAD ERROR" });
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
      toast({ title: "ASSET COMPRESSED" });
    } catch (err) {
      toast({ variant: "destructive", title: "UPLOAD ERROR" });
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
    toast({ title: "STOCK UPDATED", description: `${size} // ${color} set to zero.` });
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
        isTaxable: formData.isTaxable,
        isTopItem: formData.isTopItem,
        topItemDescription: formData.topItemDescription,
        stockMatrix: stockMatrix,
        stockQuantity: totalStock,
        sizes: Object.keys(stockMatrix).filter(s => Object.keys(stockMatrix[s]).length > 0),
        details: detailsArray,
        updatedAt: new Date().toISOString()
      };

      await updateDoc(doc(db, 'products', id), updateData);
      toast({ title: "PRODUCT UPDATED", description: "Changes synced to database." });
      router.push('/admin/products');
    } catch (e) {
      toast({ variant: "destructive", title: "SYNC ERROR" });
    } finally {
      setLoading(false);
    }
  };

  if (isUserLoading || !mounted || isProfileLoading || productLoading) {
    return <div className="h-screen flex items-center justify-center bg-background"><Loader2 className="w-10 h-10 animate-spin text-black/20" /></div>;
  }

  if (!isAdmin) return null;

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen text-black font-body">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="space-y-4 mb-16">
          <Link href="/admin/products" className="flex items-center gap-2 text-[10px] text-black/60 hover:text-black transition-colors uppercase tracking-widest mb-4 font-bold">
            <ChevronLeft className="w-3 h-3" />
            BACK TO STOCK
          </Link>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none font-headline">Edit Product</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-black/[0.01] border border-black/5 p-12 space-y-12 backdrop-blur-xl shadow-sm">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 border border-red-100 bg-red-50 flex items-center justify-between">
               <div className="space-y-1">
                  <p className="text-[10px] font-black tracking-[0.4em] uppercase text-red-600">OVERRIDE: OUT OF STOCK</p>
                  <p className="text-[8px] tracking-widest uppercase text-black/60">Manually set this item as unavailable for purchase.</p>
               </div>
               <Switch checked={formData.isOutOfStock} onCheckedChange={(checked) => setFormData({ ...formData, isOutOfStock: checked })} />
            </div>

            <div className="p-8 border border-black/10 bg-black/5 flex items-center justify-between">
               <div className="space-y-1">
                  <p className="text-[10px] font-black tracking-[0.4em] uppercase text-black">APPLY SYSTEM TAX (5%)</p>
                  <p className="text-[8px] tracking-widest uppercase text-black/60">Include this module in tax calculations.</p>
               </div>
               <Switch checked={formData.isTaxable} onCheckedChange={(checked) => setFormData({ ...formData, isTaxable: checked })} />
            </div>
          </div>

          <div className="p-10 border border-black/10 bg-black/[0.02] space-y-10">
             <div className="flex items-center justify-between border-b border-black/10 pb-6">
                <div className="flex items-center gap-4 text-black">
                   <Sparkles className="w-5 h-5 text-black" />
                   <h3 className="text-sm font-black tracking-[0.4em] uppercase">TOP ITEM CONFIGURATION</h3>
                </div>
                <Switch checked={formData.isTopItem} onCheckedChange={(checked) => setFormData({ ...formData, isTopItem: checked })} />
             </div>
             <AnimatePresence>
               {formData.isTopItem && (
                 <motion.div 
                   initial={{ height: 0, opacity: 0 }}
                   animate={{ height: 'auto', opacity: 1 }}
                   exit={{ height: 0, opacity: 0 }}
                   className="space-y-4 overflow-hidden"
                 >
                    <label className="text-[10px] font-bold tracking-[0.4em] text-black/60 uppercase">CAROUSEL NARRATIVE</label>
                    <Textarea 
                      value={formData.topItemDescription} 
                      onChange={e => setFormData({ ...formData, topItemDescription: e.target.value })}
                      placeholder="ENTER THE CINEMATIC DESCRIPTION FOR THE HOMEPAGE 3D CAROUSEL..."
                      className="bg-white border-black/10 rounded-none h-24 text-[10px] tracking-widest focus:border-black/40 text-black uppercase"
                    />
                 </motion.div>
               )}
             </AnimatePresence>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.4em] text-black/60 uppercase">PRODUCT NAME</label>
              <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="bg-white border-black/10 rounded-none h-14 text-black uppercase tracking-widest" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.4em] text-black/60 uppercase">CATEGORY</label>
              <Input required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="bg-white border-black/10 rounded-none h-14 text-black uppercase tracking-widest" />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.4em] text-black/60 uppercase">MSRP (₹)</label>
              <Input required type="number" value={formData.originalPrice} onChange={e => setFormData({ ...formData, originalPrice: e.target.value })} className="bg-white border-black/10 rounded-none h-14 text-black font-mono" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.4em] text-black/60 uppercase">OFF (%)</label>
              <div className="relative">
                <Input type="number" value={formData.discountPercentage} onChange={e => setFormData({ ...formData, discountPercentage: e.target.value })} className="bg-white border-black/10 rounded-none h-14 text-black pr-12" />
                <Percent className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.4em] text-black/60 uppercase">SALE PRICE (₹)</label>
              <Input required type="number" value={formData.basePrice} onChange={e => setFormData({ ...formData, basePrice: e.target.value })} className="bg-white border-black/10 rounded-none h-14 text-black font-black" />
            </div>
          </div>

          <div className="space-y-12">
            <div className="border-b border-black/10 pb-4 flex items-center gap-4">
              <ImageIcon className="w-4 h-4 text-black/40" />
              <label className="text-[10px] font-bold tracking-[0.4em] text-black/60 uppercase">DEFAULT ASSET GALLERY</label>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {formData.imageUrls.map((url, i) => (
                <div key={i} className="relative aspect-[3/4] bg-black/5 border border-black/10 group overflow-hidden">
                  <Image src={url} alt={`Asset ${i}`} fill className="object-cover" unoptimized />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={() => removeImageUrl(i)} className="p-3 bg-red-600 text-white hover:bg-red-700 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="relative aspect-[3/4] bg-black/[0.02] border border-dashed border-black/10 flex flex-col items-center justify-center space-y-2 group cursor-pointer hover:border-black/30 transition-all">
                <Upload className="w-6 h-6 text-black/20 group-hover:text-black/40" />
                <p className="text-[7px] font-black tracking-widest uppercase text-black/30 group-hover:text-black/50 text-center px-4">UPLOAD LOCAL ASSET</p>
                <input type="file" accept="image/*" onChange={handleLocalDefaultUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20" />
                <Input 
                  value={newImageUrl} 
                  onChange={e => setNewImageUrl(e.target.value)} 
                  className="bg-white border-black/10 rounded-none h-14 pl-12 text-[10px] tracking-widest text-black" 
                  placeholder="LINK EXTERNAL ASSET URL..." 
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
                />
              </div>
              <Button type="button" onClick={addImageUrl} className="h-14 bg-black/5 border border-black/10 rounded-none px-8 text-[10px] font-bold tracking-widest text-black hover:bg-black hover:text-white transition-all">LINK URL</Button>
            </div>
          </div>

          <div className="space-y-10">
            <div className="border-b border-black/10 pb-4">
              <label className="text-[10px] font-bold tracking-[0.4em] text-black/60 uppercase">SIZE & COLOR STOCK</label>
            </div>
            <div className="grid gap-10">
              {['S', 'M', 'L', 'XL'].map(size => (
                <div key={size} className="space-y-6 p-8 border border-black/5 bg-black/[0.02]">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black tracking-tighter text-black/80">{size}</span>
                    <div className="flex gap-3">
                       <Input placeholder="COLOR" value={newColor[size] || ''} onChange={e => setNewColor({...newColor, [size]: e.target.value})} className="h-10 w-48 bg-white border-black/10 text-[9px] tracking-widest uppercase rounded-none" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddColor(size))} />
                       <Button type="button" onClick={() => handleAddColor(size)} className="h-10 rounded-none bg-black text-white hover:bg-black/90"><Plus className="w-3 h-3" /></Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {Object.keys(stockMatrix[size] || {}).map(color => (
                      <div key={color} className="flex flex-col gap-4 p-4 bg-white border border-black/10 shadow-sm">
                        <div className="flex justify-between items-center border-b border-black/5 pb-2">
                           <p className="text-[9px] tracking-[0.2em] font-bold text-black/60 uppercase">{color}</p>
                           <div className="flex gap-2">
                              <button type="button" onClick={() => setVariantOOS(size, color)} title="OUT OF STOCK" className="text-black/20 hover:text-red-600 transition-colors"><ZapOff className="w-3 h-3" /></button>
                              <button type="button" onClick={() => handleRemoveColor(size, color)} className="text-black/20 hover:text-black transition-colors"><X className="w-3.5 h-3.5" /></button>
                           </div>
                        </div>
                        <Input type="number" value={stockMatrix[size][color]} onChange={e => handleQtyChange(size, color, e.target.value)} className="h-8 bg-transparent border-0 border-b border-black/10 focus:border-black/40 text-[11px] p-0 rounded-none font-mono text-black" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-12">
            <div className="border-b border-black/10 pb-4 flex items-center gap-4">
              <Palette className="w-4 h-4 text-black/40" />
              <label className="text-[10px] font-bold tracking-[0.4em] text-black/60 uppercase">COLOR IMAGES</label>
            </div>
            <div className="grid gap-16">
              {uniqueColors.map(color => (
                <div key={color} className="space-y-8 p-10 bg-black/[0.01] border border-black/5">
                   <div className="flex items-center justify-between border-b border-black/10 pb-4">
                      <h3 className="text-xs font-black tracking-[0.3em] uppercase text-black/80">{color} VARIANT</h3>
                      <span className="text-[8px] tracking-[0.4em] text-black/40 uppercase font-bold">TOTAL: {formData.colorImages[color]?.length || 0}</span>
                   </div>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {formData.colorImages[color]?.map((url, i) => (
                        <div key={i} className="relative aspect-[3/4] bg-black/5 border border-black/10 group overflow-hidden">
                           <Image src={url} alt={`${color} variant`} fill className="object-cover" unoptimized />
                           <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button type="button" onClick={() => removeColorImageUrl(color, i)} className="p-3 bg-red-600 text-white"><Trash2 className="w-4 h-4" /></button>
                           </div>
                        </div>
                      ))}
                   </div>
                   <div className="flex flex-col md:flex-row gap-4">
                      <Input value={colorInputUrl[color] || ''} onChange={e => setColorInputUrl({...colorInputUrl, [color]: e.target.value})} className="bg-white border-black/10 rounded-none h-12 text-[10px] tracking-widest text-black flex-1" placeholder={`IMAGE URL FOR ${color}...`} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addColorImageUrl(color))} />
                      <div className="flex gap-4">
                        <Button type="button" onClick={() => addColorImageUrl(color)} className="h-12 bg-black/5 border border-black/10 rounded-none px-8 text-[10px] font-bold tracking-widest text-black">LINK URL</Button>
                        <div className="relative">
                          <Button type="button" className="h-12 bg-black text-white hover:bg-black/90 rounded-none px-8 text-[10px] font-bold tracking-widest">UPLOAD</Button>
                          <input type="file" accept="image/*" onChange={(e) => handleLocalColorUpload(color, e)} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
             <label className="text-[10px] font-bold tracking-[0.4em] text-black/60 uppercase">DESCRIPTION</label>
             <Textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="bg-white border-black/10 rounded-none min-h-[150px] text-black tracking-widest text-xs leading-relaxed" />
          </div>

          <Button disabled={loading} className="w-full bg-black text-white hover:bg-black/90 h-20 text-[11px] font-black tracking-[0.6em] rounded-none uppercase shadow-sm transition-all">
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>SAVE PRODUCT CHANGES <Save className="ml-4 w-5 h-5" /></>}
          </Button>
        </form>
      </div>
    </div>
  );
}
