'use client';

import { collection, addDoc, Firestore } from 'firebase/firestore';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';

export interface ReviewData {
  id?: string;
  productId: string;
  productName: string;
  userId: string;
  userName: string;
  orderId: string;
  rating: number;
  comment: string;
  createdAt: string;
  isFeatured?: boolean;
  adminReply?: string;
}

/**
 * VOID WEAR // REVIEW SUBMISSION
 * Persists customer feedback to the global reviews collection.
 * Recalibrated to client-side protocol to allow database instance pass-through.
 */
export async function submitReview(db: Firestore, reviewData: ReviewData) {
  const reviewsCol = collection(db, 'reviews');
  
  return addDoc(reviewsCol, reviewData)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: reviewsCol.path,
        operation: 'create',
        requestResourceData: reviewData,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    });
}
