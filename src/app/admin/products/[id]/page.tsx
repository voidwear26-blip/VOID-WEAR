
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

type StockMatrix = {
  [size: string]: {
    [color: string]: number;
  };
};

export default function ProductAdminDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // v18.0 UID-First Master Authority Protocol
  const isAdmin = !isUserLoading && (
    user?.email?.toLowerCase() === 'voidwear26@gmail.com' || 
    user?.uid === 'A9vsqn10oddfmouKiKjWpTcFqZB2'
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isUserLoading && !isAdmin) {
      router.push('/');
    }
  }, [mounted, isUserLoading, isAdmin, router]);

  const productRef = useMemoFirebase(() => {
    if (!db || !id || !isAdmin) return null;
    return doc(db, 'products', id);
  }, [db, id, isAdmin]);

  const { data: product, isLoading: productLoading } = useDoc(productRef);

  // Fetch all transmissions containing this module
  const salesQuery = useMemoFirebase(() => {
    if (!db || !id || !isAdmin) return null;
    return query(
      collectionGroup(db, 'orders'),
      where('productIds', 'array-contains', id)
    );
  }, [db, id, isAdmin]);

  const { data: sales, isLoading: salesLoading } = useCollection(salesQuery);

  const stats = useMemo(() => {
    if (!sales) return { totalRevenue: 0, unitsSold: 0 };
    let revenue = 0;
    let units = 0;
    sales.forEach(order => {
      const relevantItems = order.items?.filter((item: any) => item.productId === id);
      relevantItems?.forEach((item: any) => {
        revenue += (Number(item.price) || 0) * (Number(item.quantity) || 1);
        units += Number(item.quantity) || 1;
      });
    });
    return { totalRevenue: revenue, unitsSold: units };
  }, [sales, id]);

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

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category || '',
        basePrice: product.basePrice?.toString() || '',
        description: product.description || '',
        imageUrl: product.imageUrls?.[0] || '',
        details: Array.isArray(product.details) ? product.details.join('\n') : ''
      });
      if (product.stockMatrix) {
        setStockMatrix({
          'XS': product.stockMatrix.XS || {},
          'S': product.stockMatrix.S || {},
          'M': product.stockMatrix.M || {},
          'L': product.stockMatrix.L || {},
          'XL': product.stockMatrix.XL || {},
          'XXL': product.stockMatrix.XXL || {}
        });
      }
    }
  }, [product]);

  const calculateTotalStock = () => {
    let total = 0;
    Object.values(stockMatrix).forEach(colors => {
      Object.values(colors).forEach(qty => total += Number(qty) || 0);
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
      const totalStock = calculateTotalStock();
      
      const updateData = {
        name: formData.name.toUpperCase(),
        category: formData.category.toUpperCase(),
        basePrice: parseFloat(formData.basePrice),
        description: formData.description,
        imageUrls: [formData.imageUrl],
        stockMatrix: stockMatrix,
        stockQuantity: totalStock,
        sizes: Object.keys(stockMatrix).filter(s => Object.values(stockMatrix[s]).some(q => q > 0)),
        details: detailsArray,
        slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
        updatedAt: new Date().toISOString()
      };

      await updateDoc(doc(db, 'products', id), updateData);

      toast({
        title: "MODULE UPDATED",
        description: "ASSEMBLAGE CONFIGURATION SAVED TO VOID.",
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

  if (isUserLoading || !mounted) {
    return <div className="h-screen flex items-center justify-center text-[10px] tracking-[1em] uppercase text-white/40">Authenticating Protocol...</div>;
  }

  if (productLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white/20" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen text-white">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="space-y-4 mb-16">
          <Link href="/admin/products" className="flex items-center gap-2 text-[10px] text-white/80 hover:text-white transition-colors uppercase tracking-widest mb-4 font-bold">
            <ChevronLeft className="w-3 h-3" />
            BACK TO ASSEMBLAGES
          </Link>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight glow-text uppercase leading-none">Module Command</h1>
          <p className="text-[10px] text-white/40 font-mono tracking-widest uppercase">UID: {id}</p>
        </div>

        <Tabs defaultValue="reconfigure" className="space-y-12">
          <TabsList className="bg-white/5 border border-white/10 rounded-none p-1 h-14 w-full md:w-auto grid grid-cols-2 md:inline-flex">
            <TabsTrigger value="reconfigure" className="rounded-none text-[10px] tracking-[0.4em] font-bold uppercase h-full data-[state=active]:bg-white data-[state=active]:text-black">RECONFIGURE</TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-none text-[10px] tracking-[0.4em] font-bold uppercase h-full data-[state=active]:bg-white data-[state=active]:text-black">SALES AUDIT</TabsTrigger>
          </TabsList>

          <TabsContent value="reconfigure">
            <form onSubmit={handleSubmit} className="bg-white/[0.02] border border-white/5 p-12 space-y-12 backdrop-blur-xl">
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">MODULE NAME</label>
                  <Input 
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest focus:border-white/40 text-white"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">CATEGORY</label>
                  <Input 
                    required
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest focus:border-white/40 text-white"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">BASE PRICE (₹)</label>
                  <Input 
                    required
                    type="number"
                    value={formData.basePrice}
                    onChange={e => setFormData({ ...formData, basePrice: e.target.value })}
                    className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest focus:border-white/40 text-white"
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
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                    <div key={size} className="space-y-6 p-6 border border-white/5 bg-white/[0.01]">
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-black tracking-widest text-white/80">{size}</span>
                        <div className="flex gap-2">
                          <Input 
                            placeholder="COLOR NAME" 
                            value={newColor[size] || ''}
                            onChange={e => setNewColor({...newColor, [size]: e.target.value})}
                            className="h-10 w-40 bg-black/40 border-white/10 text-[9px] tracking-widest uppercase rounded-none text-white"
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
                                className="h-8 bg-transparent border-0 border-b border-white/10 focus:border-white/40 text-[10px] p-0 rounded-none font-mono text-white"
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
                <label className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">VISUAL UPLINK (IMAGE)</label>
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
                        <Upload className="w-8 h-8 text-white/40 mb-2" />
                        <span className="text-[8px] tracking-[0.2em] text-white/40 uppercase font-bold text-center px-4">LOCAL STORAGE UPLOAD</span>
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
                <label className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">NEURAL DESCRIPTION</label>
                <Textarea 
                  required
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="bg-black/40 border-white/10 rounded-none min-h-[120px] text-[10px] tracking-widest focus:border-white/40 text-white"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">SPECIFICATIONS (ONE PER LINE)</label>
                <Textarea 
                  value={formData.details}
                  onChange={e => setFormData({ ...formData, details: e.target.value })}
                  className="bg-black/40 border-white/10 rounded-none min-h-[120px] text-[10px] tracking-widest focus:border-white/40 text-white"
                  placeholder="WATERPROOF SHELL&#10;NEON FIBER OPTICS"
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
          </TabsContent>

          <TabsContent value="analytics" className="space-y-12">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/[0.02] border border-white/10 p-8 space-y-4">
                <div className="flex justify-between items-start">
                   <DollarSign className="w-5 h-5 text-white/40" />
                   <TrendingUp className="w-4 h-4 text-green-500/60" />
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] tracking-[0.4em] text-white/60 uppercase font-bold">TOTAL REVENUE</p>
                   <p className="text-3xl font-bold tracking-tighter glow-text uppercase">₹{stats.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
              <div className="bg-white/[0.02] border border-white/10 p-8 space-y-4">
                <div className="flex justify-between items-start">
                   <ShoppingBag className="w-5 h-5 text-white/40" />
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] tracking-[0.4em] text-white/60 uppercase font-bold">UNITS DISPATCHED</p>
                   <p className="text-3xl font-bold tracking-tighter glow-text uppercase">{stats.unitsSold}</p>
                </div>
              </div>
              <div className="bg-white/[0.02] border border-white/10 p-8 space-y-4">
                <div className="flex justify-between items-start">
                   <Users className="w-5 h-5 text-white/40" />
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] tracking-[0.4em] text-white/60 uppercase font-bold">UNIQUE OPERATORS</p>
                   <p className="text-3xl font-bold tracking-tighter uppercase">{sales?.length || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 overflow-hidden backdrop-blur-xl">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/60">OPERATOR</th>
                    <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/60">ORDER_ID</th>
                    <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/60">ACQUISITION_TIME</th>
                    <th className="px-10 py-6 text-[10px] font-bold tracking-[0.3em] uppercase text-white/60 text-right">QUANTITY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {salesLoading ? (
                    <tr><td colSpan={4} className="px-10 py-12 text-center text-white/20 uppercase tracking-[0.5em]">Syncing Logs...</td></tr>
                  ) : sales && sales.length > 0 ? (
                    sales.map((order) => {
                      const item = order.items?.find((i: any) => i.productId === id);
                      return (
                        <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-10 py-8">
                            <div className="space-y-1">
                               <span className="text-[10px] font-bold tracking-widest text-white uppercase">{order.displayName || 'UNIDENTIFIED'}</span>
                               <p className="text-[8px] text-white/40 font-mono tracking-widest">{order.userId.slice(0, 12)}</p>
                            </div>
                          </td>
                          <td className="px-10 py-8 text-[10px] font-mono text-white/80 tracking-widest uppercase">
                            {order.order_ID || order.id}
                          </td>
                          <td className="px-10 py-8">
                            <div className="flex items-center gap-3 text-white/60">
                               <Calendar className="w-3 h-3" />
                               <span className="text-[9px] font-bold tracking-widest">{new Date(order.orderDate).toLocaleString()}</span>
                            </div>
                          </td>
                          <td className="px-10 py-8 text-right text-[11px] font-black tracking-widest text-white">
                            {item?.quantity || 1}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-10 py-32 text-center opacity-40">
                         <div className="flex flex-col items-center gap-6">
                            <ShoppingBag className="w-12 h-12 stroke-[0.5px]" />
                            <p className="text-[10px] tracking-[1em] uppercase font-bold">NO SALES DETECTED IN THE VOID</p>
                         </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
