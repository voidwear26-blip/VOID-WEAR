export default function PrivacyPolicyPage() {
  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen text-black">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="space-y-16">
          <div className="space-y-4 text-center md:text-left">
            <span className="text-[10px] font-bold tracking-[0.8em] text-black/60 uppercase">PRIVACY POLICY</span>
            <h1 className="text-4xl md:text-7xl font-black tracking-tight uppercase leading-none">Your Data</h1>
            <p className="text-black/60 tracking-widest text-sm leading-relaxed uppercase max-w-2xl font-light">
              This page outlines how VOID WEAR handles your personal information and order data within our network.
            </p>
          </div>

          <div className="space-y-12 bg-black/[0.01] border border-black/5 p-12 backdrop-blur-md">
            <section className="space-y-4">
              <h2 className="text-lg font-bold tracking-[0.3em] uppercase border-b border-black/10 pb-2">01. Information Collection</h2>
              <p className="text-xs text-black/70 tracking-widest leading-relaxed uppercase">
                To process your orders, we collect specific information including your name, email, and shipping address. This data is essential for delivering our premium apparel to you.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-bold tracking-[0.3em] uppercase border-b border-black/10 pb-2">02. Data Security</h2>
              <p className="text-xs text-black/70 tracking-widest leading-relaxed uppercase">
                All data is processed using standard encryption methods. Your passwords are encrypted at the system level. VOID WEAR staff do not have access to your personal login credentials.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-bold tracking-[0.3em] uppercase border-b border-black/10 pb-2">03. Usage Analytics</h2>
              <p className="text-xs text-black/70 tracking-widest leading-relaxed uppercase">
                We monitor site performance and customer interactions to improve your experience. This includes tracking purchase patterns and feedback to refine our clothing collection.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-bold tracking-[0.3em] uppercase border-b border-black/10 pb-2">04. Account Control</h2>
              <p className="text-xs text-black/70 tracking-widest leading-relaxed uppercase">
                Every customer has control over their account. You may request to delete your account by contacting our support team, which will result in the permanent removal of your data from our records.
              </p>
            </section>

            <div className="pt-10 flex items-center gap-4 opacity-40">
              <div className="h-[1px] flex-1 bg-black/20"></div>
              <span className="text-[8px] font-black tracking-[0.5em] uppercase">SYSTEM VERSION 1.0 // 2026</span>
              <div className="h-[1px] flex-1 bg-black/20"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
