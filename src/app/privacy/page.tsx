
export default function PrivacyPolicyPage() {
  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen text-black">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="space-y-16">
          <div className="space-y-4 text-center md:text-left">
            <span className="text-[10px] font-bold tracking-[0.8em] text-black/60 uppercase font-body">PRIVACY POLICY</span>
            <h1 className="text-4xl md:text-7xl font-black tracking-tight uppercase leading-none font-headline">Your Data</h1>
            <p className="text-black/60 tracking-widest text-sm leading-relaxed uppercase max-w-2xl font-light font-body">
              This page outlines how VOID WEAR handles your personal information and order data.
            </p>
          </div>

          <div className="space-y-12 bg-black/[0.01] border border-black/5 p-12 backdrop-blur-md">
            <section className="space-y-4">
              <h2 className="text-lg font-bold tracking-[0.3em] uppercase border-b border-black/10 pb-2 font-headline">01. Information we collect</h2>
              <p className="text-xs text-black/70 tracking-widest leading-relaxed uppercase font-body">
                To process your orders, we collect specific information including your name, email, and shipping address. This data is essential for delivering our premium apparel to you.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-bold tracking-[0.3em] uppercase border-b border-black/10 pb-2 font-headline">02. How we protect you</h2>
              <p className="text-xs text-black/70 tracking-widest leading-relaxed uppercase font-body">
                All data is processed using standard encryption. Your passwords are safe and encrypted; even our staff cannot see them. We prioritize your account security.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-bold tracking-[0.3em] uppercase border-b border-black/10 pb-2 font-headline">03. Improving our service</h2>
              <p className="text-xs text-black/70 tracking-widest leading-relaxed uppercase font-body">
                We monitor site performance to improve your experience. This includes tracking popular items and using feedback to refine our clothing collection.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-bold tracking-[0.3em] uppercase border-b border-black/10 pb-2 font-headline">04. Your control</h2>
              <p className="text-xs text-black/70 tracking-widest leading-relaxed uppercase font-body">
                You have full control over your account. If you wish to delete your data from our system, please contact our support team directly.
              </p>
            </section>

            <div className="pt-10 flex items-center gap-4 opacity-40">
              <div className="h-[1px] flex-1 bg-black/20"></div>
              <span className="text-[8px] font-black tracking-[0.5em] uppercase font-body">VOID WEAR 2026</span>
              <div className="h-[1px] flex-1 bg-black/20"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
