
"use client"

import { useState, useEffect } from 'react';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { initiateEmailSignIn, initiateEmailSignUp, initiateAnonymousSignIn, initiateGoogleSignIn, initiatePasswordReset } from '@/firebase/non-blocking-login';
import { saveUserToFirestore } from '@/firebase/user-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2, Chrome, Sparkles, User as UserIcon, Phone, Eye, EyeOff, ShieldAlert, KeyRound, Mail, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

type AuthMode = 'login' | 'signup' | 'reset';

export default function LoginPage() {
  const auth = useAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  
  const [mode, setMode] = useState<AuthMode>('login');
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
    
    if (mode === 'reset') {
      if (!email.includes('@')) return;
      setLoading(true);
      try {
        await initiatePasswordReset(auth, email.trim());
        toast({ title: "RECOVERY TRANSMITTED", description: "CHECK YOUR COMM-CHANNEL FOR THE RESET LINK." });
        setMode('login');
      } catch (err) {
        toast({ variant: "destructive", title: "RECOVERY_FAILURE" });
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!email || !password) return;
    
    setLoading(true);
    try {
      if (mode === 'signup') {
        const cred = await initiateEmailSignUp(auth, email.trim(), password);
        await saveUserToFirestore(db, cred.user, { displayName, mobileNumber });
        toast({ title: "IDENTITY INITIALIZED", description: "YOUR ENTITY HAS BEEN LOGGED IN THE VOID." });
      } else {
        const cred = await initiateEmailSignIn(auth, email.trim(), password);
        await saveUserToFirestore(db, cred.user);
        toast({ title: "LINK ESTABLISHED", description: "WELCOME BACK, OPERATOR." });
      }
    } catch (err: any) {
      console.error('[AUTH_FAILURE]', err);
      let errorTitle = "ACCESS_DENIED";
      let errorMsg = err.message || "INVALID IDENTITY CREDENTIALS.";

      // Handle specific provider configuration error
      if (err.code === 'auth/configuration-not-found') {
        errorTitle = "PROVIDER_OFFLINE";
        errorMsg = "EMAIL/PASSWORD AUTH IS NOT ENABLED IN FIREBASE CONSOLE. PLEASE ENABLE IT IN THE AUTHENTICATION > SIGN-IN METHOD TAB.";
      } else if (email.toLowerCase() === 'voidwear26@gmail.com' && (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found')) {
         errorTitle = "MASTER_NOT_FOUND";
         errorMsg = "ADMIN RECORD NOT INITIALIZED. PLEASE USE 'SIGN UP' WITH PASSWORD 'admin2026' TO INITIALIZE MASTER STATUS.";
      }

      toast({
        variant: "destructive",
        title: errorTitle,
        description: errorMsg.toUpperCase(),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const cred = await initiateGoogleSignIn(auth);
      await saveUserToFirestore(db, cred.user);
      toast({ title: "GOOGLE UPLINK SECURED" });
    } catch (err: any) {
      console.error('[GOOGLE_AUTH_FAILURE]', err);
      let msg = "UPLINK FAILED";
      if (err.code === 'auth/configuration-not-found') {
        msg = "GOOGLE PROVIDER NOT ENABLED IN FIREBASE CONSOLE.";
      }
      toast({ variant: "destructive", title: msg });
    } finally {
      setLoading(false);
    }
  };

  if (isUserLoading) return <div className="h-screen flex items-center justify-center bg-black"><Loader2 className="animate-spin text-white/20" /></div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 pt-32 bg-black">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-12">
        <div className="text-center space-y-6">
           <Image src="/logo.png" alt="VOID WEAR" width={80} height={80} className="mx-auto brightness-200 grayscale" unoptimized />
           <p className="text-[10px] tracking-[0.8em] text-white/40 uppercase font-black">
             {mode === 'login' ? 'AUTHENTICATION' : mode === 'signup' ? 'INITIALIZATION' : 'RECOVERY'}
           </p>
        </div>

        <div className="bg-white/5 border border-white/10 p-10 space-y-8 backdrop-blur-xl">
          <form onSubmit={handleAuth} className="space-y-6">
            {mode === 'signup' && (
              <div className="space-y-6">
                <Field label="ENTITY NAME" value={displayName} onChange={setDisplayName} placeholder="IDENTIFIER" />
                <Field label="CONTACT MODULE" value={mobileNumber} onChange={setMobileNumber} placeholder="+91..." />
              </div>
            )}
            
            <Field label="COMM-CHANNEL / EMAIL" value={email} onChange={setEmail} type="email" placeholder="ID@NETWORK.COM" />
            
            {mode !== 'reset' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-bold tracking-[0.4em] text-white/40 uppercase">ACCESS KEY</label>
                  {mode === 'login' && <button type="button" onClick={() => setMode('reset')} className="text-[8px] text-white/20 hover:text-white transition-colors font-black">FORGOT?</button>}
                </div>
                <Input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="bg-black/50 border-white/10 h-14 rounded-none text-xs tracking-widest text-white font-mono" />
              </div>
            )}

            <Button disabled={loading} className="w-full bg-white text-black hover:bg-white/90 h-16 text-[10px] font-black tracking-[0.5em] rounded-none">
              {loading ? <Loader2 className="animate-spin" /> : (mode === 'signup' ? 'INITIALIZE' : mode === 'reset' ? 'RECOVER' : 'ESTABLISH LINK')}
            </Button>
          </form>

          {mode !== 'reset' && (
             <Button variant="outline" onClick={handleGoogleSignIn} disabled={loading} className="w-full border-white/10 h-14 text-[9px] tracking-[0.3em] font-black rounded-none bg-transparent">
                <Chrome className="mr-3 w-4 h-4" /> GOOGLE UPLINK
             </Button>
          )}

          {mode === 'reset' && (
             <button onClick={() => setMode('login')} className="w-full text-[8px] tracking-[0.4em] text-white/20 hover:text-white uppercase font-black">BACK TO UPLINK</button>
          )}
        </div>

        <button onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')} className="w-full text-[10px] tracking-[0.3em] text-white/40 hover:text-white border-b border-white/5 pb-1 uppercase font-black">
          {mode === 'signup' ? 'ALREADY LINKED? LOGIN' : 'NEW ENTITY? SIGN UP'}
        </button>
      </motion.div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-bold tracking-[0.4em] text-white/40 uppercase">{label}</label>
      <Input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="bg-black/50 border-white/10 h-14 rounded-none text-xs tracking-widest text-white placeholder:text-white/5 uppercase" />
    </div>
  );
}
