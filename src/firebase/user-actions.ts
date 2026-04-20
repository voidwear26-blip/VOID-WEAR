
'use client';

import { doc, setDoc, Firestore } from 'firebase/firestore';
import { User } from 'firebase/auth';

/**
 * VOID WEAR // DOSSIER SYNCHRONIZATION
 * Persists user identity metadata to the Firestore database.
 */
export async function saveUserToFirestore(db: Firestore, user: User, extraData: any = {}) {
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  
  const dossierData = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || extraData.displayName || user.email?.split('@')[0].toUpperCase(),
    mobileNumber: extraData.mobileNumber || '',
    photoURL: user.photoURL || '',
    role: user.email?.toLowerCase() === 'voidwear26@gmail.com' ? 'ADMIN' : 'OPERATOR',
    updatedAt: new Date().toISOString(),
    // Preserve createdAt if it already exists
    createdAt: extraData.createdAt || new Date().toISOString()
  };

  // Perform non-blocking set with merge protocol
  return setDoc(userRef, dossierData, { merge: true });
}
