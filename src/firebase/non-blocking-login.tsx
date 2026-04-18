
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
 * Helper to handle auth errors gracefully.
 */
const handleAuthError = (error: any) => {
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
  
  if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
    description = "INVALID CREDENTIALS. CHECK YOUR ACCESS KEY.";
  } else if (error.code === 'auth/email-already-in-use') {
    description = "THIS ENTITY IS ALREADY LINKED.";
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
    
    // Create the user profile document
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
