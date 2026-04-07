
import { products } from '@/app/lib/products';
import { ProductCard } from '@/components/product-card';

export default function ProductsPage() {
  return (
    <div className="pt-40 pb-32 bg-black min-h-screen">
      <div className="container mx-auto px-6">
        <div className="space-y-4 mb-20">
          <span className="text-xs font-bold tracking-[0.6em] text-white/40 uppercase">FULL CATALOGUE // SEASON 01</span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight glow-text uppercase">The Assemblage</h1>
          <p className="text-white/40 tracking-[0.2em] text-sm uppercase max-w-2xl">
            Explore our complete range of futuristic apparel, designed for the digital frontier and crafted with surgical precision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
