
'use client';

import { useFirestore, useDoc, useMemoFirebase, useUser, useCollection } from '@/firebase';
import { doc, updateDoc, collectionGroup, query, where } from 'firebase/firestore';
import { ChevronLeft, Save, Loader2, Upload, Trash2, TrendingUp, DollarSign, Users, ShoppingBag, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';

export default function ProductAdminDetail({ params }: { params: Promise<{ id: string }> }) {
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

  // Fetch all orders containing this product
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
                    className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest focus:border-white/40"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">CATEGORY</label>
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
                  <label className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">BASE PRICE (₹)</label>
                  <Input 
                    required
                    type="number"
                    value={formData.basePrice}
                    onChange={e => setFormData({ ...formData, basePrice: e.target.value })}
                    className="bg-black/40 border-white/10 rounded-none h-14 text-[10px] tracking-widest focus:border-white/40"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">COLOR</label>
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
                  <label className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">STOCK CONFIGURATION</label>
                  <span className="text-[10px] font-bold tracking-[0.2em] text-white/80">TOTAL ASSEMBLAGE: {totalStock}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
                  {Object.keys(stockBySize).map(size => (
                    <div key={size} className="space-y-2">
                      <Label className="text-[9px] tracking-widest text-white/60 font-bold uppercase">{size}</Label>
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
                  className="bg-black/40 border-white/10 rounded-none min-h-[120px] text-[10px] tracking-widest focus:border-white/40"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">SPECIFICATIONS (ONE PER LINE)</label>
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
                   <p className="text-3xl font-bold tracking-tighter glow-text uppercase">{sales?.length || 0}</p>
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
                            {order.id}
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
