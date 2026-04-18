'use client';

import { doc, getDoc, setDoc, deleteDoc, Firestore } from 'firebase/firestore';
import { updateDocumentNonBlocking } from './non-blocking-updates';

/**
 * Adds a product to the user's active cart.
 * Stores essential metadata to avoid extra lookups in the cart view.
 */
export async function addToCart(
  db: Firestore, 
  userId: string, 
  product: { id: string, name: string, basePrice: number, imageUrls: string[] },
  size: string,
  quantity: number = 1
) {
  // Use a composite ID for unique product/size combinations in the cart
  const cartItemId = `${product.id}_${size}`;
  const itemRef = doc(db, 'users', userId, 'carts', 'active_cart', 'items', cartItemId);
  const itemSnap = await getDoc(itemRef);

  if (itemSnap.exists()) {
    const currentQty = itemSnap.data().quantity || 0;
    updateDocumentNonBlocking(itemRef, {
      quantity: currentQty + quantity
    });
  } else {
    // We use setDoc here as we want to initiate the write
    setDoc(itemRef, {
      id: cartItemId,
      productId: product.id,
      name: product.name,
      price: product.basePrice,
      image: product.imageUrls[0] || 'https://picsum.photos/seed/void/400/600',
      size: size,
      quantity: quantity,
      addedAt: new Date().toISOString()
    });
  }
}

/**
 * Removes an item from the cart.
 */
export async function removeFromCart(db: Firestore, userId: string, cartItemId: string) {
  const itemRef = doc(db, 'users', userId, 'carts', 'active_cart', 'items', cartItemId);
  await deleteDoc(itemRef);
}
