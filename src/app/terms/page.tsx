export default function TermsPage() {
  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen text-black">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="space-y-16">
          <div className="space-y-4 text-center md:text-left">
            <span className="text-[10px] font-bold tracking-[0.8em] text-black/60 uppercase">LEGAL TERMS</span>
            <h1 className="text-4xl md:text-7xl font-black tracking-tight uppercase leading-none">Terms of Service</h1>
            <p className="text-black/60 tracking-widest text-sm leading-relaxed uppercase max-w-2xl font-light">
              This is the binding agreement between you and VOID WEAR.
            </p>
          </div>

          <div className="space-y-12 bg-black/[0.01] border border-black/5 p-12 backdrop-blur-md">
            <section className="space-y-4">
              <h2 className="text-lg font-bold tracking-[0.3em] uppercase border-b border-black/10 pb-2">01. User Eligibility</h2>
              <p className="text-xs text-black/70 tracking-widest leading-relaxed uppercase">
                Access to the VOID WEAR website is for individuals who can form legally binding contracts. By creating an account, you confirm that all information provided is accurate and truthful.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-bold tracking-[0.3em] uppercase border-b border-black/10 pb-2">02. Final Sales</h2>
              <p className="text-xs text-black/70 tracking-widest leading-relaxed uppercase">
                All purchases at VOID WEAR are final. Due to the high-quality materials and specific manufacturing used, we maintain a strict NO-RETURN policy. Correct delivery details are the responsibility of the customer.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-bold tracking-[0.3em] uppercase border-b border-black/10 pb-2">03. Ownership</h2>
              <p className="text-xs text-black/70 tracking-widest leading-relaxed uppercase">
                The visual design, style, and content on this site are the exclusive property of VOID WEAR INC. Unauthorized use or copying of these assets is strictly prohibited.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-bold tracking-[0.3em] uppercase border-b border-black/10 pb-2">04. Account Termination</h2>
              <p className="text-xs text-black/70 tracking-widest leading-relaxed uppercase">
                VOID WEAR reserves the right to close any account without notice if the user is found to be violating our policies or engaging in harmful activity.
              </p>
            </section>

            <div className="p-8 border border-red-500/20 bg-red-500/5 space-y-4">
               <h4 className="text-[10px] font-black tracking-[0.4em] text-red-500 uppercase">IMPORTANT NOTICE</h4>
               <p className="text-[9px] text-black/60 tracking-[0.2em] leading-relaxed uppercase">
                 BY USING THIS WEBSITE, YOU AGREE TO ALL TERMS LISTED ABOVE. FAILURE TO COMPLY MAY RESULT IN BEING BLOCKED FROM FUTURE PURCHASES.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
