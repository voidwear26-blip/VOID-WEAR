
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MessageSquare, Globe, Zap } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="pt-40 pb-32 bg-black min-h-screen">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-24 max-w-6xl mx-auto">
          <div className="space-y-12">
            <div className="space-y-4">
              <span className="text-xs font-bold tracking-[0.6em] text-white/40 uppercase">COMMUNICATION // UPLINK</span>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight glow-text uppercase">Establish <br /> Connection</h1>
              <p className="text-white/40 tracking-widest text-sm leading-relaxed uppercase max-w-md">
                Reach out to our support team for inquiries regarding orders, technical specifications, or collaboration opportunities.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-6 group">
                <div className="w-12 h-12 border border-white/10 flex items-center justify-center group-hover:border-white transition-colors">
                  <Mail className="w-5 h-5 text-white/40 group-hover:text-white" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold tracking-widest text-white/40">EMAIL PROTOCOL</p>
                  <p className="text-xs tracking-widest">UPLINK@VOIDWEAR.COM</p>
                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <div className="w-12 h-12 border border-white/10 flex items-center justify-center group-hover:border-white transition-colors">
                  <MessageSquare className="w-5 h-5 text-white/40 group-hover:text-white" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold tracking-widest text-white/40">SUPPORT CHANNEL</p>
                  <p className="text-xs tracking-widest">+1 (800) 000-VOID</p>
                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <div className="w-12 h-12 border border-white/10 flex items-center justify-center group-hover:border-white transition-colors">
                  <Globe className="w-5 h-5 text-white/40 group-hover:text-white" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold tracking-widest text-white/40">BASE COMMAND</p>
                  <p className="text-xs tracking-widest">NEO-TOKYO, JP / GRID 7-A</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-12 space-y-8">
            <h3 className="text-xs font-bold tracking-[0.4em] uppercase">TRANSMIT MESSAGE</h3>
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest text-white/40 uppercase">FULL NAME</label>
                  <Input className="bg-black/50 border-white/10 rounded-none h-12 text-xs tracking-widest" placeholder="IDENTIFICATION" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest text-white/40 uppercase">EMAIL ADDRESS</label>
                  <Input className="bg-black/50 border-white/10 rounded-none h-12 text-xs tracking-widest" placeholder="COMM-CHANNEL" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold tracking-widest text-white/40 uppercase">SUBJECT</label>
                <Input className="bg-black/50 border-white/10 rounded-none h-12 text-xs tracking-widest" placeholder="TOPIC" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold tracking-widest text-white/40 uppercase">MESSAGE</label>
                <Textarea className="bg-black/50 border-white/10 rounded-none min-h-[150px] text-xs tracking-widest" placeholder="INPUT DATA..." />
              </div>
              <Button className="w-full bg-white text-black hover:bg-white/90 h-16 text-xs font-bold tracking-[0.5em] rounded-none">
                SEND TRANSMISSION
                <Zap className="ml-2 w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
