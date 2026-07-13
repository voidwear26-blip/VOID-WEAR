'use client';

import { doc, setDoc, increment, Firestore } from 'firebase/firestore';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';

/**
 * VOID WEAR // BAG SYNCHRONIZATION
 * Optimized for high-speed response by using atomic increments and avoiding pre-reads.
 * Persists product selection with technical metadata.
 */
export async function addToCart(
  db: Firestore, 
  userId: string, 
  product: { id: string, name: string, basePrice: number, originalPrice?: number, imageUrls: string[], color?: string, isTaxable?: boolean },
  size: string,
  quantity: number = 1
) {
  // 1. Establish Unique Module Identifier
  const cartItemId = `${product.id}_${size}_${product.color || 'DEFAULT'}`;
  const itemRef = doc(db, 'users', userId, 'carts', 'active_cart', 'items', cartItemId);
  
  // Extract clean metadata
  const price = Number(product.basePrice) || 0;
  const originalPrice = Number(product.originalPrice) || price;
  const image = product.imageUrls?.[0] || 'https://picsum.photos/seed/void/400/600';
  const color = product.color || 'UNSPECIFIED';
  const isTaxable = product.isTaxable !== false;

  const setData: any = {
    id: cartItemId,
    productId: product.id,
    name: product.name,
    price: price,
    originalPrice: originalPrice,
    image: image,
    size: size,
    color: color,
    isTaxable: isTaxable,
    quantity: increment(quantity), // ATOMIC INCREMENT: Handles creation and updates without pre-read
    updatedAt: new Date().toISOString()
  };

  /**
   * ATOMIC UPSERT PROTOCOL:
   * setDoc with merge: true creates the document if missing or updates specified fields.
   * This is significantly faster as it avoids getDoc network latency.
   */
  return setDoc(itemRef, setData, { merge: true }).catch(async (error) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: itemRef.path,
      operation: 'update',
      requestResourceData: setData,
    }));
    throw error;
  });
}

/**
 * Removes an item from the cart log.
 */
export async function removeFromCart(db: Firestore, userId: string, cartItemId: string) {
  const itemRef = doc(db, 'users', userId, 'carts', 'active_cart', 'items', cartItemId);
  const { deleteDoc } = await import('firebase/firestore');
  
  return deleteDoc(itemRef).catch(async (error) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: itemRef.path,
      operation: 'delete'
    }));
    throw error;
  });
}
