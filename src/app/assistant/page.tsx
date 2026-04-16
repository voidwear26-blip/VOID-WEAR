import { AIAssistant } from '@/components/ai-assistant';

export default function AssistantPage() {
  return (
    <div className="pt-32 bg-transparent min-h-screen">
      <div className="container mx-auto px-6 pt-20">
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter glow-text uppercase">Neural Stylist</h1>
          <p className="text-white/40 tracking-[0.4em] text-xs uppercase">Experimental AI Interface v0.1.2</p>
        </div>
      </div>
      <AIAssistant />
      <div className="container mx-auto px-6 pb-32">
        <div className="grid md:grid-cols-3 gap-12 mt-24">
          <div className="p-8 border border-white/5 space-y-4 backdrop-blur-sm bg-white/[0.02]">
            <h3 className="text-xs font-bold tracking-widest uppercase">Contextual Analysis</h3>
            <p className="text-[10px] text-white/40 tracking-widest leading-relaxed uppercase">Our engine analyzes style prompts against current seasonal aesthetics and virtual environment requirements.</p>
          </div>
          <div className="p-8 border border-white/5 space-y-4 backdrop-blur-sm bg-white/[0.02]">
            <h3 className="text-xs font-bold tracking-widest uppercase">Modular Suggestion</h3>
            <p className="text-[10px] text-white/40 tracking-widest leading-relaxed uppercase">Each suggestion is broken down into base modules, outer shells, and tactical accessories.</p>
          </div>
          <div className="p-8 border border-white/5 space-y-4 backdrop-blur-sm bg-white/[0.02]">
            <h3 className="text-xs font-bold tracking-widest uppercase">Real-time Rendering</h3>
            <p className="text-[10px] text-white/40 tracking-widest leading-relaxed uppercase">Leveraging advanced LLMs to translate human creative input into precise technical assemblages.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
