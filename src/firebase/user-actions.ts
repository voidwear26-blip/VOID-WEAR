
'use client';

import { doc, setDoc, Firestore } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';

/**
 * VOID WEAR // DOSSIER SYNCHRONIZATION
 * Persists user identity metadata to the Firestore database.
 * Uses non-blocking pattern with contextual error emitting.
 * Optimized to preserve logistical coordinates if present.
 */
export function saveUserToFirestore(db: Firestore, user: User, extraData: any = {}) {
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
    createdAt: extraData.createdAt || new Date().toISOString(),
    // Logistical coordinates handled via merge logic in setDoc
    ...extraData
  };

  // Perform non-blocking set with merge protocol to prevent field destruction
  setDoc(userRef, dossierData, { merge: true })
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: userRef.path,
        operation: 'write',
        requestResourceData: dossierData,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
}
