export default function ShippingPage() {
  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen text-black">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="space-y-16">
          <div className="space-y-4 text-center md:text-left">
            <span className="text-xs font-bold tracking-[0.6em] text-black/60 uppercase">DELIVERY // RULES</span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight uppercase">Shipping Details</h1>
          </div>

          <div className="space-y-12">
            <section className="space-y-4">
              <h2 className="text-xl font-bold tracking-widest uppercase">Shipping Across India</h2>
              <p className="text-sm text-black/80 tracking-widest leading-relaxed uppercase">
                We provide fast delivery across the Indian sub-continent. Our delivery network uses reliable local couriers to ensure your items reach you within the specified timeframes.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold tracking-widest uppercase">Order Tracking</h2>
              <p className="text-sm text-black/80 tracking-widest leading-relaxed uppercase">
                Once your order is processed, you will receive a unique tracking number to monitor your shipment's progress. All data is handled with standard security protocols.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold tracking-widest uppercase">Final Sale (Returns)</h2>
              <p className="text-sm text-black/80 tracking-widest leading-relaxed uppercase">
                VOID WEAR items are final sales. We maintain a <span className="font-bold">NO RETURN POLICY</span>. For critical issues or to contact our support team, please reach out through our contact page.
              </p>
            </section>

            <div className="p-10 border border-black/10 bg-black/[0.02] backdrop-blur-md">
              <h3 className="text-xs font-bold tracking-widest uppercase mb-6 text-black/80">Current Delivery Times</h3>
              <ul className="space-y-4 text-[10px] text-black/70 tracking-widest uppercase font-bold">
                <li className="flex justify-between border-b border-black/5 pb-2">
                  <span>Within State (Tamil Nadu)</span>
                  <span className="text-black">3-5 Days</span>
                </li>
                <li className="flex justify-between border-b border-black/5 pb-2">
                  <span>Other States</span>
                  <span className="text-black">5-7 Days</span>
                </li>
                <li className="flex justify-between border-b border-black/5 pb-2">
                  <span>Remote Regions</span>
                  <span className="text-black">8-10 Days</span>
                </li>
                <li className="flex justify-between pt-4 opacity-70">
                  <span className="text-[8px] italic">Timeframes represent standard business days.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
