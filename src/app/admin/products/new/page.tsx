
"use client"

import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ChevronLeft, Sparkles, Loader2, Upload, Trash2, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
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
    basePrice: '',
    description: '',
    imageUrl: '',
    details: ''
  });

  const [stockMatrix, setStockMatrix] = useState<StockMatrix>({
    'XS': {}, 'S': {}, 'M': {}, 'L': {}, 'XL': {}, 'XXL': {}
  });

  const [newColor, setNewColor] = useState<{ [size: string]: string }>({});

  const calculateTotalStock = () => {
    let total = 0;
    Object.values(stockMatrix).forEach(colors => {
      Object.values(colors).forEach(qty => total += qty);
    });
    return total;
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
        toast({ title: "VISUAL BUFFERED", description: "LOCAL ASSET CONVERTED." });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !isAdmin) return;

    const totalStock = calculateTotalStock();
    if (totalStock <= 0) {
      toast({ variant: "destructive", title: "INVENTORY EMPTY", description: "ADD AT LEAST ONE SIZE-COLOR NODE." });
      return;
    }

    setLoading(true);
    const detailsArray = formData.details.split('\n').filter(d => d.trim() !== '');
    
    const productData = {
      name: formData.name.toUpperCase(),
      category: formData.category.toUpperCase(),
      basePrice: parseFloat(formData.basePrice) || 0,
      description: formData.description,
      imageUrls: [formData.imageUrl || `https://picsum.photos/seed/${Math.random()}/800/1000`],
      stockMatrix: stockMatrix,
      stockQuantity: totalStock,
      sizes: Object.keys(stockMatrix).filter(s => Object.values(stockMatrix[s]).some(q => q > 0)),
      details: detailsArray,
      slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const productsCol = collection(db, 'products');

    // Non-blocking approach with explicit feedback reset
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
            <div className="flex flex-col justify-end">
               <div className="p-4 border border-white/5 bg-white/[0.01]">
                  <p className="text-[10px] tracking-[0.3em] font-bold text-white/40 uppercase">TOTAL STOCK: {calculateTotalStock()}</p>
               </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="border-b border-white/10 pb-4">
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">INVENTORY MATRIX (SIZE // COLOR // QTY)</label>
            </div>
            
            <div className="grid gap-10">
              {Object.keys(stockMatrix).map(size => (
                <div key={size} className="space-y-6 p-6 border border-white/5 bg-white/[0.01]">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black tracking-widest text-white/80">{size}</span>
                    <div className="flex gap-2">
                       <Input 
                         placeholder="COLOR NAME" 
                         value={newColor[size] || ''}
                         onChange={e => setNewColor({...newColor, [size]: e.target.value})}
                         className="h-10 w-40 bg-black/40 border-white/10 text-[9px] tracking-widest uppercase rounded-none"
                         onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddColor(size))}
                       />
                       <Button type="button" onClick={() => handleAddColor(size)} size="sm" className="h-10 rounded-none bg-white/10 hover:bg-white/20 text-white border-white/10">
                          <Plus className="w-3 h-3" />
                       </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.keys(stockMatrix[size]).map(color => (
                      <div key={color} className="flex items-center gap-3 p-3 bg-black/40 border border-white/5">
                        <div className="flex-1 space-y-1">
                          <p className="text-[8px] tracking-[0.2em] font-bold text-white/40 uppercase">{color}</p>
                          <Input 
                            type="number"
                            value={stockMatrix[size][color]}
                            onChange={e => handleQtyChange(size, color, e.target.value)}
                            className="h-8 bg-transparent border-0 border-b border-white/10 focus:border-white/40 text-[10px] p-0 rounded-none font-mono"
                          />
                        </div>
                        <button type="button" onClick={() => handleRemoveColor(size, color)} className="text-white/20 hover:text-red-500 transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
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
                    <Image src={formData.imageUrl} alt="Preview" fill className="object-cover" unoptimized />
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
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                    />
                  </>
                )}
              </div>
              <div className="flex-1 space-y-4 w-full">
                <label className="text-[9px] font-bold tracking-[0.2em] text-white/20 uppercase">OR REMOTE LINK</label>
                <Input 
                  value={formData.imageUrl.startsWith('data:') ? '' : formData.imageUrl}
                  onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="bg-black/40 border-white/10 rounded-none h-12 text-[10px] tracking-widest focus:border-white/40 text-white"
                  placeholder="HTTPS://..."
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
            className="w-full bg-white text-black hover:bg-white/90 h-16 text-[10px] font-bold tracking-[0.5em] rounded-none shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all"
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
