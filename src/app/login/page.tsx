"use client"

import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@/firebase';
import { initiateEmailSignIn, initiateEmailSignUp, initiateAnonymousSignIn, initiateGoogleSignIn } from '@/firebase/non-blocking-login';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Chrome, Sparkles, User as UserIcon, Phone, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/profile');
    }
  }, [user, isUserLoading, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "DATA_NODES_MISSING",
        description: "PLEASE ENTER BOTH COMM-CHANNEL AND ACCESS KEY.",
      });
      return;
    }
    
    setLoading(true);
    try {
      if (isSignUp) {
        await initiateEmailSignUp(auth, email, password);
        toast({
          title: "IDENTITY INITIALIZED",
          description: "YOUR ENTITY HAS BEEN LOGGED IN THE VOID.",
        });
      } else {
        await initiateEmailSignIn(auth, email, password);
        toast({
          title: "LINK ESTABLISHED",
          description: "UPLINK SECURED. WELCOME BACK, OPERATOR.",
        });
      }
    } catch (err: any) {
      console.error('[AUTH_FAILURE]', err);
      let errorMessage = "COULD NOT ESTABLISH CONNECTION.";
      let errorTitle = "LINK_FAILURE";
      
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        errorMessage = "INVALID ACCESS KEY OR IDENTIFIER. ENSURE YOUR CREDENTIALS ARE CORRECT.";
        if (email.toLowerCase() === 'voidwear26@gmail.com') {
          errorMessage = "ADMIN ACCESS DENIED. IF YOU RECENTLY CHANGED YOUR PASSWORD TO 'admin2026', ENSURE IT IS UPDATED IN THE FIREBASE CONSOLE.";
        }
      } else if (err.code === 'auth/email-already-in-use') {
        errorMessage = "ENTITY ALREADY EXISTS IN THE SYSTEM.";
      } else if (err.code === 'auth/weak-password') {
        errorMessage = "ACCESS KEY IS TOO WEAK. MINIMUM 6 CHARACTERS REQUIRED.";
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = "ACCESS TEMPORARILY SEVERED DUE TO MULTIPLE FAILURES. RETRY LATER.";
      }

      toast({
        variant: "destructive",
        title: errorTitle,
        description: errorMessage.toUpperCase(),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await initiateGoogleSignIn(auth);
      toast({
        title: "GOOGLE UPLINK SECURED",
        description: "EXTERNAL IDENTITY VERIFIED.",
      });
    } catch (err: any) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user') {
        toast({
          variant: "destructive",
          title: "GOOGLE_LINK_FAILED",
          description: "EXTERNAL AUTHENTICATION SERVER UNREACHABLE.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setLoading(true);
    try {
      await initiateAnonymousSignIn(auth);
      toast({
        title: "ANONYMOUS UPLINK",
        description: "GUEST SESSION INITIALIZED.",
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "GUEST_LINK_FAILED",
        description: "COULD NOT ESTABLISH ANONYMOUS CONNECTION.",
      });
    } finally {
      setLoading(false);
    }
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
        <div className="text-center space-y-8 flex flex-col items-center">
          <Link href="/" className="group flex flex-col items-center gap-6">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="flex flex-col items-center gap-6"
            >
              <Image 
                src="/logo.png" 
                alt="VOID WEAR LOGO" 
                width={80} 
                height={80} 
                className="h-20 w-auto object-contain brightness-200 grayscale opacity-80"
                priority
                unoptimized
              />
              <span className="text-2xl font-black tracking-[0.5em] text-white uppercase glow-text">VOID WEAR</span>
            </motion.div>
          </Link>
          <div className="flex flex-col items-center gap-2">
            <p className="text-[10px] tracking-[0.5em] text-white/40 uppercase font-bold">AUTHENTICATION PROTOCOL</p>
            <div className="h-px w-12 bg-white/10" />
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-10 space-y-8 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleAuth} className="space-y-6">
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">ENTITY NAME</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <Input 
                      type="text" 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="bg-black/50 border-white/10 rounded-none h-14 pl-12 text-xs tracking-widest focus-visible:border-white/40 placeholder:text-white/5 text-white uppercase" 
                      placeholder="IDENTIFIER"
                      required={isSignUp}
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">CONTACT MODULE</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <Input 
                      type="tel" 
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="bg-black/50 border-white/10 rounded-none h-14 pl-12 text-xs tracking-widest focus-visible:border-white/40 placeholder:text-white/5 text-white" 
                      placeholder="+91 XXXX XXX XXX"
                      required={isSignUp}
                      disabled={loading}
                    />
                  </div>
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">COMM-CHANNEL / EMAIL</label>
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
              <label className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase">ACCESS KEY / PASSWORD</label>
              <div className="relative">
                <Input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black/50 border-white/10 rounded-none h-14 text-xs tracking-widest focus-visible:border-white/40 placeholder:text-white/5 text-white pr-12 font-mono" 
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-white text-black hover:bg-white/90 h-16 text-[10px] font-bold tracking-[0.5em] rounded-none group shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-500 uppercase"
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
              <div className="relative flex justify-center text-[8px] uppercase tracking-[0.4em] font-bold"><span className="bg-[#050505] px-4 text-white/20">OR CONNECT VIA</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="border-white/10 h-14 text-[9px] tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-500 rounded-none bg-transparent group font-bold"
              >
                <Chrome className="mr-3 w-4 h-4 group-hover:glow-icon transition-all" />
                GOOGLE
              </Button>

              <Button 
                variant="outline" 
                onClick={handleGuestSignIn}
                disabled={loading}
                className="border-white/10 h-14 text-[9px] tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-500 rounded-none bg-transparent group font-bold"
              >
                <Sparkles className="mr-3 w-4 h-4 group-hover:glow-icon transition-all" />
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
