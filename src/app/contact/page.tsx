'use client';

import { useState, useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MessageSquare, Globe, Zap, Loader2, CheckCircle2 } from 'lucide-react';
import { sendContactEmail } from '@/app/actions/contact';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContactPage() {
  const { toast } = useToast();
  const [state, formAction, isPending] = useActionState(sendContactEmail, null);
  const [submitted, setSubmitted] = useState(false);

  // Trigger toast on response
  if (state?.success && !submitted) {
    setSubmitted(true);
    toast({
      title: "TRANSMISSION SECURED",
      description: "YOUR MESSAGE HAS REACHED THE PRIMARY NODE.",
    });
  } else if (state?.success === false) {
    toast({
      variant: "destructive",
      title: "UPLINK FAILURE",
      description: state.message || "COULD NOT ESTABLISH CONNECTION.",
    });
  }

  return (
    <div className="pt-40 pb-32 bg-transparent min-h-screen text-white">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-24 max-w-6xl mx-auto">
          <div className="space-y-12">
            <div className="space-y-4">
              <span className="text-xs font-bold tracking-[0.6em] text-white/40 uppercase">COMMUNICATION // UPLINK</span>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight glow-text uppercase leading-none">Establish <br /> Connection</h1>
              <p className="text-white/60 tracking-widest text-sm leading-relaxed uppercase max-w-md font-medium">
                Reach out to our primary administrator for inquiries regarding orders, technical specifications, or reporting system anomalies.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-6 group">
                <div className="w-12 h-12 border border-white/10 flex items-center justify-center group-hover:border-white transition-colors bg-white/[0.02]">
                  <Mail className="w-5 h-5 text-white/40 group-hover:text-white transition-all" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold tracking-widest text-white/60">EMAIL PROTOCOL</p>
                  <p className="text-xs tracking-widest uppercase text-white/90">voidwear26@gmail.com</p>
                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <div className="w-12 h-12 border border-white/10 flex items-center justify-center group-hover:border-white transition-colors bg-white/[0.02]">
                  <MessageSquare className="w-5 h-5 text-white/40 group-hover:text-white transition-all" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold tracking-widest text-white/60">SUPPORT CHANNEL</p>
                  <p className="text-xs tracking-widest uppercase text-white/90">+91 94885 89972</p>
                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <div className="w-12 h-12 border border-white/10 flex items-center justify-center group-hover:border-white transition-colors bg-white/[0.02]">
                  <Globe className="w-5 h-5 text-white/40 group-hover:text-white transition-all" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold tracking-widest text-white/60">BASE COMMAND</p>
                  <p className="text-xs tracking-widest uppercase text-white/90">TamilNadu, India / Vellore</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/10 p-12 space-y-8 backdrop-blur-md relative overflow-hidden">
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center space-y-8 py-20"
                >
                  <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold tracking-[0.4em] uppercase text-white">TRANSMISSION LOGGED</h3>
                    <p className="text-[10px] tracking-[0.2em] text-white/60 uppercase font-bold">WE WILL RESPOND THROUGH THE UPLINK CHANNEL SHORTLY.</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={() => setSubmitted(false)}
                    className="text-[10px] tracking-[0.5em] uppercase text-white/40 hover:text-white"
                  >
                    SEND ANOTHER MESSAGE
                  </Button>
                </motion.div>
              ) : (
                <motion.div 
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  <h3 className="text-xs font-bold tracking-[0.4em] uppercase text-white/80">TRANSMIT MESSAGE</h3>
                  <form action={formAction} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold tracking-widest text-white/60 uppercase">FULL NAME</label>
                        <Input 
                          name="name"
                          required
                          className="bg-black/50 border-white/10 rounded-none h-12 text-xs tracking-widest focus:border-white/40 text-white placeholder:text-white/5 uppercase" 
                          placeholder="IDENTIFICATION" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold tracking-widest text-white/60 uppercase">EMAIL ADDRESS</label>
                        <Input 
                          name="email"
                          type="email"
                          required
                          className="bg-black/50 border-white/10 rounded-none h-12 text-xs tracking-widest focus:border-white/40 text-white placeholder:text-white/5" 
                          placeholder="COMM-CHANNEL" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold tracking-widest text-white/60 uppercase">SUBJECT</label>
                      <Input 
                        name="subject"
                        required
                        className="bg-black/50 border-white/10 rounded-none h-12 text-xs tracking-widest focus:border-white/40 text-white placeholder:text-white/5 uppercase" 
                        placeholder="TOPIC" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold tracking-widest text-white/60 uppercase">MESSAGE</label>
                      <Textarea 
                        name="message"
                        required
                        className="bg-black/50 border-white/10 rounded-none min-h-[150px] text-xs tracking-widest focus:border-white/40 text-white placeholder:text-white/5 uppercase" 
                        placeholder="INPUT DATA..." 
                      />
                    </div>
                    <Button 
                      disabled={isPending}
                      className="w-full bg-white text-black hover:bg-white/90 h-16 text-xs font-bold tracking-[0.5em] rounded-none shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all flex items-center justify-center gap-3"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          UPLINKING...
                        </>
                      ) : (
                        <>
                          SEND TRANSMISSION
                          <Zap className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
