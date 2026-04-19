'use client';

import { doc, getDoc, setDoc, updateDoc, Firestore } from 'firebase/firestore';

/**
 * Adds a product to the user's active cart.
 * Stores essential metadata to avoid extra lookups in the cart view.
 * Ensures data integrity by always updating metadata on quantity change.
 */
export async function addToCart(
  db: Firestore, 
  userId: string, 
  product: { id: string, name: string, basePrice: number, imageUrls: string[], color?: string },
  size: string,
  quantity: number = 1
) {
  // Use a composite ID for unique product/size combinations in the cart
  const cartItemId = `${product.id}_${size}`;
  const itemRef = doc(db, 'users', userId, 'carts', 'active_cart', 'items', cartItemId);
  const itemSnap = await getDoc(itemRef);

  // Extract clean metadata
  const price = Number(product.basePrice) || 0;
  const image = product.imageUrls?.[0] || 'https://picsum.photos/seed/void/400/600';
  const color = product.color || 'UNSPECIFIED';

  if (itemSnap.exists()) {
    const currentQty = itemSnap.data().quantity || 0;
    // Update both quantity AND metadata to ensure consistency
    await updateDoc(itemRef, {
      quantity: currentQty + quantity,
      price: price, // Re-sync in case price changed
      image: image, // Re-sync in case image changed
      color: color, // Re-sync color
      updatedAt: new Date().toISOString()
    });
  } else {
    // Initialize new item with full metadata
    await setDoc(itemRef, {
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
    });
  }
}

/**
 * Removes an item from the cart.
 */
export async function removeFromCart(db: Firestore, userId: string, cartItemId: string) {
  const itemRef = doc(db, 'users', userId, 'carts', 'active_cart', 'items', cartItemId);
  const { deleteDoc } = await import('firebase/firestore');
  await deleteDoc(itemRef);
}
