'use client';

import { doc, setDoc, Firestore } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from './errors';

/**
 * VOID WEAR // CUSTOMER PROFILE SYNCHRONIZATION
 * Persists customer identity metadata to the Firestore database.
 * Optimized for reliability and preventing silent write failures.
 */
export async function saveUserToFirestore(db: Firestore, user: User, extraData: any = {}) {
  if (!user || !user.uid) return;

  const userRef = doc(db, 'users', user.uid);
  
  const profileData: any = {
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
    profileData.role = 'ADMIN';
  } else if (!extraData.role) {
    // Standard user role
    profileData.role = 'CUSTOMER';
  }

  // Ensure mandatory fields have values
  if (!profileData.displayName && user.displayName) profileData.displayName = user.displayName;
  if (!profileData.displayName && !user.displayName && !extraData.displayName) {
    profileData.displayName = user.email?.split('@')[0].toUpperCase() || 'CUSTOMER';
  }
  
  if (extraData.createdAt) {
    profileData.createdAt = extraData.createdAt;
  }

  // Perform set with merge protocol. 
  return setDoc(userRef, profileData, { merge: true })
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: userRef.path,
        operation: 'update',
        requestResourceData: profileData,
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    });
}