export default function ShippingPage() {
  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="space-y-16">
          <div className="space-y-4 text-center md:text-left">
            <span className="text-xs font-bold tracking-[0.6em] text-white/70 uppercase">LOGISTICS // PROTOCOLS</span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight glow-text uppercase">Shipping Protocol</h1>
          </div>

          <div className="space-y-12">
            <section className="space-y-4">
              <h2 className="text-xl font-bold tracking-widest uppercase">Pan-India Expedition</h2>
              <p className="text-sm text-white/80 tracking-widest leading-relaxed uppercase">
                We facilitate high-speed delivery across the Indian sub-continent. Our logistics network utilizes secure surface and aerial couriers to ensure your assembly reaches you within 2-7 standard cycles.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold tracking-widest uppercase">Encrypted Tracking</h2>
              <p className="text-sm text-white/80 tracking-widest leading-relaxed uppercase">
                Once your order is processed, you will receive a unique neural key to track your shipment's progress through the void. All data is encrypted with 256-bit quantum security.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold tracking-widest uppercase">Return Protocol</h2>
              <p className="text-sm text-white/80 tracking-widest leading-relaxed uppercase">
                If an item does not integrate with your form, you have 14 cycles from the delivery timestamp to initiate a return sequence. All items must be in their original vacuum-sealed packaging.
              </p>
            </section>

            <div className="p-10 border border-white/10 bg-white/[0.02] backdrop-blur-md">
              <h3 className="text-xs font-bold tracking-widest uppercase mb-6 text-white/90">Current Transit Times</h3>
              <ul className="space-y-4 text-[10px] text-white/70 tracking-widest uppercase">
                <li className="flex justify-between border-b border-white/5 pb-2"><span>Metro Clusters (Delhi, Mumbai, Bengaluru)</span><span>1-2 Cycles</span></li>
                <li className="flex justify-between border-b border-white/5 pb-2"><span>Tier 1 Strategic Zones</span><span>2-3 Cycles</span></li>
                <li className="flex justify-between border-b border-white/5 pb-2"><span>Regional Outposts</span><span>3-5 Cycles</span></li>
                <li className="flex justify-between"><span>Remote Frontier Nodes (NE, J&K)</span><span>5-7 Cycles</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}