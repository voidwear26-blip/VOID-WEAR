
import { Hero } from '@/components/hero';
import { ProductCard } from '@/components/product-card';
import { AIAssistant } from '@/components/ai-assistant';
import { products } from '@/app/lib/products';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-0 bg-black">
      <Hero />
      
      {/* Featured Collection Section */}
      <section className="py-48 bg-black relative">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-32">
            <div className="space-y-6">
              <span className="text-[10px] font-bold tracking-[0.8em] text-white/20 uppercase">CATALOGUE // SEASON 01</span>
              <h2 className="text-5xl md:text-7xl font-bold tracking-tighter glow-text uppercase leading-none">
                LATEST <br /> ASSEMBLAGES
              </h2>
            </div>
            <Link href="/products" className="text-[10px] font-bold tracking-[0.5em] text-white/40 hover:text-white transition-all duration-500 border-b border-white/5 hover:border-white pb-4">
              VIEW FULL COLLECTION
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
            {products.slice(0, 6).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
        
        {/* Background Decorative Element */}
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
      </section>

      {/* Experimental AI Lab Section */}
      <div className="relative border-y border-white/5">
        <div className="absolute top-0 left-0 w-1/2 h-full bg-white/[0.02] blur-3xl pointer-events-none"></div>
        <AIAssistant />
      </div>

      {/* Brand Manifesto Section */}
      <section className="py-64 bg-black overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-16">
            <span className="text-[10px] tracking-[1em] text-white/20 uppercase">MANIFESTO</span>
            <h3 className="text-3xl md:text-5xl font-light tracking-[0.2em] leading-relaxed uppercase">
              WE ARE THE SHELL <br /> FOR YOUR <span className="text-white font-bold glow-text">DIGITAL MIGRATION</span>. 
              MINIMAL ARCHITECTURE FOR COMPLEX IDENTITIES.
            </h3>
            <div className="w-[1px] h-32 bg-gradient-to-b from-white to-transparent mx-auto"></div>
          </div>
        </div>
      </section>

      {/* Immersive Footer */}
      <footer className="py-48 bg-black border-t border-white/5">
        <div className="container mx-auto px-6 grid md:grid-cols-4 gap-24">
          <div className="md:col-span-2 space-y-12">
            <Link href="/" className="text-3xl font-black tracking-[0.3em] glow-text">VOID WEAR</Link>
            <p className="text-white/30 text-[10px] max-w-sm tracking-[0.4em] leading-loose uppercase font-light">
              REDEFINING APPAREL FOR THE ERA OF ACCELERATION. DESIGNED IN THE VOID, CRAFTED FOR THE WORLD. EST 2024.
            </p>
            <div className="flex flex-wrap gap-12">
              {['INSTAGRAM', 'TWITTER', 'DISCORD', 'TELEGRAM'].map((social) => (
                <a 
                  key={social} 
                  href="#" 
                  className="text-[9px] font-bold tracking-[0.4em] text-white/20 hover:text-white transition-all duration-300 hover:glow-text"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
          
          <div className="space-y-8">
            <h4 className="text-[10px] font-bold tracking-[0.5em] text-white/40 uppercase">RESOURCES</h4>
            <div className="flex flex-col gap-6 text-[9px] text-white/20 tracking-[0.3em] uppercase">
              <Link href="/shipping" className="hover:text-white transition-colors">Shipping & Returns</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Protocol</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="text-[10px] font-bold tracking-[0.5em] text-white/40 uppercase">TRANSMISSIONS</h4>
            <p className="text-[9px] text-white/20 tracking-[0.3em] leading-relaxed uppercase">JOIN THE GRID FOR EARLY ACCESS TO DROPS.</p>
            <div className="flex gap-2 border-b border-white/10 pb-4">
              <input 
                type="email" 
                placeholder="EMAIL@CHANNEL.COM" 
                className="bg-transparent px-0 py-2 text-[9px] tracking-[0.4em] flex-1 focus:outline-none placeholder:text-white/10"
              />
              <button className="text-[9px] font-bold tracking-[0.5em] text-white hover:glow-text">JOIN</button>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-6 mt-48 text-center">
          <p className="text-[8px] text-white/10 tracking-[1.5em] uppercase">© 2024 VOID WEAR INC. SECURED TRANSMISSION.</p>
        </div>
      </footer>
    </div>
  );
}
