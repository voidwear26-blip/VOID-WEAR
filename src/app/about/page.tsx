import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto space-y-32">
          <div className="space-y-8 text-center md:text-left">
            <span className="text-xs font-bold tracking-[0.6em] text-black/60 uppercase">OUR STORY</span>
            <h1 className="text-5xl md:text-8xl font-bold tracking-tight uppercase leading-none">Born in the <br /> Digital Age</h1>
            <p className="text-xl md:text-2xl text-black/80 font-light tracking-widest leading-relaxed uppercase">
              VOID WEAR is more than apparel. It is the uniform for everyday life. We create premium clothing for those who value minimalist design and modern style.
            </p>
          </div>

          <div className="relative aspect-video bg-black/5 overflow-hidden">
            <Image 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Vellore_Fort.png/960px-Vellore_Fort.png?_=20220903153718" 
              alt="VOID WEAR Concept" 
              fill 
              className="object-cover grayscale opacity-50"
              data-ai-hint="futuristic city"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-[10px] tracking-[1em] font-bold border border-black/20 px-8 py-4 backdrop-blur-md text-black">
                EST. 2026 / VELLORE - INDIA
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-24">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-widest uppercase">The Philosophy</h2>
              <p className="text-sm text-black/70 tracking-widest leading-relaxed uppercase">
                We believe that modern life requires a new kind of simplicity. VOID WEAR uses geometric forms and a black-and-white palette to provide a clean base for individual expression.
              </p>
            </div>
            <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-widest uppercase">Quality Excellence</h2>
              <p className="text-sm text-black/70 tracking-widest leading-relaxed uppercase">
                Every detail is optimized for comfort in urban environments. We source premium materials to ensure durability and lightweight performance in every piece we create.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
