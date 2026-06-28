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
import { Loader2, Chrome, Eye, EyeOff, ShieldAlert, MailCheck, RotateCcw, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

type AuthMode = 'login' | 'signup' | 'reset' | 'verify';

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
      if (user.emailVerified || user.providerData[0]?.providerId === 'google.com') {
        // SUCCESSFUL AUTHENTICATED UPLINK: REDIRECT TO HOMEPAGE
        router.push('/');
      } else {
        // ENTITY UNVERIFIED: REQUIRE NEURAL HANDSHAKE
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
        
        // 1. SYNC AUTH PROFILE: Required for template tags like %DISPLAY_NAME% to work
        await updateAuthProfile(cred.user, { displayName });
        
        // 2. DISPATCH VERIFICATION PACKET
        await initiateEmailVerification(cred.user);
        
        // 3. INITIALIZE DOSSIER
        await saveUserToFirestore(db, cred.user, { displayName, mobileNumber });
        
        toast({ title: "IDENTITY INITIALIZED", description: "VERIFICATION LINK TRANSMITTED TO YOUR COMM-CHANNEL." });
        setMode('verify');
      } else {
        const cred = await initiateEmailSignIn(auth, email.trim(), password);
        if (!cred.user.emailVerified) {
          setMode('verify');
          toast({ variant: "destructive", title: "IDENTITY UNVERIFIED", description: "PLEASE AUTHENTICATE YOUR COMM-CHANNEL." });
        } else {
          await saveUserToFirestore(db, cred.user);
          toast({ title: "LINK ESTABLISHED", description: "WELCOME BACK, OPERATOR." });
        }
      }
    } catch (err: any) {
      console.error('[AUTH_FAILURE]', err);
      
      let errorTitle = "ACCESS_DENIED";
      let errorDesc = "INVALID IDENTITY CREDENTIALS.";

      if (err.code === 'auth/email-already-in-use') {
        errorTitle = "IDENTITY_ALREADY_LINKED";
        errorDesc = "THIS COMM-CHANNEL IS ALREADY ANCHORED TO THE NETWORK.";
      } else if (err.code === 'auth/weak-password') {
        errorTitle = "SECURITY_THREAT";
        errorDesc = "ACCESS KEY IS TOO FRAGILE. INCREASE COMPLEXITY.";
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errorTitle = "UPLINK_FAILURE";
        errorDesc = "CREDENTIALS DO NOT MATCH ANY ACTIVE DOSSIER.";
      }

      toast({
        variant: "destructive",
        title: errorTitle,
        description: errorDesc,
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
      toast({ title: "PACKET RE-TRANSMITTED", description: "CHECK YOUR INBOX FOR THE NEURAL HANDSHAKE." });
    } catch (err) {
      toast({ variant: "destructive", title: "TRANSMISSION_FAILED" });
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
    try {
      const cred = await initiateGoogleSignIn(auth);
      await saveUserToFirestore(db, cred.user);
      toast({ title: "GOOGLE UPLINK SECURED" });
    } catch (err: any) {
      console.error('[GOOGLE_AUTH_FAILURE]', err);
      toast({ variant: "destructive", title: "UPLINK FAILED" });
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
             {mode === 'login' ? 'AUTHENTICATION' : mode === 'signup' ? 'INITIALIZATION' : mode === 'reset' ? 'RECOVERY' : 'VERIFICATION'}
           </p>
        </div>

        <div className="bg-white/5 border border-white/10 p-10 space-y-8 backdrop-blur-xl">
          <AnimatePresence mode="wait">
            {mode === 'verify' ? (
              <motion.div key="verify" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 text-center py-6">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                  <MailCheck className="w-8 h-8 text-white/60 animate-pulse" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-bold tracking-[0.3em] uppercase text-white">NEURAL HANDSHAKE REQUIRED</h3>
                  <p className="text-[10px] tracking-[0.2em] text-white/40 leading-relaxed uppercase font-medium">
                    A verification link has been transmitted to <span className="text-white">{user?.email}</span>. Please authorize this link to activate your system uplink.
                  </p>
                  
                  {/* SPAM ADVISORY PROTOCOL */}
                  <div className="p-4 border border-red-500/20 bg-red-500/5 flex items-center gap-3">
                     <AlertTriangle className="w-4 h-4 text-red-500/60 shrink-0" />
                     <p className="text-[8px] tracking-[0.2em] text-red-500/80 uppercase font-black text-left leading-relaxed">
                        SYSTEM_ADVISORY: IF TRANSMISSION IS NOT DETECTED WITHIN 60s, AUDIT YOUR SPAM OR JUNK FOLDERS.
                     </p>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <Button onClick={handleResendVerification} disabled={loading} variant="outline" className="h-14 border-white/10 text-[9px] tracking-[0.3em] font-black rounded-none bg-transparent">
                    {loading ? <Loader2 className="animate-spin" /> : <><RotateCcw className="mr-3 w-3.5 h-3.5" /> RE-TRANSMIT PACKET</>}
                  </Button>
                  <button onClick={handleLogout} className="text-[8px] tracking-[0.4em] text-white/20 hover:text-white uppercase font-black">SEVER CURRENT SESSION</button>
                </div>
              </motion.div>
            ) : (
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
                    <div className="relative">
                      <Input 
                        type={showPassword ? 'text' : 'password'} 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        className="bg-black/50 border-white/10 h-14 rounded-none text-xs tracking-widest text-white font-mono pr-12" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <Button disabled={loading} className="w-full bg-white text-black hover:bg-white/90 h-16 text-[10px] font-black tracking-[0.5em] rounded-none">
                  {loading ? <Loader2 className="animate-spin" /> : (mode === 'signup' ? 'INITIALIZE' : mode === 'reset' ? 'RECOVER' : 'ESTABLISH LINK')}
                </Button>
                
                {mode === 'login' && (
                  <Button variant="outline" type="button" onClick={handleGoogleSignIn} disabled={loading} className="w-full border-white/10 h-14 text-[9px] tracking-[0.3em] font-black rounded-none bg-transparent">
                    <Chrome className="mr-3 w-4 h-4" /> GOOGLE UPLINK
                  </Button>
                )}
              </form>
            )}
          </AnimatePresence>

          {mode === 'reset' && (
             <button onClick={() => setMode('login')} className="w-full text-[8px] tracking-[0.4em] text-white/20 hover:text-white uppercase font-black">BACK TO UPLINK</button>
          )}
        </div>

        {mode !== 'verify' && (
          <button onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')} className="w-full text-[10px] tracking-[0.3em] text-white/40 hover:text-white border-b border-white/5 pb-1 uppercase font-black">
            {mode === 'signup' ? 'ALREADY LINKED? LOGIN' : 'NEW ENTITY? SIGN UP'}
          </button>
        )}
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
