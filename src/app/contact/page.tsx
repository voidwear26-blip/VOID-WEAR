'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MessageSquare, Globe, Zap, Loader2, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirestore } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { sendContactEmail } from '@/app/actions/contact';

export default function ContactPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const [isPending, setIsPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;

    if (!name || !email || !subject || !message) {
      toast({
        variant: "destructive",
        title: "INCOMPLETE",
        description: "PLEASE FILL ALL FIELDS.",
      });
      return;
    }

    setIsPending(true);
    try {
      await addDoc(collection(db, 'contacts'), {
        name,
        email,
        subject,
        message,
        createdAt: new Date().toISOString()
      });

      await sendContactEmail({}, formData);
      setSubmitted(true);
      toast({
        title: "SENT",
        description: "MESSAGE RECEIVED.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "ERROR",
        description: "CONNECTION FAILED.",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="pt-40 pb-32 bg-background min-h-screen text-black">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-24 max-w-6xl mx-auto">
          <div className="space-y-12">
            <div className="space-y-4">
              <span className="text-xs font-bold tracking-[0.6em] text-black/40 uppercase">COMMUNICATION</span>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight uppercase leading-none text-black">Contact</h1>
              <p className="text-black/60 tracking-widest text-sm leading-relaxed uppercase max-w-md font-light">
                Reach out for inquiries or system support.
              </p>
            </div>

            <div className="space-y-8">
              <ContactInfo icon={<Mail />} label="EMAIL" value="voidwear26@gmail.com" />
              <ContactInfo icon={<MessageSquare />} label="SUPPORT" value="+91 94885 89972" />
              <ContactInfo icon={<Globe />} label="LOCATION" value="Vellore, India" />
            </div>
          </div>

          <div className="bg-black/[0.02] border border-black/5 p-12 space-y-8 backdrop-blur-sm">
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center space-y-8 py-20"
                >
                  <CheckCircle2 className="w-16 h-16 text-black" />
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold tracking-[0.4em] uppercase">MESSAGE SENT</h3>
                    <p className="text-[10px] tracking-[0.2em] text-black/40 uppercase font-bold">WE WILL CONTACT YOU SHORTLY.</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={() => setSubmitted(false)}
                    className="text-[10px] tracking-[0.5em] uppercase text-black/40 hover:text-black"
                  >
                    SEND ANOTHER
                  </Button>
                </motion.div>
              ) : (
                <motion.div 
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-8"
                >
                  <h3 className="text-xs font-bold tracking-[0.4em] uppercase text-black/80">SEND MESSAGE</h3>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField label="NAME" name="name" />
                      <FormField label="EMAIL" name="email" type="email" />
                    </div>
                    <FormField label="SUBJECT" name="subject" />
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold tracking-widest text-black/40 uppercase">MESSAGE</label>
                      <Textarea 
                        name="message"
                        required
                        className="bg-background border-black/10 rounded-none min-h-[150px] text-xs tracking-widest focus:border-black/30 text-black uppercase" 
                      />
                    </div>
                    <Button 
                      disabled={isPending}
                      className="w-full bg-black text-white hover:bg-black/80 h-16 text-xs font-bold tracking-[0.5em] rounded-none shadow-sm transition-all"
                    >
                      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'SEND MESSAGE'}
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

function ContactInfo({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-center gap-6 group">
      <div className="w-12 h-12 border border-black/5 flex items-center justify-center group-hover:border-black/20 transition-colors bg-black/[0.02]">
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: "w-5 h-5 text-black/40" }) : icon}
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-bold tracking-widest text-black/40 uppercase">{label}</p>
        <p className="text-xs tracking-widest uppercase text-black/80">{value}</p>
      </div>
    </div>
  );
}

function FormField({ label, name, type = "text" }: { label: string, name: string, type?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold tracking-widest text-black/40 uppercase">{label}</label>
      <Input 
        name={name}
        type={type}
        required
        className="bg-background border-black/10 rounded-none h-12 text-xs tracking-widest focus:border-black/30 text-black uppercase" 
      />
    </div>
  );
}
