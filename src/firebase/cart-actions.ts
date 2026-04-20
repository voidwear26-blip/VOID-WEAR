
'use client';

import { doc, getDoc, setDoc, updateDoc, Firestore } from 'firebase/firestore';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';

/**
 * VOID WEAR // BAG SYNCHRONIZATION
 * Adds a product to the user's active cart using the non-blocking protocol.
 * Stores essential metadata to avoid extra lookups in the cart view.
 */
export async function addToCart(
  db: Firestore, 
  userId: string, 
  product: { id: string, name: string, basePrice: number, imageUrls: string[], color?: string },
  size: string,
  quantity: number = 1
) {
  // 1. Establish Unique Module Identifier
  const cartItemId = `${product.id}_${size}_${product.color || 'DEFAULT'}`;
  const itemRef = doc(db, 'users', userId, 'carts', 'active_cart', 'items', cartItemId);
  
  // getDoc MUST be awaited to determine creation vs update path
  const itemSnap = await getDoc(itemRef).catch(error => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: itemRef.path,
      operation: 'get'
    }));
    throw error;
  });

  // Extract clean metadata
  const price = Number(product.basePrice) || 0;
  const image = product.imageUrls?.[0] || 'https://picsum.photos/seed/void/400/600';
  const color = product.color || 'UNSPECIFIED';

  if (itemSnap.exists()) {
    const currentQty = itemSnap.data().quantity || 0;
    const updateData = {
      quantity: currentQty + quantity,
      price: price,
      image: image,
      color: color,
      updatedAt: new Date().toISOString()
    };

    // NON-BLOCKING UPDATE
    updateDoc(itemRef, updateData).catch(async (serverError) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: itemRef.path,
        operation: 'update',
        requestResourceData: updateData,
      }));
    });
  } else {
    const setData = {
      id: cartItemId,
      productId: product.id,
      name: product.name,
      price: price,
      image: image,
      size: size,
      color: color,
      quantity: quantity,
      addedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // NON-BLOCKING SET
    setDoc(itemRef, setData).catch(async (serverError) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: itemRef.path,
        operation: 'create',
        requestResourceData: setData,
      }));
    });
  }
}

/**
 * Removes an item from the cart log.
 */
export async function removeFromCart(db: Firestore, userId: string, cartItemId: string) {
  const itemRef = doc(db, 'users', userId, 'carts', 'active_cart', 'items', cartItemId);
  const { deleteDoc } = await import('firebase/firestore');
  
  deleteDoc(itemRef).catch(async (error) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: itemRef.path,
      operation: 'delete'
    }));
  });
}
