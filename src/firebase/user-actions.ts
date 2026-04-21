
'use client';

import { doc, setDoc, Firestore } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';

/**
 * VOID WEAR // DOSSIER SYNCHRONIZATION
 * Persists user identity metadata to the Firestore database.
 * Optimized for reliability and preventing silent write failures.
 */
export async function saveUserToFirestore(db: Firestore, user: User, extraData: any = {}) {
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  
  const dossierData = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || extraData.displayName || user.email?.split('@')[0].toUpperCase(),
    mobileNumber: extraData.mobileNumber || '',
    role: user.email?.toLowerCase() === 'voidwear26@gmail.com' ? 'ADMIN' : 'OPERATOR',
    updatedAt: new Date().toISOString(),
    createdAt: extraData.createdAt || new Date().toISOString(),
    ...extraData
  };

  // Perform set with merge protocol. 
  // Note: We return the promise to allow login/signup pages to wait for initialization if needed.
  return setDoc(userRef, dossierData, { merge: true })
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: userRef.path,
        operation: 'write',
        requestResourceData: dossierData,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    });
}
