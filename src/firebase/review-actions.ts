
'use client';

import { collection, addDoc, Firestore } from 'firebase/firestore';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';

export interface ReviewData {
  productId: string;
  userId: string;
  userName: string;
  orderId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

/**
 * Submits a new product review.
 */
export function submitReview(db: Firestore, reviewData: ReviewData) {
  const reviewsCol = collection(db, 'reviews');
  
  addDoc(reviewsCol, reviewData)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: reviewsCol.path,
        operation: 'create',
        requestResourceData: reviewData,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
}
