
'use client';

import { doc, setDoc, Firestore } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from './errors';

/**
 * VOID WEAR // DOSSIER SYNCHRONIZATION
 * Persists user identity metadata to the Firestore database.
 * Optimized for reliability and preventing silent write failures.
 * Uses a pure merge strategy to avoid overwriting existing fields with defaults.
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

  // Only set role and basic info if they don't exist or if explicit master authority
  if (user.email?.toLowerCase() === 'voidwear26@gmail.com') {
    dossierData.role = 'ADMIN';
  }

  // Ensure mandatory fields have values only if they are not already set in extraData
  if (!dossierData.displayName && user.displayName) dossierData.displayName = user.displayName;
  if (!dossierData.displayName && !user.displayName && !extraData.displayName) {
    dossierData.displayName = user.email?.split('@')[0].toUpperCase() || 'OPERATOR';
  }
  
  // Set creation timestamp only if explicitly provided or handled by client
  if (extraData.createdAt) dossierData.createdAt = extraData.createdAt;

  // Perform set with merge protocol. 
  // Non-blocking catch to ensure we don't hang if there's a permission issue
  setDoc(userRef, dossierData, { merge: true })
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: userRef.path,
        operation: 'update',
        requestResourceData: dossierData,
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    });

  return Promise.resolve(); // Allow the caller to continue immediately
}
