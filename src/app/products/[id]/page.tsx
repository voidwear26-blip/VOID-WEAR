
import Image from 'next/image';
import { products } from '@/app/lib/products';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ChevronRight, Share2, Heart } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function ProductPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const product = products.find(p => p.id === id);

  if (!product) {
    notFound();
  }

  return (
    <div className="pt-32 pb-24 bg-transparent">
      <div className="container mx-auto px-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-4 text-[10px] tracking-[0.3em] text-white/40 mb-12 uppercase">
          <Link href="/" className="hover:text-white transition-colors">HOME</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/products" className="hover:text-white transition-colors">COLLECTION</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-white">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-24 items-start">
          {/* Image Gallery */}
          <div className="space-y-8">
            <div className="relative aspect-[3/4] bg-white/5 group cursor-zoom-in overflow-hidden border border-white/5">
              <Image 
                src={product.image} 
                alt={product.name} 
                fill 
                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
                priority
              />
              <div className="absolute top-8 right-8 flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <Button variant="ghost" size="icon" className="bg-black/50 backdrop-blur-md rounded-none hover:bg-white hover:text-black border border-white/10">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="bg-black/50 backdrop-blur-md rounded-none hover:bg-white hover:text-black border border-white/10">
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="relative aspect-[3/4] bg-white/5 cursor-pointer opacity-60 hover:opacity-100 transition-opacity border border-white/5">
                   <Image src={product.image} alt={product.name} fill className="object-cover grayscale" />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-12 lg:sticky lg:top-32">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-[10px] font-bold tracking-[0.5em] text-white/40 uppercase">
                <span className="w-8 h-[1px] bg-white/40"></span>
                {product.category}
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight glow-text uppercase">{product.name}</h1>
              <p className="text-2xl font-light tracking-widest text-white/80">${product.price}</p>
            </div>

            <p className="text-sm tracking-widest leading-relaxed text-white/60 uppercase">
              {product.description}
            </p>

            <div className="space-y-8">
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase">SELECT SIZE</h4>
                <div className="flex flex-wrap gap-4">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                    <button 
                      key={size} 
                      className="w-14 h-14 border border-white/20 flex items-center justify-center text-[10px] font-bold tracking-widest hover:border-white transition-all bg-white/[0.02] backdrop-blur-sm"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button className="flex-1 bg-white text-black hover:bg-white/90 h-20 text-xs font-bold tracking-[0.5em] rounded-none group shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                  ADD TO BAG
                  <ShoppingBag className="ml-4 w-4 h-4 group-hover:scale-110 transition-transform" />
                </Button>
                <Button variant="outline" size="icon" className="w-20 h-20 border-white/20 hover:bg-white hover:text-black rounded-none bg-transparent">
                  <Heart className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="border-t border-white/10 pt-12 space-y-8">
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase">SPECIFICATIONS</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] tracking-widest text-white/40">
                  {product.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center gap-3 uppercase">
                      <span className="w-1 h-1 bg-white rounded-full"></span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase">SHIPPING PROTOCOL</h4>
                <p className="text-[10px] tracking-widest text-white/40 leading-relaxed uppercase">
                  GLOBAL EXPEDITION AVAILABLE. DELIVERY WITHIN 3-5 ORBITAL CYCLES. SECURE NEURAL ENCRYPTION ON ALL TRANSACTIONS.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
