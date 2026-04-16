import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto space-y-32">
          <div className="space-y-8 text-center md:text-left">
            <span className="text-xs font-bold tracking-[0.6em] text-white/40 uppercase">OUR STORY // MANIFESTO</span>
            <h1 className="text-5xl md:text-8xl font-bold tracking-tight glow-text uppercase leading-none">Born in the <br /> Digital Void</h1>
            <p className="text-xl md:text-2xl text-white/60 font-light tracking-widest leading-relaxed uppercase">
              VOID WEAR is more than apparel. It is the uniform for the digital migration. We create technical shells for those who navigate the intersection of physical and virtual space.
            </p>
          </div>

          <div className="relative aspect-video bg-white/5 overflow-hidden">
            <Image 
              src="https://picsum.photos/seed/voidabout/1920/1080" 
              alt="VOID WEAR Concept" 
              fill 
              className="object-cover grayscale opacity-50"
              data-ai-hint="futuristic city"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-[10px] tracking-[1em] font-bold border border-white/20 px-8 py-4 backdrop-blur-md">
                EST. 2024 / NEO-TOKYO
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-24">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-widest uppercase">The Philosophy</h2>
              <p className="text-sm text-white/40 tracking-widest leading-relaxed uppercase">
                We believe that as our identities become increasingly digital, our physical forms require a new kind of protective layer. VOID WEAR utilizes geometric architecture and monochromatic palettes to provide a neutral base for complex digital personas.
              </p>
            </div>
            <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-widest uppercase">Technical Superiority</h2>
              <p className="text-sm text-white/40 tracking-widest leading-relaxed uppercase">
                Every stitch is optimized for range of motion in high-density urban environments. We source materials from orbital manufacturing facilities to ensure unparalleled durability and lightweight performance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
