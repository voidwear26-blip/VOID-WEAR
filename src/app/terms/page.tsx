
export default function TermsPage() {
  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen text-black">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="space-y-16">
          <div className="space-y-4 text-center md:text-left">
            <span className="text-[10px] font-bold tracking-[0.8em] text-black/60 uppercase font-body">LEGAL TERMS</span>
            <h1 className="text-4xl md:text-7xl font-black tracking-tight uppercase leading-none font-headline">Terms of Service</h1>
            <p className="text-black/60 tracking-widest text-sm leading-relaxed uppercase max-w-2xl font-light font-body">
              This is the binding agreement between you and VOID WEAR INC.
            </p>
          </div>

          <div className="space-y-12 bg-black/[0.01] border border-black/5 p-12 backdrop-blur-md">
            <section className="space-y-4">
              <h2 className="text-lg font-bold tracking-[0.3em] uppercase border-b border-black/10 pb-2 font-headline">01. Account Terms</h2>
              <p className="text-xs text-black/70 tracking-widest leading-relaxed uppercase font-body">
                By creating an account, you confirm that all information provided is accurate. You are responsible for keeping your login details safe.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-bold tracking-[0.3em] uppercase border-b border-black/10 pb-2 font-headline">02. No Returns</h2>
              <p className="text-xs text-black/70 tracking-widest leading-relaxed uppercase font-body">
                All purchases at VOID WEAR are final. Due to our high-quality small-batch manufacturing, we maintain a strict NO-RETURN policy. Please double-check your size using our guide.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-bold tracking-[0.3em] uppercase border-b border-black/10 pb-2 font-headline">03. Site Ownership</h2>
              <p className="text-xs text-black/70 tracking-widest leading-relaxed uppercase font-body">
                The visual design, clothing styles, and photos on this site are the exclusive property of VOID WEAR INC. You may not copy or reuse them without our permission.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-bold tracking-[0.3em] uppercase border-b border-black/10 pb-2 font-headline">04. Liability</h2>
              <p className="text-xs text-black/70 tracking-widest leading-relaxed uppercase font-body">
                VOID WEAR is not responsible for issues arising from incorrect shipping addresses provided by the customer. Always ensure your contact details are correct before confirming.
              </p>
            </section>

            <div className="p-8 border border-red-500/20 bg-red-500/5 space-y-4">
               <h4 className="text-[10px] font-black tracking-[0.4em] text-red-500 uppercase font-headline">IMPORTANT</h4>
               <p className="text-[9px] text-black/60 tracking-[0.2em] leading-relaxed uppercase font-body">
                 BY USING THIS WEBSITE, YOU AGREE TO ALL TERMS LISTED ABOVE. FAILURE TO COMPLY MAY RESULT IN ACCOUNT SUSPENSION.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
