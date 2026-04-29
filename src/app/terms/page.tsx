export default function TermsPage() {
  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen text-white">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="space-y-16">
          <div className="space-y-4 text-center md:text-left">
            <span className="text-[10px] font-bold tracking-[0.8em] text-white/40 uppercase">LEGAL // INTEGRITY</span>
            <h1 className="text-4xl md:text-7xl font-black tracking-tight glow-text uppercase leading-none">Terms of <br /> Service</h1>
            <p className="text-white/60 tracking-widest text-sm leading-relaxed uppercase max-w-2xl font-light">
              Establishment of the binding contract between the Operator and the VOID WEAR System Intelligence.
            </p>
          </div>

          <div className="space-y-12 bg-white/[0.01] border border-white/5 p-12 backdrop-blur-md">
            <section className="space-y-4">
              <h2 className="text-lg font-bold tracking-[0.3em] uppercase border-b border-white/10 pb-2">01. Entity Eligibility</h2>
              <p className="text-xs text-white/60 tracking-widest leading-relaxed uppercase">
                Access to the VOID WEAR network is restricted to operators capable of forming legally binding digital contracts. By establishing a link, you affirm that all identity nodes provided are accurate and authenticated.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-bold tracking-[0.3em] uppercase border-b border-white/10 pb-2">02. Transmission Finality</h2>
              <p className="text-xs text-white/60 tracking-widest leading-relaxed uppercase">
                All acquisitions within the VOID WEAR catalogue are final. Due to the technical nature of our assemblages and the orbital manufacturing protocols involved, we maintain a strict NO-RETURN policy. Errors in logistical coordinates are the responsibility of the operator.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-bold tracking-[0.3em] uppercase border-b border-white/10 pb-2">03. Intellectual Property</h2>
              <p className="text-xs text-white/60 tracking-widest leading-relaxed uppercase">
                The visual architecture, geometric forms, and cinematic narratives within this site are the exclusive property of VOID WEAR INC. Unauthorized duplication or neural extraction of these assets is strictly prohibited.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-bold tracking-[0.3em] uppercase border-b border-white/10 pb-2">04. System Overrides</h2>
              <p className="text-xs text-white/60 tracking-widest leading-relaxed uppercase">
                VOID WEAR reserves the right to sever any identity link without notice if the operator is found to be in violation of network security protocols or engaging in malicious transmission activity.
              </p>
            </section>

            <div className="p-8 border border-red-500/20 bg-red-500/5 space-y-4">
               <h4 className="text-[10px] font-black tracking-[0.4em] text-red-500 uppercase">CRITICAL ADVISORY</h4>
               <p className="text-[9px] text-white/40 tracking-[0.2em] leading-relaxed uppercase">
                 BY CONTINUING YOUR MIGRATION THROUGH THIS SYSTEM, YOU ACKNOWLEDGE AND ACCEPT ALL TERMS LISTED ABOVE. FAILURE TO COMPLY WILL RESULT IN PERMANENT BLACKLISTING FROM THE FRONTIER NODES.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
