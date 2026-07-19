'use client';

import { doc, setDoc, Firestore } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from './errors';

/**
 * VOID WEAR // CUSTOMER PROFILE SYNCHRONIZATION
 * Persists customer identity metadata to the Firestore database.
 * Optimized for reliability and preventing silent write failures.
 * Integrated with Auto-Collection for Provider metadata.
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

  /**
   * AUTO-COLLECTION PROTOCOL:
   * Prioritizes provider-level (e.g. Google) data for the initial handshake.
   */
  if (!profileData.displayName) {
    profileData.displayName = user.displayName || extraData.displayName || user.email?.split('@')[0].toUpperCase() || 'CUSTOMER';
  }

  // Ensure photo metadata is synchronized if available
  if (user.photoURL && !profileData.photoURL) {
    profileData.photoURL = user.photoURL;
  }
  
  if (extraData.createdAt) {
    profileData.createdAt = extraData.createdAt;
  } else if (!profileData.createdAt) {
     // Setting default creation timestamp for new entities
     profileData.createdAt = new Date().toISOString();
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
