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
                We facilitate high-speed delivery across the Indian sub-continent. Our logistics network utilizes secure surface and aerial couriers to ensure your assembly reaches your coordinates within the specified transit windows.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold tracking-widest uppercase">Encrypted Tracking</h2>
              <p className="text-sm text-white/80 tracking-widest leading-relaxed uppercase">
                Once your order is processed, you will receive a unique neural key to track your shipment's progress through the void. All data is encrypted with 256-bit quantum security.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold tracking-widest uppercase">Integration Finality (Returns)</h2>
              <p className="text-sm text-white/80 tracking-widest leading-relaxed uppercase">
                VOID WEAR assemblages are final transmissions. Once a module integrates with your form, the bond is permanent. We maintain a <span className="text-white font-bold">NO RETURN POLICY</span>. For critical anomalies or to initiate the "Sympathy Protocol," please contact our primary uplink nodes.
              </p>
            </section>

            <div className="p-10 border border-white/10 bg-white/[0.02] backdrop-blur-md">
              <h3 className="text-xs font-bold tracking-widest uppercase mb-6 text-white/90">Current Transit Times</h3>
              <ul className="space-y-4 text-[10px] text-white/70 tracking-widest uppercase font-bold">
                <li className="flex justify-between border-b border-white/5 pb-2">
                  <span>Within State (Tamil Nadu)</span>
                  <span className="text-white">3-5 Cycles</span>
                </li>
                <li className="flex justify-between border-b border-white/5 pb-2">
                  <span>Other States (Regional Clusters)</span>
                  <span className="text-white">5-7 Cycles</span>
                </li>
                <li className="flex justify-between border-b border-white/5 pb-2">
                  <span>Remote Frontier Nodes (North India)</span>
                  <span className="text-white">8-10 Cycles</span>
                </li>
                <li className="flex justify-between pt-4 opacity-50">
                  <span className="text-[8px] italic">Cycles represent standard business days.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
