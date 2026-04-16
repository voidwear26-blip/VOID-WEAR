"use client"

import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@/firebase';
import { initiateEmailSignIn, initiateEmailSignUp, initiateAnonymousSignIn, initiateGoogleSignIn } from '@/firebase/non-blocking-login';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Sparkles, Loader2, Chrome } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/profile');
    }
  }, [user, isUserLoading, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    try {
      if (isSignUp) {
        await initiateEmailSignUp(auth, email, password);
      } else {
        await initiateEmailSignIn(auth, email, password);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Calling immediately without state delays to prevent "popup-blocked"
    initiateGoogleSignIn(auth);
  };

  const handleGuestSignIn = async () => {
    setLoading(true);
    initiateAnonymousSignIn(auth).finally(() => setLoading(false));
  };

  const iconMotionProps = {
    whileHover: { scale: 1.2, filter: "drop-shadow(0 0 10px rgba(255, 255, 255, 0.8))" },
    transition: { type: "spring", stiffness: 400, damping: 10 }
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-6 pt-32">
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
          <Link href="/" className="inline-flex flex-col items-center gap-4 group">
            <motion.div {...iconMotionProps}>
              <Zap className="w-8 h-8 group-hover:text-white transition-all duration-700" />
            </motion.div>
            <span className="text-3xl font-black tracking-[0.8em] glow-text">SYSTEM01</span>
          </Link>
          <p className="text-[10px] tracking-[0.5em] text-white/40 uppercase">AUTHENTICATION PROTOCOL</p>
        </div>

        <div className="bg-white/5 border border-white/10 p-10 space-y-8 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">COMM-CHANNEL / EMAIL</label>
              <Input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/50 border-white/10 rounded-none h-14 text-xs tracking-widest focus-visible:border-white/40 placeholder:text-white/5 text-white" 
                placeholder="ID@NETWORK.COM"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">ACCESS KEY / PASSWORD</label>
              <Input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black/50 border-white/10 rounded-none h-14 text-xs tracking-widest focus-visible:border-white/40 placeholder:text-white/5 text-white" 
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-white text-black hover:bg-white/90 h-16 text-[10px] font-bold tracking-[0.5em] rounded-none group shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-500"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'INITIALIZE ACCOUNT' : 'ESTABLISH LINK'}
                  <ArrowRight className="ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
              <div className="relative flex justify-center text-[8px] uppercase tracking-[0.4em]"><span className="bg-[#050505] px-4 text-white/20">OR CONNECT VIA</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                onClick={handleGoogleSignIn}
                className="border-white/10 h-14 text-[9px] tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-500 rounded-none bg-transparent group"
              >
                <motion.div {...iconMotionProps} className="mr-3">
                  <Chrome className="w-4 h-4 group-hover:glow-icon transition-all" />
                </motion.div>
                GOOGLE
              </Button>

              <Button 
                variant="outline" 
                onClick={handleGuestSignIn}
                disabled={loading}
                className="border-white/10 h-14 text-[9px] tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-500 rounded-none bg-transparent group"
              >
                <motion.div {...iconMotionProps} className="mr-3">
                  <Sparkles className="w-4 h-4 group-hover:glow-icon transition-all" />
                </motion.div>
                GUEST
              </Button>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button 
            type="button"
            disabled={loading}
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[10px] tracking-[0.3em] text-white/40 hover:text-white transition-colors uppercase font-bold border-b border-white/5 hover:border-white pb-1"
          >
            {isSignUp ? 'ALREADY LINKED? LOGIN' : 'NEW ENTITY? SIGN UP'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
