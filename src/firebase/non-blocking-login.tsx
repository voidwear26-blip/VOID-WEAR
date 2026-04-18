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
import { doc, setDoc, getFirestore } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';

/** 
 * PROTOCOL: Auth Error Handling
 * Interprets technical error codes into human-readable transmissions.
 */
const handleAuthError = (error: any) => {
  // Suppress cancel notifications to avoid system noise
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

  // Log critical system failures only
  if (!error.code?.startsWith('auth/')) {
    console.error('[AUTH_CRITICAL_FAILURE]', error);
  }
  
  let title = "AUTHENTICATION_FAILED";
  let description = "SYSTEM UNABLE TO ESTABLISH LINK.";
  let variant: "default" | "destructive" = "destructive";
  
  // Hardened check for modern Firebase error codes
  const isInvalid = [
    'auth/invalid-credential',
    'auth/user-not-found',
    'auth/wrong-password',
    'auth/invalid-email'
  ].includes(error.code);

  if (isInvalid) {
    description = "INVALID CREDENTIALS. CHECK YOUR ACCESS KEY OR IDENTITY ID.";
  } else if (error.code === 'auth/email-already-in-use') {
    description = "THIS ENTITY IS ALREADY LINKED. PROCEED TO LOGIN.";
  } else if (error.code === 'auth/weak-password') {
    description = "ACCESS KEY STRENGTH INSUFFICIENT.";
  }

  toast({ variant, title, description });
};

/** Initiate anonymous sign-in. */
export function initiateAnonymousSignIn(authInstance: Auth): Promise<UserCredential | void> {
  return signInAnonymously(authInstance).catch(handleAuthError);
}

/** Initiate email/password sign-up with additional profile data. */
export async function initiateEmailSignUp(
  authInstance: Auth, 
  email: string, 
  password: string, 
  profileData: { displayName: string, mobileNumber: string }
): Promise<UserCredential | void> {
  try {
    const credential = await createUserWithEmailAndPassword(authInstance, email, password);
    const db = getFirestore();
    
    // ATOMIC INITIALIZATION: Create the user profile document using setDoc (Create or Overwrite)
    await setDoc(doc(db, 'users', credential.user.uid), {
      uid: credential.user.uid,
      email: email,
      displayName: profileData.displayName,
      mobileNumber: profileData.mobileNumber,
      isBlocked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return credential;
  } catch (error) {
    handleAuthError(error);
  }
}

/** Initiate email/password sign-in. */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<UserCredential | void> {
  return signInWithEmailAndPassword(authInstance, email, password).catch(handleAuthError);
}

/** Initiate Google Sign-In. */
export function initiateGoogleSignIn(authInstance: Auth): Promise<UserCredential | void> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return signInWithPopup(authInstance, provider).catch(handleAuthError);
}
