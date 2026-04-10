'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { toast } from '@/hooks/use-toast';

/** 
 * Helper to handle auth errors gracefully in a non-blocking way.
 * This prevents unhandled promise rejections that trigger Next.js error overlays.
 */
const handleAuthError = (error: any) => {
  console.error('[AUTH_ERROR]', error);
  
  let description = "SYSTEM UNABLE TO ESTABLISH LINK.";
  
  if (error.code === 'auth/invalid-credential') {
    description = "INVALID EMAIL OR ACCESS KEY. ENSURE YOU HAVE INITIALIZED YOUR ACCOUNT.";
  } else if (error.code === 'auth/email-already-in-use') {
    description = "THIS ENTITY IS ALREADY LINKED. PROCEED TO LOGIN.";
  } else if (error.code === 'auth/weak-password') {
    description = "ACCESS KEY STRENGTH INSUFFICIENT.";
  }

  toast({
    variant: "destructive",
    title: "AUTHENTICATION_FAILED",
    description: description,
  });
};

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance).catch(handleAuthError);
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  createUserWithEmailAndPassword(authInstance, email, password).catch(handleAuthError);
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  signInWithEmailAndPassword(authInstance, email, password).catch(handleAuthError);
}
