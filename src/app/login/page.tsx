
"use client"

import { useState } from 'react';
import { useAuth } from '@/firebase';
import { initiateEmailSignIn, initiateEmailSignUp, initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const auth = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      initiateEmailSignUp(auth, email, password);
    } else {
      initiateEmailSignIn(auth, email, password);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="w-full max-w-md space-y-12 relative z-10"
      >
        <div className="text-center space-y-6">
          <Link href="/" className="inline-flex items-center gap-4 text-2xl font-black tracking-[0.8em] glow-text">
            <Zap className="w-6 h-6" />
            VOID WEAR
          </Link>
          <p className="text-[10px] tracking-[0.5em] text-white/40 uppercase">AUTHENTICATION PROTOCOL</p>
        </div>

        <div className="bg-white/5 border border-white/10 p-10 space-y-8 backdrop-blur-sm">
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">COMM-CHANNEL / EMAIL</label>
              <Input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/50 border-white/10 rounded-none h-14 text-xs tracking-widest focus-visible:border-white/40" 
                placeholder="ID@NETWORK.COM"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">ACCESS KEY / PASSWORD</label>
              <Input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black/50 border-white/10 rounded-none h-14 text-xs tracking-widest focus-visible:border-white/40" 
                placeholder="••••••••"
                required
              />
            </div>

            <Button type="submit" className="w-full bg-white text-black hover:bg-white/90 h-16 text-[10px] font-bold tracking-[0.5em] rounded-none group">
              {isSignUp ? 'INITIALIZE ACCOUNT' : 'ESTABLISH LINK'}
              <ArrowRight className="ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
              <div className="relative flex justify-center text-[8px] uppercase tracking-[0.4em]"><span className="bg-black px-4 text-white/20">OR</span></div>
            </div>

            <Button 
              variant="outline" 
              onClick={() => initiateAnonymousSignIn(auth)}
              className="w-full border-white/10 h-16 text-[10px] tracking-[0.4em] hover:bg-white hover:text-black transition-all duration-500 rounded-none"
            >
              <Sparkles className="mr-3 w-4 h-4" />
              GUEST ACCESS
            </Button>
          </div>
        </div>

        <div className="text-center">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[10px] tracking-[0.3em] text-white/40 hover:text-white transition-colors uppercase font-bold"
          >
            {isSignUp ? 'ALREADY LINKED? LOGIN' : 'NEW ENTITY? SIGN UP'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
