'use client';

import { useFirestore, useDoc, useMemoFirebase, useUser } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ChevronLeft, Save, Loader2, Trash2, Plus, X, Upload, ShieldAlert, Zap } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
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
    imageUrls: [] as string[],
    isOutOfStock: false
  });

  const [newImageUrl, setNewImageUrl] = useState('');
  const [stockMatrix, setStockMatrix] = useState<StockMatrix>({
    'XS': {}, 'S': {}, 'M': {}, 'L': {}, 'XL': {}, 'XXL': {}
  });
  const [newColor, setNewColor] = useState<{ [size: string]: string }>({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category || '',
        basePrice: product.basePrice?.toString() || '',
        description: product.description || '',
        details: Array.isArray(product.details) ? product.details.join('\n') : '',
        imageUrls: product.imageUrls || [],
        isOutOfStock: product.isOutOfStock || false
      });
      if (product.stockMatrix) {
        setStockMatrix(product.stockMatrix);
      }
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

  const handleAddColor = (size: string) => {
    const color = newColor[size]?.trim().toUpperCase();
    if (!color) return;
    
    setStockMatrix(prev => ({
      ...prev,
      [size]: { ...prev[size], [color]: 0 }
    }));
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
    setStockMatrix(prev => ({
      ...prev,
      [size]: { ...prev[size], [color]: Math.max(0, qty) }
    }));
  };

  const calculateTotalStock = () => {
    let total = 0;
    Object.values(stockMatrix).forEach(colors => {
      Object.values(colors).forEach(qty => total += Number(qty) || 0);
    });
    return total;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !id || !isAdmin) return;

    setLoading(true);
    try {
      const detailsArray = formData.details.split('\n').filter(d => d.trim() !== '');
      const totalStock = calculateTotalStock();
      const activeSizes = Object.keys(stockMatrix).filter(s => Object.values(stockMatrix[s]).some(q => q > 0));
      
      const updateData = {
        name: formData.name.toUpperCase(),
        category: formData.category.toUpperCase(),
        basePrice: parseFloat(formData.basePrice) || 0,
        description: formData.description,
        imageUrls: formData.imageUrls,
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

  if (isUserLoading || !mounted || productLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-10 h-10 animate-spin text-white/20" />
      </div>
    );
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
                <p className="text-[10px] font-black tracking-[0.4em] uppercase text-red-500">SYSTEM OVERRIDE: OUT OF STOCK</p>
                <p className="text-[8px] tracking-widest uppercase text-white/40">Manual toggle to immediately show this module as unavailable.</p>
             </div>
             <Switch 
                checked={formData.isOutOfStock}
                onCheckedChange={(checked) => setFormData({ ...formData, isOutOfStock: checked })}
                className="data-[state=checked]:bg-red-500"
             />
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">MODULE NAME</label>
              <Input 
                required 
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })} 
                className="bg-black/40 border-white/10 rounded-none h-14 text-white uppercase tracking-widest" 
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">BASE PRICE (₹)</label>
              <Input 
                required 
                type="number" 
                value={formData.basePrice} 
                onChange={e => setFormData({ ...formData, basePrice: e.target.value })} 
                className="bg-black/40 border-white/10 rounded-none h-14 text-white font-mono" 
              />
            </div>
          </div>

          <div className="space-y-8">
            <label className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">VISUAL UPLINKS (IMAGES)</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {formData.imageUrls.map((url, i) => (
                <div key={i} className="relative aspect-[3/4] border border-white/10 group bg-black/40 overflow-hidden">
                  <Image src={url} alt="Product" fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" unoptimized />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={() => removeImageUrl(i)} className="p-3 bg-red-500/80 text-white rounded-none">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="relative aspect-[3/4] border border-white/10 border-dashed flex flex-col items-center justify-center opacity-40 hover:opacity-100 transition-all cursor-pointer">
                <Upload className="w-6 h-6 mb-2" />
                <span className="text-[8px] tracking-[0.2em] font-bold">ADD VISUAL</span>
              </div>
            </div>
            <div className="flex gap-4">
              <Input 
                placeholder="HTTPS://REMOTE-UPLINK.COM/IMAGE.JPG" 
                value={newImageUrl} 
                onChange={e => setNewImageUrl(e.target.value)} 
                className="bg-black/40 border-white/10 rounded-none h-12 text-[10px] tracking-widest" 
              />
              <Button type="button" onClick={addImageUrl} className="bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-none h-12 px-8 text-[10px] font-bold tracking-widest">
                LINK ASSET
              </Button>
            </div>
          </div>

          <div className="space-y-10">
            <div className="border-b border-white/10 pb-4">
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">INVENTORY MATRIX (SIZE // COLOR // QTY)</label>
            </div>
            <div className="grid gap-10">
              {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                <div key={size} className="space-y-6 p-8 border border-white/5 bg-white/[0.01]">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black tracking-tighter text-white/80">{size}</span>
                    <div className="flex gap-3">
                       <Input 
                         placeholder="COLOR IDENTIFIER" 
                         value={newColor[size] || ''}
                         onChange={e => setNewColor({...newColor, [size]: e.target.value})}
                         className="h-10 w-48 bg-black/40 border-white/10 text-[9px] tracking-widest uppercase rounded-none"
                         onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddColor(size))}
                       />
                       <Button type="button" onClick={() => handleAddColor(size)} className="h-10 rounded-none bg-white/10 hover:bg-white/20 text-white border border-white/10">
                          <Plus className="w-3 h-3" />
                       </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {Object.keys(stockMatrix[size] || {}).map(color => (
                      <div key={color} className="flex items-center gap-4 p-4 bg-black/60 border border-white/10">
                        <div className="flex-1 space-y-2">
                          <p className="text-[9px] tracking-[0.2em] font-bold text-white/40 uppercase">{color}</p>
                          <Input 
                            type="number"
                            value={stockMatrix[size][color]}
                            onChange={e => handleQtyChange(size, color, e.target.value)}
                            className="h-8 bg-transparent border-0 border-b border-white/10 focus:border-white/40 text-[11px] p-0 rounded-none font-mono text-white"
                          />
                        </div>
                        <button type="button" onClick={() => handleRemoveColor(size, color)} className="text-white/20 hover:text-red-500 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {(!stockMatrix[size] || Object.keys(stockMatrix[size]).length === 0) && (
                      <div className="col-span-full py-4 text-center">
                        <span className="text-[8px] tracking-[0.3em] text-white/20 uppercase font-bold">NO COLOR NODES DEFINED FOR THIS SIZE</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border border-white/10 bg-white/[0.01] flex justify-between items-center">
               <span className="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase">AGGREGATED INVENTORY UNITS</span>
               <span className="text-2xl font-black glow-text">{calculateTotalStock()}</span>
            </div>
          </div>

          <div className="space-y-4">
             <label className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">NEURAL DESCRIPTION</label>
             <Textarea 
               required 
               value={formData.description} 
               onChange={e => setFormData({ ...formData, description: e.target.value })} 
               className="bg-black/40 border-white/10 rounded-none min-h-[150px] text-white tracking-widest text-xs leading-relaxed" 
             />
          </div>

          <div className="space-y-4">
             <label className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">TECHNICAL SPECIFICATIONS (ONE PER LINE)</label>
             <Textarea 
               value={formData.details} 
               onChange={e => setFormData({ ...formData, details: e.target.value })} 
               className="bg-black/40 border-white/10 rounded-none min-h-[150px] text-white tracking-widest text-[10px] leading-loose" 
               placeholder="THERMOREACTIVE INK&#10;MOISTURE-WICKING PROTOCOLS"
             />
          </div>

          <Button 
            disabled={loading} 
            className="w-full bg-white text-black hover:bg-white/90 h-20 text-[11px] font-black tracking-[0.6em] rounded-none uppercase shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-all"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>
                SYNC MODULE RECONFIGURATION <Save className="ml-4 w-5 h-5" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
