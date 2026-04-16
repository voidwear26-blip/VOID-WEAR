'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential,
} from 'firebase/auth';
import { toast } from '@/hooks/use-toast';

/** 
 * Helper to handle auth errors gracefully in a non-blocking way.
 * Provides specific guidance for common VOID WEAR entry failures.
 */
const handleAuthError = (error: any) => {
  // Silence console error for intentional user cancellations
  if (
    error.code === 'auth/popup-closed-by-user' || 
    error.code === 'auth/cancelled-popup-request' ||
    error.code === 'auth/user-cancelled'
  ) {
    toast({
      title: "LINK_CANCELLED",
      description: "AUTHENTICATION WINDOW CLOSED BY ENTITY.",
    });
    return;
  }

  console.error('[AUTH_ERROR]', error);
  
  let title = "AUTHENTICATION_FAILED";
  let description = "SYSTEM UNABLE TO ESTABLISH LINK.";
  let variant: "default" | "destructive" = "destructive";
  
  // Handle modern and legacy Firebase error codes
  if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
    description = "INVALID CREDENTIALS. IF THIS IS YOUR FIRST ACCESS, PLEASE INITIALIZE VIA 'SIGN UP' TOGGLE.";
  } else if (error.code === 'auth/email-already-in-use') {
    description = "THIS ENTITY IS ALREADY LINKED. PROCEED TO LOGIN PROTOCOL.";
  } else if (error.code === 'auth/weak-password') {
    description = "ACCESS KEY STRENGTH INSUFFICIENT. MINIMUM 6 CHARACTERS REQUIRED.";
  } else if (error.code === 'auth/popup-blocked') {
    description = "UPLINK BLOCKED BY BROWSER. ENABLE POPUPS IN YOUR SETTINGS TO PROCEED.";
  } else if (error.code === 'auth/network-request-failed') {
    description = "NEURAL LINK UNSTABLE. CHECK YOUR NETWORK CONNECTION.";
  } else if (error.code === 'auth/operation-not-allowed') {
    description = "THIS PROTOCOL IS CURRENTLY DISABLED IN SYSTEM SETTINGS.";
  }

  toast({
    variant,
    title,
    description,
  });
};

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): Promise<UserCredential | void> {
  return signInAnonymously(authInstance).catch(handleAuthError);
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): Promise<UserCredential | void> {
  return createUserWithEmailAndPassword(authInstance, email, password).catch(handleAuthError);
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<UserCredential | void> {
  return signInWithEmailAndPassword(authInstance, email, password).catch(handleAuthError);
}

/** Initiate Google Sign-In (non-blocking). */
export function initiateGoogleSignIn(authInstance: Auth): Promise<UserCredential | void> {
  const provider = new GoogleAuthProvider();
  // Ensure the provider is clean for each attempt
  provider.setCustomParameters({ 
    prompt: 'select_account'
  });
  
  return signInWithPopup(authInstance, provider).catch(handleAuthError);
}
