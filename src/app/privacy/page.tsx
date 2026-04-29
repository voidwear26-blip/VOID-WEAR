export default function PrivacyPolicyPage() {
  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen text-white">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="space-y-16">
          <div className="space-y-4 text-center md:text-left">
            <span className="text-[10px] font-bold tracking-[0.8em] text-white/40 uppercase">DATA // PROTOCOLS</span>
            <h1 className="text-4xl md:text-7xl font-black tracking-tight glow-text uppercase leading-none">Privacy <br /> Architecture</h1>
            <p className="text-white/60 tracking-widest text-sm leading-relaxed uppercase max-w-2xl font-light">
              This manifesto outlines how VOID WEAR handles your digital identity and transmission metadata within the network.
            </p>
          </div>

          <div className="space-y-12 bg-white/[0.01] border border-white/5 p-12 backdrop-blur-md">
            <section className="space-y-4">
              <h2 className="text-lg font-bold tracking-[0.3em] uppercase border-b border-white/10 pb-2">01. Identity Collection</h2>
              <p className="text-xs text-white/60 tracking-widest leading-relaxed uppercase">
                To facilitate mission-critical transmissions, we collect specific identity nodes including your name, comm-channel (email), and logistical coordinates. This data is essential for linking your physical form to our technical assemblages.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-bold tracking-[0.3em] uppercase border-b border-white/10 pb-2">02. Neural Security</h2>
              <p className="text-xs text-white/60 tracking-widest leading-relaxed uppercase">
                All data packets are processed via 256-bit quantum-resistant encryption. Your Access Keys (passwords) are salted and hashed at the architectural level. VOID WEAR personnel never have access to raw credential strings.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-bold tracking-[0.3em] uppercase border-b border-white/10 pb-2">03. Transmission Analytics</h2>
              <p className="text-xs text-white/60 tracking-widest leading-relaxed uppercase">
                We monitor system performance and operator interactions to optimize the digital migration. This includes tracking acquisition cycles and field report data to refine our technical shells.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-bold tracking-[0.3em] uppercase border-b border-white/10 pb-2">04. Dossier Autonomy</h2>
              <p className="text-xs text-white/60 tracking-widest leading-relaxed uppercase">
                Every operator maintains absolute authority over their digital dossier. You may initiate a "Total Data Purge" by contacting our primary uplink nodes, which will result in the permanent severance of all mission logs.
              </p>
            </section>

            <div className="pt-10 flex items-center gap-4 opacity-30">
              <div className="h-[1px] flex-1 bg-white/20"></div>
              <span className="text-[8px] font-black tracking-[0.5em] uppercase">SYSTEM MANIFESTO V1.0 // 2026</span>
              <div className="h-[1px] flex-1 bg-white/20"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
