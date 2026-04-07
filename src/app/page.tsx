
import { Hero } from '@/components/hero';
import { ProductCard } from '@/components/product-card';
import { AIAssistant } from '@/components/ai-assistant';
import { products } from '@/app/lib/products';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-0">
      <Hero />
      
      {/* Product Collection Section */}
      <section className="py-32 bg-black">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div className="space-y-4">
              <span className="text-xs font-bold tracking-[0.6em] text-white/40">CATALOGUE // SEASON 01</span>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight glow-text uppercase">Latest Assemblages</h2>
            </div>
            <Link href="/products" className="text-xs font-bold tracking-[0.4em] text-white/40 hover:text-white transition-colors border-b border-white/10 pb-2">
              VIEW ALL PRODUCTS
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <AIAssistant />

      {/* Footer / Social Section */}
      <footer className="py-32 bg-black border-t border-white/5">
        <div className="container mx-auto px-6 grid md:grid-cols-4 gap-16">
          <div className="md:col-span-2 space-y-8">
            <Link href="/" className="text-2xl font-bold tracking-[0.5em]">VOID WEAR</Link>
            <p className="text-white/40 text-sm max-w-sm tracking-widest leading-relaxed uppercase">
              REDEFINING APPAREL FOR THE ERA OF ACCELERATION. DESIGNED IN THE VOID, CRAFTED FOR THE WORLD.
            </p>
            <div className="flex gap-8">
              {['INSTAGRAM', 'TWITTER', 'DISCORD', 'TELEGRAM'].map((social) => (
                <a 
                  key={social} 
                  href="#" 
                  className="text-[10px] tracking-widest text-white/40 hover:text-white hover:glow-text transition-all duration-300"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-xs font-bold tracking-[0.3em]">RESOURCES</h4>
            <div className="flex flex-col gap-4 text-[10px] text-white/40 tracking-widest uppercase">
              <Link href="/shipping" className="hover:text-white transition-colors">Shipping & Returns</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Protocol</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-bold tracking-[0.3em]">NEWSLETTER</h4>
            <p className="text-[10px] text-white/40 tracking-widest leading-relaxed">JOIN THE TRANSMISSION FOR EARLY ACCESS TO DROPS.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="EMAIL ADDRESS" 
                className="bg-white/5 border border-white/10 px-4 py-2 text-[10px] tracking-widest flex-1 focus:outline-none focus:border-white/40"
              />
              <button className="bg-white text-black px-6 py-2 text-[10px] font-bold tracking-widest hover:bg-white/90">JOIN</button>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-6 mt-32 pt-16 border-t border-white/5 text-center">
          <p className="text-[10px] text-white/20 tracking-[1em]">© 2024 VOID WEAR INC. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  );
}
