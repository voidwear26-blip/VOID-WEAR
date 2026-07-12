'use client';

import { doc, setDoc, Firestore } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from './errors';

/**
 * VOID WEAR // CUSTOMER PROFILE SYNCHRONIZATION
 * Persists customer identity metadata to the Firestore database.
 * Optimized for reliability and preventing silent write failures.
 * Uses a pure merge strategy to preserve existing fields like 'createdAt'.
 */
export async function saveUserToFirestore(db: Firestore, user: User, extraData: any = {}) {
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  
  const dossierData: any = {
    uid: user.uid,
    email: user.email,
    updatedAt: new Date().toISOString(),
    ...extraData
  };

  /**
   * MASTER AUTHORITY SYNC:
   * Explicitly sets ADMIN role for hardcoded primary identities.
   */
  const isMasterEmail = 
    user.email?.toLowerCase() === 'voidwear26@gmail.com' || 
    user.email?.toLowerCase() === 'shahabuddinosaid@gmail.com' ||
    user.email?.toLowerCase() === 'voidwearoff26@gmail.com';
  
  const isMasterUID = 
    user.uid === 'A9vsqn10oddfmouKiKjWpTcFqZB2' || 
    user.uid === '0LvBBO9ySQdBKr3uwjcAjphMM8x1';

  if (isMasterEmail || isMasterUID) {
    dossierData.role = 'ADMIN';
  }

  // Ensure mandatory fields have values only if they are not already set in extraData
  if (!dossierData.displayName && user.displayName) dossierData.displayName = user.displayName;
  if (!dossierData.displayName && !user.displayName && !extraData.displayName) {
    dossierData.displayName = user.email?.split('@')[0].toUpperCase() || 'OPERATOR';
  }
  
  // Only include createdAt if it was explicitly passed (e.g., during signup)
  if (extraData.createdAt) {
    dossierData.createdAt = extraData.createdAt;
  }

  // Perform set with merge protocol. 
  setDoc(userRef, dossierData, { merge: true })
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: userRef.path,
        operation: 'update',
        requestResourceData: dossierData,
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    });

  return Promise.resolve();
}