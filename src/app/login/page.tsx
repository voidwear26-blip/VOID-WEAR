"use client"

import { useState, useEffect } from 'react';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { 
  initiateEmailSignIn, 
  initiateEmailSignUp, 
  initiateGoogleSignIn, 
  initiatePasswordReset, 
  initiateEmailVerification,
  initiateSignOut,
  updateAuthProfile
} from '@/firebase/non-blocking-login';
import { saveUserToFirestore } from '@/firebase/user-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Chrome, Eye, EyeOff, MailCheck, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

type AuthMode = 'login' | 'signup' | 'reset' | 'verify' | 'sync';

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
      const isGoogleLinked = user.providerData.some(p => p.providerId === 'google.com');
      
      if (user.emailVerified || isGoogleLinked) {
        const wasNewReg = typeof window !== 'undefined' ? localStorage.getItem('void_new_reg') : null;
        if (wasNewReg) {
          localStorage.removeItem('void_new_reg');
          router.push('/profile');
        } else {
          router.push('/');
        }
      } else {
        setMode('verify');
      }
    }
  }, [user, isUserLoading, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'reset') {
      if (!email.includes('@')) return;
      setLoading(true);
      try {
        await initiatePasswordReset(auth, email.trim());
        toast({ title: "RESET LINK SENT", description: "CHECK YOUR EMAIL." });
        setMode('login');
      } catch (err) {
        toast({ variant: "destructive", title: "SEND FAILURE" });
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
        await updateAuthProfile(cred.user, { displayName });
        await initiateEmailVerification(cred.user);
        localStorage.setItem('void_new_reg', 'true');
        await saveUserToFirestore(db, cred.user, { displayName, mobileNumber, createdAt: new Date().toISOString() });
        setMode('verify');
      } else {
        const cred = await initiateEmailSignIn(auth, email.trim(), password);
        if (!cred.user.emailVerified) {
          setMode('verify');
        } else {
          await saveUserToFirestore(db, cred.user);
          toast({ title: "LOGGED IN", description: "WELCOME BACK." });
        }
      }
    } catch (err: any) {
      let errorTitle = "LOGIN FAILED";
      if (err.code === 'auth/email-already-in-use') errorTitle = "ACCOUNT EXISTS";
      if (err.code === 'auth/invalid-credential') errorTitle = "INVALID CREDENTIALS";
      
      toast({
        variant: "destructive",
        title: errorTitle,
        description: "THE EMAIL OR PASSWORD PROVIDED IS INCORRECT.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await initiateEmailVerification(user);
      toast({ title: "EMAIL SENT", description: "CHECK YOUR INBOX." });
    } catch (err) {
      toast({ variant: "destructive", title: "SEND FAILURE" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await initiateSignOut(auth);
    setMode('login');
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setMode('sync');
    try {
      const cred = await initiateGoogleSignIn(auth);
      // Flag as new registration to trigger profile confirmation
      localStorage.setItem('void_new_reg', 'true');
      await saveUserToFirestore(db, cred.user);
      toast({ title: "IDENTITY LINKED", description: "DATA RETRIEVED FROM GOOGLE." });
    } catch (err: any) {
      setMode('login');
      if (err.code !== 'auth/popup-closed-by-user') {
        toast({ variant: "destructive", title: "LOGIN FAILED" });
      }
    } finally {
      setLoading(false);
    }
  };

  if (isUserLoading) return <div className="h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-black/20" /></div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 pt-32 bg-background">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-12">
        <div className="text-center space-y-6">
           <Image src="/logo.png" alt="VOID WEAR" width={80} height={80} className="mx-auto grayscale" unoptimized />
           <p className="text-[10px] tracking-[0.8em] text-black/60 uppercase font-black font-headline">
             {mode === 'login' ? 'LOGIN' : mode === 'signup' ? 'SIGN UP' : mode === 'reset' ? 'RECOVERY' : mode === 'sync' ? 'SYNCING' : 'VERIFY'}
           </p>
        </div>

        <div className="bg-black/[0.02] border border-black/10 p-10 space-y-8 backdrop-blur-xl">
          <AnimatePresence mode="wait">
            {mode === 'verify' ? (
              <motion.div key="verify" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 text-center py-6">
                <div className="w-16 h-16 bg-black/5 border border-black/10 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <MailCheck className="w-8 h-8 text-black/60 animate-pulse" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-bold tracking-[0.3em] uppercase text-black font-headline">VERIFY EMAIL</h3>
                  <p className="text-[10px] tracking-[0.2em] text-black/60 leading-relaxed uppercase font-medium">
                    LINK SENT TO <span className="text-black font-bold">{user?.email}</span>.
                  </p>
                </div>
                <div className="flex flex-col gap-4">
                  <Button onClick={handleResendVerification} disabled={loading} variant="outline" className="h-14 border-black/10 text-[9px] tracking-[0.3em] font-black rounded-none bg-transparent hover:bg-black hover:text-white uppercase transition-all">
                    {loading ? <Loader2 className="animate-spin" /> : <><RotateCcw className="mr-3 w-3.5 h-3.5" /> RESEND EMAIL</>}
                  </Button>
                  <button onClick={handleLogout} className="text-[8px] tracking-[0.4em] text-black/60 hover:text-black uppercase font-black transition-colors">SIGN OUT</button>
                </div>
              </motion.div>
            ) : mode === 'sync' ? (
              <motion.div key="sync" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 flex flex-col items-center justify-center gap-6">
                 <ShieldCheck className="w-12 h-12 text-black/20 animate-pulse" />
                 <div className="space-y-2 text-center">
                    <p className="text-[10px] tracking-[0.5em] font-black uppercase">Retrieving Metadata</p>
                    <p className="text-[8px] tracking-[0.2em] text-black/40 uppercase">Establishing secure link...</p>
                 </div>
              </motion.div>
            ) : (
              <form onSubmit={handleAuth} className="space-y-6">
                {mode === 'signup' && (
                  <div className="space-y-6">
                    <Field label="NAME" value={displayName} onChange={setDisplayName} placeholder="YOUR NAME" />
                    <Field label="MOBILE" value={mobileNumber} onChange={setMobileNumber} placeholder="+91..." />
                  </div>
                )}
                
                <Field label="EMAIL" value={email} onChange={setEmail} type="email" placeholder="YOUR@EMAIL.COM" />
                
                {mode !== 'reset' && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-bold tracking-[0.4em] text-black/60 uppercase">PASSWORD</label>
                      {mode === 'login' && <button type="button" onClick={() => setMode('reset')} className="text-[8px] text-black/60 hover:text-black transition-colors font-black uppercase">FORGOT?</button>}
                    </div>
                    <div className="relative">
                      <Input 
                        type={showPassword ? 'text' : 'password'} 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        className="bg-white border-black/10 h-14 rounded-none text-xs tracking-widest text-black font-mono pr-12 focus:border-black/40" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-black/20 hover:text-black transition-colors focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <Button disabled={loading} className="w-full bg-black text-white hover:bg-black/90 h-16 text-[10px] font-black tracking-[0.5em] rounded-none uppercase transition-all shadow-sm">
                  {loading ? <Loader2 className="animate-spin" /> : (mode === 'signup' ? 'CREATE ACCOUNT' : mode === 'reset' ? 'RECOVER' : 'LOGIN')}
                </Button>
                
                {mode === 'login' && (
                  <Button variant="outline" type="button" onClick={handleGoogleSignIn} disabled={loading} className="w-full border-black/10 h-14 text-[9px] tracking-[0.3em] font-black rounded-none bg-transparent hover:bg-black/5 uppercase transition-all">
                    <Chrome className="mr-3 w-4 h-4" /> GOOGLE LOGIN
                  </Button>
                )}
              </form>
            )}
          </AnimatePresence>

          {mode === 'reset' && (
             <button onClick={() => setMode('login')} className="w-full text-[8px] tracking-[0.4em] text-black/60 hover:text-black uppercase font-black transition-colors">BACK TO LOGIN</button>
          )}
        </div>

        {mode !== 'verify' && mode !== 'sync' && (
          <button onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')} className="w-full text-[10px] tracking-[0.3em] text-black/60 hover:text-black border-b border-black/5 pb-1 uppercase font-black transition-all">
            {mode === 'signup' ? 'ALREADY HAVE AN ACCOUNT? LOGIN' : 'NEW CUSTOMER? SIGN UP'}
          </button>
        )}
      </motion.div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-bold tracking-[0.4em] text-black/60 uppercase">{label}</label>
      <Input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="bg-white border-black/10 h-14 rounded-none text-xs tracking-widest text-black placeholder:text-black/10 uppercase focus:border-black/40" />
    </div>
  );
}
