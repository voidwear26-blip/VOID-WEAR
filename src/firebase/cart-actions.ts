
'use client';

import { doc, collection, setDoc, getDoc, Firestore } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from './non-blocking-updates';

/**
 * Adds a product variant to the user's active cart.
 * If the item already exists, it increments the quantity.
 */
export async function addToCart(db: Firestore, userId: string, productId: string, quantity: number = 1) {
  const itemRef = doc(db, 'users', userId, 'carts', 'active_cart', 'items', productId);
  const itemSnap = await getDoc(itemRef);

  if (itemSnap.exists()) {
    const currentQty = itemSnap.data().quantity || 0;
    updateDocumentNonBlocking(itemRef, {
      quantity: currentQty + quantity
    });
  } else {
    setDoc(itemRef, {
      id: productId,
      cartId: 'active_cart',
      productVariantId: productId,
      quantity: quantity,
      addedAt: new Date().toISOString()
    });
  }
}
